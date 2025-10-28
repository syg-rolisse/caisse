import Approvisionnement from '#models/approvisionnement'
import Solde from '#models/solde'
import solde_service from '#services/solde_service'
import {
  createApprovisionnementValidator,
  updateApprovisionnementValidator,
} from '#validators/approvisionnement'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { processErrorMessages } from '../../helpers/remove_duplicate.js'
import appro_service from '#services/appro_service'
import Ws from '#services/ws'

async function emitApproUpdate(companyId: number, eventName: string) {
  if (!companyId) return

  try {
    const { allApprovisionnements, approvisionnements } = await appro_service.fetchAndFormatAppro(
      companyId,
      1,
      10
    )
    const roomName = `company_${companyId}`
    const payload = {
      approvisionnements,
      allApprovisionnements,
      companyId,
    }
    Ws.io?.to(roomName).emit(eventName, payload)
    console.log(`Événement '${eventName}' émis dans le salon '${roomName}'`)
  } catch (error) {
    console.error(`Erreur lors de l'émission du socket '${eventName}':`, error)
  }
}

export default class ApprovisionnementsController {
  async index({ request, response }: HttpContext) {
    try {
      const { page, perpage, companieId } = request.qs()
      const pageNumber = page ? Number.parseInt(page) : 1
      const perPageNumber = perpage ? Number.parseInt(perpage) : 10

      const { allApprovisionnements, approvisionnements } = await appro_service.fetchAndFormatAppro(
        companieId,
        pageNumber,
        perPageNumber
      )
      return response.ok({ approvisionnements, allApprovisionnements })
    } catch (error) {
      console.error('Erreur lors de la récupération des approvisionnements:', error)
      return response.status(500).send({ error: 'Erreur interne du serveur' })
    }
  }

  async solde({ request, response }: HttpContext) {
    try {
      const { companieId } = request.qs()
      const { solde } = await solde_service.fetchAndFormatSolde(companieId)
      return response.ok(solde)
    } catch (error) {
      console.error('Erreur lors de la récupération du solde:', error)
      return response.status(500).send({ error: 'Erreur interne du serveur' })
    }
  }

  public async create({ auth, bouncer, request, response }: HttpContext) {
    const trx = await db.transaction()
    try {
      const user = auth.user!
      await user.load('Profil', (profilQuery) => {
        profilQuery.preload('Permission', (permissionQuery: any) => {
          permissionQuery.where('companie_id', user?.companieId)
        })
      })

      if (await bouncer.with('ApproPolicy').denies('create')) {
        await trx.rollback()
        return response.forbidden("Désolé, vous n'êtes pas autorisé à approvisionner la caisse.")
      }

      const payload = await request.validateUsing(createApprovisionnementValidator)
      const appro = await Approvisionnement.create({ ...payload }, { client: trx })

      let solde = await Solde.query({ client: trx })
        .where({ companieId: payload.companieId })
        .forUpdate()
        .first()

      if (solde) {
        solde.merge({ montant: solde.montant + payload.montant })
        await solde.save()
      } else {
        solde = await Solde.create(
          { companieId: payload.companieId, montant: payload.montant },
          { client: trx }
        )
      }

      await trx.commit()

      await emitApproUpdate(payload.companieId, 'appro_created')

      return response.created({
        appro,
        message: 'Approvisionnement enregistré avec succès.',
      })
    } catch (error) {
      console.error("Erreur lors de la création de l'approvisionnement:", error?.message)
      await trx.rollback()
      const message = processErrorMessages(error)
      return response.badRequest({ status: 400, error: message })
    }
  }

  async show({ request, response }: HttpContext) {
    try {
      const { approvisionnementId } = request.qs()
      if (!approvisionnementId) {
        return response.badRequest({
          status: 400,
          error: "L'identifiant de l'approvisionnement est requis.",
        })
      }
      const approvisionnement = await Approvisionnement.findOrFail(approvisionnementId)
      response.created({ status: 200, approvisionnement })
    } catch (error) {
      const message = processErrorMessages(error)
      return response.badRequest({ status: 400, error: message })
    }
  }

  async update({ auth, bouncer, request, response }: HttpContext) {
    const trx = await db.transaction()
    try {
      const user = auth.user
      await user?.load('Profil', (profilQuery: any) => {
        profilQuery.preload('Permission')
        profilQuery.where('companie_id', user?.companieId)
      })

      if (await bouncer.with('ApproPolicy').denies('update')) {
        await trx.rollback()
        return response.forbidden(
          "Désolé, vous n'êtes pas autorisé à modifier un approvisionnement."
        )
      }

      const { approvisionnementId } = request.qs()
      const approvisionnement = await Approvisionnement.findOrFail(approvisionnementId, {
        client: trx,
      })
      const payload = await request.validateUsing(updateApprovisionnementValidator)

      const solde = await Solde.query({ client: trx })
        .where({ companieId: approvisionnement.companieId })
        .forUpdate()
        .firstOrFail()

      solde.merge({
        montant: solde.montant - approvisionnement.montant + payload.montant,
      })
      await solde.save()

      approvisionnement.merge(payload)
      await approvisionnement.save()

      await trx.commit()

      if (approvisionnement.companieId) {
        await emitApproUpdate(approvisionnement.companieId, 'appro_updated')
      }

      return response.ok({
        status: 200,
        message: 'Approvisionnement modifié avec succès',
      })
    } catch (error) {
      await trx.rollback()
      const message = processErrorMessages(error)
      return response.badRequest({ status: 500, error: message })
    }
  }

  async delete({ auth, bouncer, request, response }: HttpContext) {
    const trx = await db.transaction()
    const { approvisionnementId } = request.qs()

    try {
      const user = auth.user
      await user?.load('Profil', (profilQuery: any) => {
        profilQuery.preload('Permission')
        profilQuery.where('companie_id', user?.companieId)
      })

      if (await bouncer.with('ApproPolicy').denies('delete')) {
        await trx.rollback()
        return response.forbidden(
          "Désolé, vous n'êtes pas autorisé à supprimer un approvisionnement."
        )
      }

      const approvisionnement = await Approvisionnement.findOrFail(approvisionnementId, {
        client: trx,
      })
      const companyId = approvisionnement.companieId

      const solde = await Solde.query({ client: trx })
        .where({ companieId: companyId })
        .forUpdate()
        .firstOrFail()

      if (solde.montant - approvisionnement.montant < 0) {
        await trx.rollback()
        return response.forbidden({
          status: 403,
          message: 'Désolé, le solde de la caisse ne permet pas de supprimer cet approvisionnement',
        })
      }

      solde.merge({ montant: solde.montant - approvisionnement.montant })
      await solde.save()

      await approvisionnement.delete()
      await trx.commit()

      if (companyId) {
        await emitApproUpdate(companyId, 'appro_deleted')
      }

      return response.ok({
        status: 200,
        message: 'Approvisionnement supprimé avec succès',
      })
    } catch (error) {
      await trx.rollback()
      let message = ''
      if (error.code === 'E_ROW_NOT_FOUND') {
        message = approvisionnementId
          ? 'Approvisionnement non retrouvé.'
          : 'Ligne de solde non retrouvée'
      } else {
        message = processErrorMessages(error)
      }
      return response.badRequest({ status: 400, error: message })
    }
  }
}

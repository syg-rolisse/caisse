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
    const trx = await db.transaction() // Utilisation de `db.transaction()`

    try {
      const user = auth.user
      // Préchargez le profil et les permissions de l'utilisateur
      await user?.load('Profil', (profilQuery: any) => {
        profilQuery.preload('Permission')
      })

      // Vérifie si l'utilisateur a l'autorisation  d'approvisionner la caisse
      if (await bouncer.with('ApproPolicy').denies('create')) {
        return response.forbidden("Désolé, vous n'êtes pas autorisé à approvisionner la caisse.")
      }

      const payload = await request.validateUsing(createApprovisionnementValidator)

      // Créer l'approvisionnement avec la transaction
      const appro = await Approvisionnement.create({ ...payload })

      // Récupérer ou créer le solde dans la même transaction
      let solde = await Solde.query().where({ companieId: payload.companieId }).forUpdate().first()

      if (solde) {
        // Si le solde existe, mettre à jour son montant
        solde.merge({ montant: solde.montant + payload.montant })
        await solde.save()
      } else {
        // Si aucun solde n'existe, le créer
        solde = await Solde.create({ companieId: payload.companieId, montant: payload.montant })
      }

      // Commit de la transaction
      await trx.commit()

      return response.created({
        appro,
        message: 'Approvisionnement enregistré avec succès.',
      })
    } catch (error) {
      // Rollback en cas d'erreur
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
      // Préchargez le profil et les permissions de l'utilisateur
      await user?.load('Profil', (profilQuery: any) => {
        profilQuery.preload('Permission')
      })

      // Vérifie si l'utilisateur a l'autorisation  de modifier un approvisionnement
      if (await bouncer.with('ApproPolicy').denies('update')) {
        return response.forbidden(
          "Désolé, vous n'êtes pas autorisé à modifier un approvisionnement."
        )
      }

      const { approvisionnementId } = request.qs()
      const approvisionnement = await Approvisionnement.findOrFail(approvisionnementId)

      // Validation des données
      const payload = await request.validateUsing(updateApprovisionnementValidator)

      // Récupérer le solde unique
      const solde = await Solde.query().forUpdate().firstOrFail()

      if (solde.montant - payload.montant < 0) {
        return response.forbidden({
          status: 403,
          message: "Désolé, le solde de la caisse ne permet pas d'annuler cet approvisionnement",
        })
      }

      // Mettre à jour le solde
      solde.merge({
        montant: solde.montant - approvisionnement.$attributes.montant + payload.montant,
      })
      await solde.save()

      // Mettre à jour l'approvisionnement
      approvisionnement.merge(payload)
      await approvisionnement.save()

      // Commit de la transaction
      await trx.commit()

      return response.ok({
        status: 200,
        message: 'Approvisionnement modifié avec succès',
      })
    } catch (error) {
      // Rollback en cas d'erreur
      await trx.rollback()
      console.log(error.message)

      const message = processErrorMessages(error)
      return response.badRequest({
        status: 500,
        error: message,
      })
    }
  }

  async delete({ auth, bouncer, request, response }: HttpContext) {
    const { approvisionnementId } = request.qs()
    try {
      const user = auth.user
      // Préchargez le profil et les permissions de l'utilisateur
      await user?.load('Profil', (profilQuery: any) => {
        profilQuery.preload('Permission')
      })

      // Vérifie si l'utilisateur a l'autorisation  de modifier un approvisionnement
      if (await bouncer.with('ApproPolicy').denies('delete')) {
        return response.forbidden(
          "Désolé, vous n'êtes pas autorisé à modifier un approvisionnement."
        )
      }

      const approvisionnement = await Approvisionnement.findOrFail(approvisionnementId)

      const solde = await Solde.query().forUpdate().firstOrFail()

      if (solde.montant - approvisionnement.montant < 0) {
        return response.forbidden({
          status: 403,
          message: 'Désolé, le solde de la caisse ne permet pas de supprimer cet approvisionnement',
        })
      }

      // Mettre à jour le solde
      solde.merge({ montant: solde.montant - approvisionnement.montant })
      await solde.save()

      await approvisionnement.delete()
      return response.created({
        approvisionnement,
        status: 200,
        message: 'Approvisionnement supprimé avec succès',
      })
    } catch (error) {
      let message = ''
      console.log(error)

      if (error.code === 'E_ROW_NOT_FOUND') {
        message = approvisionnementId
          ? 'Ligne de solde non retrouvée'
          : 'Approvisionnement non retrouvé.'
      } else {
        message = processErrorMessages(error)
      }

      return response.badRequest({ status: 400, error: message })
    }
  }
}

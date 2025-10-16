import Depense from '#models/depense'
import Mouvement from '#models/mouvement'
import Solde from '#models/solde'
import User from '#models/user'
import { createMouvementValidator, updateMouvementValidator } from '#validators/mouvement'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { processErrorMessages } from '../../helpers/remove_duplicate.js'
import Ws from '#services/ws'
import depense_service from '#services/depense_service'

async function emitDepenseUpdate(companyId: number, eventName: string) {
  if (!companyId) return

  try {
    const { allDepenses, depenses } = await depense_service.fetchAndFormatDepenses(companyId, 1, 10)

    const roomName = `company_${companyId}`
    const payload = {
      depenses,
      allDepenses,
      companyId,
    }

    Ws.io?.to(roomName).emit(eventName, payload)
    console.log(`Événement '${eventName}' émis dans le salon '${roomName}'`)
  } catch (error) {
    console.error(`Erreur lors de l'émission du socket '${eventName}':`, error)
  }
}

export default class MouvementsController {
  public async create({ request, response }: HttpContext) {
    const trx = await db.transaction()

    try {
      const payload = await request.validateUsing(createMouvementValidator)
      const companieId = payload.companieId

      if (!companieId || Number.isNaN(Number(companieId))) {
        return response.badRequest({ error: "Identifiant de l'entreprise non reconnu." })
      }

      const depense = await Depense.query()
        .useTransaction(trx)
        .where({ id: payload.depenseId })
        .preload('user')
        .preload('Mouvements')
        .first()

      if (!depense) {
        await trx.rollback()
        return response.notFound({ error: 'Dépense introuvable.' })
      }

      if (depense.rejeter) {
        await trx.rollback()
        return response.forbidden('Désolé, cette dépense a été rejetée.')
      }

      const totalMouvementMontant = depense.Mouvements.reduce(
        (sum, mouvement) => sum + mouvement.montant,
        0
      )
      const montantTotalApresAjout = totalMouvementMontant + payload.montant

      if (montantTotalApresAjout > depense.montant) {
        await trx.rollback()
        return response.forbidden(
          'Désolé, vous ne pouvez pas décaisser plus que le montant de la dépense.'
        )
      }

      if (montantTotalApresAjout === depense.montant) {
        depense.merge({ status: true })
        await depense.save()
      }

      // @ts-ignore
      delete payload.companieId
      const mouvement = await Mouvement.create({ ...payload }, { client: trx })

      let solde = await Solde.query().useTransaction(trx).where({ companieId }).first()
      if (solde) {
        solde.merge({ montant: solde.montant - payload.montant })
        await solde.save()
      }

      await trx.commit()

      await emitDepenseUpdate(companieId, 'depense_updated')

      return response.created({
        mouvement,
        message: 'Paiement effectué avec succès.',
      })
    } catch (error) {
      await trx.rollback()
      const message = processErrorMessages(error)
      return response.badRequest({ status: 400, error: message })
    }
  }

  public async update({ request, response }: HttpContext) {
    const trx = await db.transaction()

    try {
      const { sortieId } = request.qs()
      const currentMouvement = await Mouvement.findOrFail(sortieId)
      const payload = await request.validateUsing(updateMouvementValidator)

      const depense = await Depense.query()
        .useTransaction(trx)
        .where({ id: payload.depenseId })
        .preload('Mouvements')
        .first()

      if (!depense) {
        await trx.rollback()
        return response.notFound({ error: 'Dépense introuvable.' })
      }

      if (depense.rejeter) {
        await trx.rollback()
        return response.forbidden('Désolé, cette dépense a été rejetée.')
      }

      const totalMouvementMontant = depense.Mouvements.reduce(
        (sum, mouvement) => sum + mouvement.montant,
        0
      )
      const montantTotalApresAjout =
        totalMouvementMontant - currentMouvement.montant + payload.montant

      if (montantTotalApresAjout > depense.montant) {
        await trx.rollback()
        return response.forbidden({
          error: 'Désolé, vous ne pouvez pas décaisser plus que le montant de la dépense.',
        })
      }

      depense.merge({ status: montantTotalApresAjout === depense.montant })
      await depense.save()

      let solde = await Solde.query().useTransaction(trx).forUpdate().first()
      if (solde) {
        solde.merge({ montant: solde.montant + currentMouvement.montant - payload.montant })
        await solde.save()
      }

      currentMouvement.useTransaction(trx)
      currentMouvement.merge(payload)
      await currentMouvement.save()

      await trx.commit()

      if (depense.companieId) {
        await emitDepenseUpdate(depense.companieId, 'depense_updated')
      }

      return response.ok({
        status: 200,
        message: 'Paiement modifié avec succès.',
      })
    } catch (error) {
      await trx.rollback()
      const message = processErrorMessages(error)
      return response.badRequest({ status: 500, error: message })
    }
  }

  async show({ request, response }: HttpContext) {
    try {
      const { sortieId } = request.qs()
      if (!sortieId || Number.isNaN(Number(sortieId))) {
        return response.badRequest({
          status: 400,
          error: "L'identifiant du paiement est requis",
        })
      }
      const depense = await Depense.findOrFail(sortieId)
      response.created({ status: 200, depense })
    } catch (error) {
      const message = processErrorMessages(error)
      return response.badRequest({ status: 400, error: message })
    }
  }

  async delete({ request, response }: HttpContext) {
    const trx = await db.transaction()

    try {
      const { sortieId, userConnectedId } = request.qs()
      const user = await User.findOrFail(userConnectedId)

      if (user.profilId !== 1) {
        await trx.rollback()
        return response.forbidden('Désolé, seule la caisse peut supprimer cet élément.')
      }

      const mouvement = await Mouvement.findOrFail(sortieId)
      const depense = await Depense.findOrFail(mouvement.depenseId)

      if (depense.bloquer) {
        await trx.rollback()
        return response.forbidden("Désolé, Veuillez d'abord débloquer cette dépense.")
      }

      depense.useTransaction(trx)
      depense.merge({ status: false })
      await depense.save()

      mouvement.useTransaction(trx)
      await mouvement.delete()

      let solde = await Solde.query().useTransaction(trx).forUpdate().first()
      if (solde) {
        solde.merge({ montant: solde.montant + mouvement.montant })
        await solde.save()
      }

      await trx.commit()

      if (depense.companieId) {
        await emitDepenseUpdate(depense.companieId, 'depense_updated')
      }

      return response.ok({
        mouvement,
        status: 200,
        message: 'Paiement supprimé avec succès',
      })
    } catch (error) {
      await trx.rollback()
      let message = ''
      if (error.code === 'E_ROW_NOT_FOUND') {
        message = 'Paiement non retrouvé.'
      } else {
        message = processErrorMessages(error)
      }
      return response.badRequest({ status: 400, error: message })
    }
  }
}

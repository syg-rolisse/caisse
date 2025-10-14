import Depense from '#models/depense'
import Mouvement from '#models/mouvement'
import Solde from '#models/solde'
import User from '#models/user'
import { createMouvementValidator, updateMouvementValidator } from '#validators/mouvement'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { processErrorMessages } from '../../helpers/remove_duplicate.js'

export default class MouvementsController {
  public async create({ request, response }: HttpContext) {
    const trx = await db.transaction() // Utilisation de `db.transaction()`

    try {
      const payload = await request.validateUsing(createMouvementValidator)

      const companieId = payload.companieId

      if (!companieId || Number.isNaN(Number(companieId))) {
        return response.ok({
          data: [],
          message: "Identifiant de l'entreprise non reconnu...",
          meta: {
            total: 0,
            per_page: 10,
            current_page: 1,
            last_page: 1,
          },
        })
      }

      const depense = await Depense.query()

        .where({ id: payload.depenseId })
        .preload('user')
        .preload('Mouvements')
        .first()

      if (!depense) {
        return response.notFound({ error: 'Dépense introuvable.' })
      }

      if (depense?.$attributes.rejeter) {
        return response.forbidden('Désolé, cette dépensé a été rejeté.')
      }

      // if (!depense?.$attributes.decharger) {
      //   return response.forbidden(
      //     `Demandez à , ${depense?.user?.fullName} de bien vouloir mettre la décharge.`
      //   )
      // }

      const totalMouvementMontant = depense?.Mouvements.reduce(
        (sum, mouvement) => sum + mouvement.montant,
        0
      )

      const montantTotalApresAjout = totalMouvementMontant + payload.montant

      if (montantTotalApresAjout === depense.montant) {
        depense.merge({ status: true })
        await depense.save()
      } else {
        if (montantTotalApresAjout > depense.montant) {
          return response.forbidden(
            'Désolé, vous ne pouvez pas décaissé plus que le montant de la dépense.'
          )
        }
      }
      // supprimer la companieId de payload
      // @ts-ignore
      delete payload.companieId
      const mouvement = await Mouvement.create({ ...payload }, { client: trx })

      let solde = await Solde.query().where({ companieId }).first()

      if (solde) {
        solde.merge({ montant: solde.montant - payload.montant })
        await solde.save()
      }

      await trx.commit()

      return response.created({
        mouvement,
        message: 'Paiement effectué avec succès.',
      })
    } catch (error) {
      console.log(error?.message)
      // Rollback en cas d'erreur
      await trx.rollback()

      const message = processErrorMessages(error)
      return response.badRequest({ status: 400, error: message })
    }
  }

  public async update({ request, response }: HttpContext) {
    const trx = await db.transaction() // Démarrer la transaction

    try {
      const { sortieId } = request.qs()

      // Trouver le mouvement à modifier
      const currentMouvement = await Mouvement.findOrFail(sortieId)

      // Valider les données entrantes
      const payload = await request.validateUsing(updateMouvementValidator)

      // Charger la dépense associée
      const depense = await Depense.query()
        .where({ id: payload.depenseId })
        .preload('Mouvements')
        .first()

      if (depense?.$attributes.rejeter) {
        return response.forbidden('Désolé, cette dépensé a été rejeté.')
      }

      if (!depense) {
        return response.notFound({ error: 'Dépense introuvable.' })
      }

      // Calcul du montant total après modification
      const totalMouvementMontant = depense.Mouvements.reduce(
        (sum, mouvement) => sum + mouvement.montant,
        0
      )

      const montantTotalApresAjout =
        totalMouvementMontant - currentMouvement.$attributes.montant + payload.montant

      if (montantTotalApresAjout === depense.montant) {
        depense.useTransaction(trx) // Associer la transaction
        depense.merge({ status: true })
        await depense.save()
      } else if (montantTotalApresAjout > depense.montant) {
        return response.forbidden({
          error: 'Désolé, vous ne pouvez pas décaissé plus que le montant de la dépense.',
        })
      } else {
        depense.useTransaction(trx) // Associer la transaction
        depense.merge({ status: false })
        await depense.save()
      }

      let solde = await Solde.query().forUpdate().first()

      if (solde) {
        solde.merge({
          montant: solde.montant + currentMouvement.$attributes.montant - payload.montant,
        })
        await solde.save()
      }

      // Mettre à jour le mouvement
      currentMouvement.useTransaction(trx) // Associer la transaction
      currentMouvement.merge(payload)
      await currentMouvement.save()

      // Commit de la transaction
      await trx.commit()

      return response.ok({
        status: 200,
        message: 'Paiement modifié avec succès.',
      })
    } catch (error) {
      // Rollback en cas d'erreur
      await trx.rollback()
      const message = processErrorMessages(error)
      return response.badRequest({ status: 500, error: message })
    }
  }

  async show({ request, response }: HttpContext) {
    try {
      const { sortieId } = request.qs()

      console.log(request.qs())

      if (!sortieId || Number.isNaN(Number(sortieId))) {
        return response.badRequest({
          status: 400,
          error: "L'identifiant du paiement est requis",
        })
      }
      console.log(sortieId)

      const depense = await Depense.findOrFail(sortieId)

      response.created({ status: 200, depense })
    } catch (error) {
      const message = processErrorMessages(error)
      return response.badRequest({ status: 400, error: message })
    }
  }

  async delete({ request, response }: HttpContext) {
    const trx = await db.transaction() // Démarrer la transaction

    try {
      const { sortieId, userConnectedId } = request.qs()

      // Trouver l'utilisateur connecté
      const user = await User.findOrFail(userConnectedId)

      // Vérifier les permissions
      if (user.$attributes.profilId !== 1) {
        return response.forbidden('Désolé, seule la caisse peut supprimer cet élément.')
      }

      // Trouver le mouvement à supprimer
      const mouvement = await Mouvement.findOrFail(sortieId)

      // Trouver la dépense associée
      const depense = await Depense.findOrFail(mouvement.$attributes.depenseId)

      if (!depense) {
        return response.notFound({ error: 'Dépense introuvable.' })
      }

      if (depense.$attributes.bloquer) {
        return response.forbidden("Désolé, Veuillez d'abord débloquer cette dépense.")
      }

      // Mettre à jour le statut de la dépense
      depense.useTransaction(trx) // Associer la transaction
      depense.merge({ status: false })
      await depense.save()

      // Supprimer le mouvement
      mouvement.useTransaction(trx) // Associer la transaction
      await mouvement.delete()

      let solde = await Solde.query().forUpdate().first()

      if (solde) {
        solde.merge({ montant: solde.montant + mouvement?.montant })
        await solde.save()
      }

      await trx.commit()

      // Commit de la transaction
      await trx.commit()

      return response.created({
        mouvement,
        status: 200,
        message: 'Paiement supprimé avec succès',
      })
    } catch (error) {
      // Rollback en cas d'erreur
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

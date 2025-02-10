import Depense from '#models/depense'
import User from '#models/user'
import { createDepenseValidator, updateDepenseValidator } from '#validators/depense'
import { cuid } from '@adonisjs/core/helpers'
import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import { processErrorMessages } from '../../helpers/remove_duplicate.js'
export default class DepensesController {
  async index({ request, response }: HttpContext) {
    try {
      const { page, perpage, companieId } = request.qs()

      // Vérification que companieId est présent et est un nombre valide
      if (!companieId || Number.isNaN(Number(companieId))) {
        return response.ok({
          data: [],
          message: "Identifiant de l'entreprise non reconnu...",
          meta: {
            total: 0,
            per_page: perpage || 10,
            current_page: page || 1,
            last_page: 1,
          },
        })
      }

      const pageNumber = page ? Number.parseInt(page) : 1
      const perPageNumber = perpage ? Number.parseInt(perpage) : 10

      const query = Depense.query()
        .where({ companieId })
        .preload('user')
        .preload('typeDeDepense')
        .preload('Mouvements')
      const allDepenses = await query.orderBy('id', 'desc')
      const depenses = await query.orderBy('id', 'desc').paginate(pageNumber, perPageNumber)

      return response.ok({ depenses, allDepenses })
    } catch (error) {
      console.error('Erreur lors de la récupération des Type De Depense:', error)
      return response.status(500).send({ error: 'Erreur interne du serveur' })
    }
  }

  public async create({ auth, bouncer, request, response }: HttpContext) {
    try {
      const userConnected = auth.user

      const facture = request.file('facture')
      let factureUrl

      if (facture) {
        const uniqueId = cuid() // Générer un identifiant unique
        const fileName = `${uniqueId}.${facture?.clientName}`
        // Créer le nom de fichier avec l'extension
        await facture?.move(app.makePath('uploads/facture'), {
          name: fileName,
          overwrite: true,
        })
        factureUrl = `facture/${fileName}`
      }

      await userConnected?.load('Profil', (profilQuery: any) => {
        profilQuery.preload('Permission')
      })

      if (await bouncer.with('DepensePolicy').denies('create')) {
        return response.forbidden("Désolé, vous n'êtes pas autorisé à ajouter une dépense.")
      }

      const payload = await request.validateUsing(createDepenseValidator)

      const depense = await Depense.create({ ...payload, factureUrl: factureUrl })

      return response.created({
        depense,
        message: 'Dépense enregistrée avec succès.',
      })
    } catch (error) {
      const message = processErrorMessages(error)
      return response.badRequest({ status: 400, error: message })
    }
  }

  async show({ request, response }: HttpContext) {
    try {
      const { depenseId } = request.qs()

      if (!depenseId) {
        return response.badRequest({
          status: 400,
          error: "L'identifiant du  de depense est requis.",
        })
      }

      const depense = await Depense.findOrFail(depenseId)

      response.created({ status: 200, depense })
    } catch (error) {
      const message = processErrorMessages(error)
      return response.badRequest({ status: 400, error: message })
    }
  }

  async constat({ request, response }: HttpContext) {
    try {
      const { depenseId, userConnectedId } = request.qs()

      const user = await User.findOrFail(userConnectedId)

      const depense = await Depense.findOrFail(depenseId)

      if (user.$attributes.profilId !== 1) {
        return response.forbidden("Désolé, Seulement l'admin peut constater une dépense.")
      }

      const payload = await request.validateUsing(updateDepenseValidator)

      depense.merge(payload)
      await depense.save()

      return response.created({ status: 200, message: 'Dépense modifié avec succès' })
    } catch (error) {
      const message = processErrorMessages(error)
      return response.badRequest({ status: 500, error: message })
    }
  }

  async update({ auth, bouncer, request, response }: HttpContext) {
    try {
      const { depenseId, userConnectedId } = request.qs()
      const userConnected = auth.user

      await userConnected?.load('Profil', (profilQuery: any) => {
        profilQuery.preload('Permission')
      })

      if (await bouncer.with('DepensePolicy').denies('update')) {
        return response.forbidden("Désolé, vous n'êtes pas autorisé à modifier une dépense.")
      }

      if (await bouncer.with('SortiePolicy').denies('decharge')) {
        return response.forbidden("Désolé, vous n'êtes pas autorisé à mettre une décharge.")
      }
      // Récupérer l'utilisateur connecté
      const user = await User.findOrFail(userConnectedId)

      // Récupérer la dépense avec les mouvements associés
      const depense = await Depense.query().where({ id: depenseId }).preload('Mouvements').first()

      const facture = request.file('facture')
      let factureUrl

      if (facture) {
        const uniqueId = cuid() // Générer un identifiant unique
        const fileName = `${uniqueId}.${facture?.clientName}`
        // Créer le nom de fichier avec l'extension
        await facture?.move(app.makePath('uploads/facture'), {
          name: fileName,
          overwrite: true,
        })
        factureUrl = `facture/${fileName}`
      } else {
        factureUrl = depense?.$attributes.factureUrl
      }

      // Vérifier si la dépense est bloquée
      if (depense?.$attributes.bloquer) {
        return response.forbidden('Désolé, cette dépense ne peut plus être modifiée.')
      }

      if (depense?.$attributes.rejeter) {
        return response.forbidden("Désolé, cette dépense n'a pas été approuvée.")
      }

      if (user.$attributes.profilId !== depense?.$attributes?.userId) {
        return response.forbidden(
          "Désolé, vous n'avez pas enregistré cette dépense, vous ne pouvez pas la modifier"
        )
      }

      const payload = await request.validateUsing(updateDepenseValidator)

      if (depense?.Mouvements && depense?.Mouvements.length > 0) {
        return response.forbidden(
          'Désolé, le décaissement est déjà engagé, elle ne peut être modifiée.'
        )
      }

      // Fusionner les données de la requête avec la dépense existante
      depense?.merge({ ...payload, factureUrl: factureUrl })

      // Sauvegarder la dépense mise à jour
      await depense?.save()

      return response.created({ status: 200, message: 'Dépense modifiée avec succès' })
    } catch (error) {
      const message = processErrorMessages(error)
      return response.badRequest({ status: 500, error: message })
    }
  }

  async delete({ auth, bouncer, request, response }: HttpContext) {
    try {
      const userConnected = auth.user

      await userConnected?.load('Profil', (profilQuery: any) => {
        profilQuery.preload('Permission')
      })

      if (await bouncer.with('DepensePolicy').denies('delete')) {
        return response.forbidden("Désolé, vous n'êtes pas autorisé à supprimer une dépense.")
      }

      const { depenseId, userConnectedId } = request.qs()

      // Récupérer l'utilisateur connecté
      const user = await User.findOrFail(userConnectedId)

      // Récupérer la dépense avec les mouvements associés
      const depense = await Depense.query().where({ id: depenseId }).preload('Mouvements').first()

      // Vérifier que l'utilisateur est bien celui qui a enregistré la dépense
      if (user.$attributes.profilId !== depense?.$attributes?.userId) {
        return response.forbidden(
          "Désolé, vous n'avez pas enregistré cette dépense, vous ne pouvez pas la supprimer."
        )
      }

      // Vérifier si la dépense est bloquée
      if (depense?.$attributes.bloquer) {
        return response.forbidden(`Désolé, vous ne pouvez plus supprimer cette dépense.`)
      }

      // Vérifier si la dépense a des mouvements associés
      if (depense?.Mouvements && depense?.Mouvements.length > 0) {
        return response.forbidden(
          'Désolé, le décaissement est déjà engagé, elle ne peut être supprimée.'
        )
      }

      // Supprimer la dépense
      await depense?.delete()

      return response.created({
        depense,
        status: 200,
        message: 'Dépense supprimée avec succès',
      })
    } catch (error) {
      let message = ''
      if (error.code === 'E_ROW_NOT_FOUND') {
        message = 'Dépense non trouvée.'
      } else {
        message = processErrorMessages(error)
      }

      return response.badRequest({ status: 400, error: message })
    }
  }

  async bloquer({ auth, bouncer, request, response }: HttpContext) {
    try {
      const { depenseId, bloquer } = request.qs()
      const user = auth.user

      await user?.load('Profil', (profilQuery: any) => {
        profilQuery.preload('Permission')
      })

      if (await bouncer.with('SortiePolicy').denies('bloque')) {
        return response.forbidden("Désolé, vous n'êtes pas autorisé à bloquer une dépense.")
      }

      // Rechercher la dépense et précharger l'utilisateur
      const depense = await Depense.query().where({ id: depenseId }).preload('user').first()

      if (!depense) {
        return response.notFound('Dépense non trouvée.')
      }

      // Vérifier si la dépense a été rejetée
      if (depense?.rejeter) {
        return response.forbidden("Désolé, cette dépense n'a pas été approuvée.")
      }

      if (JSON.parse(bloquer) && !depense?.decharger) {
        return response.forbidden(`Désolé, ${depense?.user?.fullName} n\'a pas mis la décharge.`)
      }

      if (JSON.parse(bloquer) && !depense?.status) {
        return response.forbidden(`Désolé, cette dépense n'est pas encore réglée.`)
      }

      // Mise à jour de la dépense
      depense?.merge({ bloquer: JSON.parse(bloquer) })
      await depense?.save()

      return response.created({
        depense,
        status: 200,
        message: JSON.parse(bloquer)
          ? 'Dépense bloquée avec succès'
          : 'Dépense débloquée avec succès.',
      })
    } catch (error) {
      console.log(error.message)

      let message = ''
      if (error.code === 'E_ROW_NOT_FOUND') {
        message = 'Dépense non retrouvée.'
      } else {
        message = processErrorMessages(error)
      }

      return response.badRequest({ status: 400, error: message })
    }
  }

  async rejeter({ auth, bouncer, request, response }: HttpContext) {
    try {
      const user = auth.user

      await user?.load('Profil', (profilQuery: any) => {
        profilQuery.preload('Permission')
      })

      if (await bouncer.with('SortiePolicy').denies('reject')) {
        return response.forbidden("Désolé, vous n'êtes pas autorisé à rejeter une dépense.")
      }
      const { depenseId, rejetMessage, rejeter } = request.qs()

      //userConnectedId const user = await User.findOrFail(userConnectedId)

      const depense = await Depense.query().where({ id: depenseId }).preload('Mouvements').first()

      if (depense?.Mouvements && depense?.Mouvements.length > 0) {
        return response.forbidden(
          'Désolé, le décaissement est déjà engagé, elle ne peut être rejetée.'
        )
      }

      depense?.merge({ rejetMessage: rejetMessage, rejeter: JSON.parse(rejeter) })
      await depense?.save()

      return response.created({
        depense,
        status: 200,
        message: JSON.parse(rejeter) ? 'Dépense rejetée avec succès' : 'Rejet annulé avec succès.',
      })
    } catch (error) {
      let message = ''
      if (error.code === 'E_ROW_NOT_FOUND') {
        message = 'Dépense non trouvée.'
      } else {
        message = processErrorMessages(error)
      }

      // Retour d'erreur
      return response.badRequest({ status: 400, error: message })
    }
  }
}

import Depense from '#models/depense'
import User from '#models/user'
import { createDepenseValidator, updateDepenseValidator } from '#validators/depense'
import { cuid } from '@adonisjs/core/helpers'
import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import { processErrorMessages } from '../../helpers/remove_duplicate.js'
import depense_service from '#services/depense_service'
import Ws from '#services/ws'

function emitDepenseUpdate(companyId: number, eventName: string) {
  if (!companyId) return

  try {
    const roomName = `company_${companyId}`
    Ws.io?.to(roomName).emit(eventName)
    console.log(`Signal '${eventName}' émis dans le salon '${roomName}'`)
  } catch (error) {
    console.error(`Erreur lors de l'émission du signal socket '${eventName}':`, error)
  }
}

export default class DepensesController {
  // index() et create() étaient déjà corrects, pas de changement majeur
  async index({ request, response }: HttpContext) {
    try {
      const { page, perpage, companieId, userId, dateDebut, dateFin } = request.qs()

      const pageNumber = page ? Number.parseInt(page) : 1
      const perPageNumber = perpage ? Number.parseInt(perpage) : 10

      const { allDepenses, depenses } = await depense_service.fetchAndFormatDepenses(
        companieId,
        pageNumber,
        perPageNumber,
        userId,
        dateDebut,
        dateFin
      )

      return response.ok({ depenses, allDepenses })
    } catch (error) {
      console.error('Erreur lors de la récupération des dépenses:', error)
      return response.status(500).send({ error: 'Erreur interne du serveur' })
    }
  }

  public async create({ auth, bouncer, request, response }: HttpContext) {
    try {
      const userConnected = auth.user
      const facture = request.file('facture')
      let factureUrl

      if (facture) {
        const uniqueId = cuid()
        const fileName = `${uniqueId}.${facture?.clientName}`
        await facture?.move(app.makePath('uploads/facture'), { name: fileName, overwrite: true })
        factureUrl = `facture/${fileName}`
      }

      await userConnected?.load('Profil', (profilQuery) => {
        profilQuery.preload('Permission', (permissionQuery: any) => {
          permissionQuery.where('companie_id', userConnected.companieId)
        })
      })
      if (await bouncer.with('DepensePolicy').denies('create')) {
        return response.forbidden("Désolé, vous n'êtes pas autorisé à ajouter une dépense.")
      }

      const payload = await request.validateUsing(createDepenseValidator)
      const depense = await Depense.create({ ...payload, factureUrl: factureUrl })

      if (depense.companieId) {
        emitDepenseUpdate(depense.companieId, 'depense_created')
      }

      return response.created({
        depense,
        message: 'Dépense enregistrée avec succès.',
      })
    } catch (error) {
      const message = processErrorMessages(error)
      return response.badRequest({ status: 400, error: message })
    }
  }

  // show() reste inchangé

  async show({ request, response }: HttpContext) {
    try {
      const { depenseId } = request.qs()
      if (!depenseId) {
        return response.badRequest({
          status: 400,
          error: "L'identifiant du de depense est requis.",
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

      await emitDepenseUpdate(depense.companieId, 'depense_updated')

      return response.created({ status: 200, message: 'Dépense modifié avec succès' })
    } catch (error) {
      const message = processErrorMessages(error)
      return response.badRequest({ status: 500, error: message })
    }
  }

  // update() avec les corrections
  async update({ auth, bouncer, request, response }: HttpContext) {
    try {
      const { depenseId, userConnectedId } = request.qs()
      const userConnected = auth.user
      await userConnected?.load('Profil', (profilQuery) => {
        profilQuery.preload('Permission', (permissionQuery: any) => {
          permissionQuery.where('companie_id', userConnected.companieId)
        })
      })
      if (await bouncer.with('DepensePolicy').denies('update')) {
        return response.forbidden("Désolé, vous n'êtes pas autorisé à modifier une dépense.")
      }
      // if (await bouncer.with('SortiePolicy').denies('decharge')) {
      //   return response.forbidden("Désolé, vous n'êtes pas autorisé à mettre une décharge.")
      // }
      const user = await User.findOrFail(userConnectedId)

      // GUARD CLAUSE: Vérifier que la dépense existe
      const depense = await Depense.query().where({ id: depenseId }).preload('Mouvements').first()
      if (!depense) {
        return response.notFound({ error: 'Dépense non trouvée' })
      }

      const facture = request.file('facture')
      let factureUrl
      if (facture) {
        const uniqueId = cuid()
        const fileName = `${uniqueId}.${facture?.clientName}`
        await facture?.move(app.makePath('uploads/facture'), { name: fileName, overwrite: true })
        factureUrl = `facture/${fileName}`
      } else {
        factureUrl = depense.factureUrl
      }
      if (depense.bloquer) {
        return response.forbidden('Désolé, cette dépense ne peut plus être modifiée.')
      }
      if (depense.rejeter) {
        return response.forbidden("Désolé, cette dépense n'a pas été approuvée.")
      }
      if (user.id !== depense.userId) {
        return response.forbidden(
          "Désolé, vous n'avez pas enregistré cette dépense, vous ne pouvez pas la modifier"
        )
      }
      const payload = await request.validateUsing(updateDepenseValidator)
      if (depense.Mouvements && depense.Mouvements.length > 0 && depense.decharger) {
        return response.forbidden(
          'Désolé, le décaissement est déjà engagé, elle ne peut être modifiée.'
        )
      }
      depense.merge({ ...payload, factureUrl: factureUrl })
      await depense.save()

      // EMISSION SÉCURISÉE: Vérifier que companyId existe avant d'émettre
      if (depense.companieId) {
        await emitDepenseUpdate(depense.companieId, 'depense_updated')
      }

      return response.created({ status: 200, message: 'Dépense modifiée avec succès' })
    } catch (error) {
      const message = processErrorMessages(error)
      return response.badRequest({ status: 500, error: message })
    }
  }

  // delete() avec les corrections
  async delete({ auth, bouncer, request, response }: HttpContext) {
    try {
      const userConnected = auth.user
      await userConnected?.load('Profil', (profilQuery) => {
        profilQuery.preload('Permission', (permissionQuery: any) => {
          permissionQuery.where('companie_id', userConnected.companieId)
        })
      })

      if (await bouncer.with('DepensePolicy').denies('delete')) {
        return response.forbidden("Vous n'êtes pas autorisé à supprimer cette dépense.")
      }
      const { depenseId, userConnectedId } = request.qs()
      const user = await User.findOrFail(userConnectedId)

      // GUARD CLAUSE: Vérifier que la dépense existe
      const depense = await Depense.query()
        .where({ id: depenseId })
        .preload('user')
        .preload('Mouvements')
        .first()

      if (!depense) {
        return response.notFound({ status: 404, error: 'Dépense introuvable' })
      }

      if (user.id !== depense.user.id) {
        return response.forbidden('Vous ne pouvez pas supprimer cette dépense.')
      }
      if (depense.bloquer) {
        return response.forbidden('Cette dépense est bloquée et ne peut pas être supprimée.')
      }
      if (depense.Mouvements.length > 0) {
        return response.forbidden('Le décaissement est déjà engagé, elle ne peut être supprimée.')
      }

      // Sauvegarder l'ID de la compagnie AVANT de supprimer
      const companyId = depense.companieId
      await depense.delete()

      // EMISSION SÉCURISÉE: Vérifier que companyId existe avant d'émettre
      if (companyId) {
        await emitDepenseUpdate(companyId, 'depense_deleted')
      }

      return response.ok({ status: 200, message: 'Dépense supprimée avec succès' })
    } catch (error) {
      console.error(error)
      const message =
        error.code === 'E_ROW_NOT_FOUND' ? 'Dépense non trouvée.' : processErrorMessages(error)
      return response.badRequest({ status: 400, error: message })
    }
  }

  // bloquer() avec les corrections
  async bloquer({ auth, bouncer, request, response }: HttpContext) {
    try {
      const { depenseId, bloquer } = request.qs()
      const user = auth.user
      await user?.load('Profil', (profilQuery) => {
        profilQuery.preload('Permission', (permissionQuery: any) => {
          permissionQuery.where('companie_id', user?.companieId)
        })
      })
      if (await bouncer.with('SortiePolicy').denies('bloque')) {
        return response.forbidden("Désolé, vous n'êtes pas autorisé à bloquer une dépense.")
      }

      // GUARD CLAUSE: Vérifier que la dépense existe
      const depense = await Depense.query().where({ id: depenseId }).preload('user').first()
      if (!depense) {
        return response.notFound({ error: 'Dépense non trouvée.' })
      }

      if (depense.rejeter) {
        return response.forbidden("Désolé, cette dépense n'a pas été approuvée.")
      }
      if (JSON.parse(bloquer) && !depense.decharger) {
        return response.forbidden(`Désolé, ${depense.user.fullName} n'a pas mis la décharge.`)
      }
      if (JSON.parse(bloquer) && !depense.status) {
        return response.forbidden(`Désolé, cette dépense n'est pas encore réglée.`)
      }

      depense.merge({ bloquer: JSON.parse(bloquer) })
      await depense.save()

      // EMISSION SÉCURISÉE: Vérifier que companyId existe avant d'émettre
      if (depense.companieId) {
        await emitDepenseUpdate(depense.companieId, 'depense_updated')
      }

      return response.created({
        depense,
        status: 200,
        message: JSON.parse(bloquer)
          ? 'Dépense bloquée avec succès'
          : 'Dépense débloquée avec succès.',
      })
    } catch (error) {
      let message = ''
      if (error.code === 'E_ROW_NOT_FOUND') {
        message = 'Dépense non retrouvée.'
      } else {
        message = processErrorMessages(error)
      }
      return response.badRequest({ status: 400, error: message })
    }
  }

  // rejeter() avec les corrections
  async rejeter({ auth, bouncer, request, response }: HttpContext) {
    try {
      const user = auth.user
      await user?.load('Profil', (profilQuery) => {
        profilQuery.preload('Permission', (permissionQuery: any) => {
          permissionQuery.where('companie_id', user?.companieId)
        })
      })
      if (await bouncer.with('SortiePolicy').denies('reject')) {
        return response.forbidden("Désolé, vous n'êtes pas autorisé à rejeter une dépense.")
      }
      const { depenseId } = request.qs()
      const { rejetMessage, rejeter } = request.body()

      // GUARD CLAUSE: Vérifier que la dépense existe
      const depense = await Depense.query().where({ id: depenseId }).preload('Mouvements').first()
      if (!depense) {
        return response.notFound({ error: 'Dépense non trouvée.' })
      }

      if (depense.Mouvements && depense.Mouvements.length > 0) {
        return response.forbidden(
          'Désolé, le décaissement est déjà engagé, elle ne peut être rejetée.'
        )
      }
      depense.merge({ rejetMessage: rejetMessage, rejeter: JSON.parse(rejeter) })
      await depense.save()

      // EMISSION SÉCURISÉE: Vérifier que companyId existe avant d'émettre
      if (depense.companieId) {
        await emitDepenseUpdate(depense.companieId, 'depense_updated')
      }

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
      return response.badRequest({ status: 400, error: message })
    }
  }
}

import type { HttpContext } from '@adonisjs/core/http'
import { processErrorMessages } from '../../helpers/remove_duplicate.js'
import Pack from '#models/pack'
import { createPackValidator, updatePackValidator } from '#validators/pack'
import pack_service from '#services/pack_service'
import Ws from '#services/ws'

// Fonction helper modifiée pour un broadcast global
async function emitPackUpdate(eventName: string) {
  try {
    // On récupère les données mises à jour (sans filtre companyId)
    const { packs } = await pack_service.fetchAndFormatPacks()

    const payload = {
      packs,
    }

    // Ws.io?.emit() envoie à tous les clients connectés
    Ws.io?.emit(eventName, payload)
  } catch (error) {
    console.error(`Erreur lors de l'émission du socket global '${eventName}':`, error)
  }
}

export default class PacksController {
  async index({ response }: HttpContext) {
    try {
      const { packs } = await pack_service.fetchAndFormatPacks()
      return response.ok({ packs })
    } catch (error) {
      console.error('Erreur lors de la récupération des Packs:', error)
      return response.status(500).send({ error: 'Erreur interne du serveur' })
    }
  }

  public async create({ request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(createPackValidator)
      const pack = await Pack.create(payload)

      await emitPackUpdate('pack_created')

      return response.created({
        pack,
        message: 'Pack enregistré avec succès.',
      })
    } catch (error) {
      console.error('Erreur lors de la création du pack:', error?.message)
      const message = processErrorMessages(error)
      return response.badRequest({ status: 400, error: message })
    }
  }

  async show({ request, response }: HttpContext) {
    try {
      const { packId } = request.qs()
      if (!packId) {
        return response.badRequest({
          status: 400,
          error: "L'identifiant du pack est requis.",
        })
      }
      const pack = await Pack.findOrFail(packId)
      return response.ok({ status: 200, pack })
    } catch (error) {
      const message = processErrorMessages(error)
      return response.badRequest({ status: 400, error: message })
    }
  }

  async update({ request, response }: HttpContext) {
    try {
      const { packId } = request.qs()
      const pack = await Pack.findOrFail(packId)
      const payload = await request.validateUsing(updatePackValidator)

      pack.merge(payload)
      await pack.save()

      await emitPackUpdate('pack_updated')

      return response.ok({ status: 200, message: 'Pack modifié avec succès' })
    } catch (error) {
      const message = processErrorMessages(error)
      return response.badRequest({ status: 500, error: message })
    }
  }

  async delete({ request, response }: HttpContext) {
    try {
      const { packId } = request.qs()

      const pack = await Pack.query().where('id', packId).preload('Abonnement').firstOrFail()
      if (pack.Abonnement && pack.Abonnement.length > 0) {
        return response.forbidden({
          status: 403,
          error: 'Ce pack ne peut pas être supprimé car il est lié à un ou plusieurs abonnements.',
        })
      }

      await pack.delete()

      await emitPackUpdate('pack_deleted')

      return response.ok({
        status: 200,
        message: 'Pack supprimé avec succès',
      })
    } catch (error) {
      let message = ''
      if (error.code === 'E_ROW_NOT_FOUND') {
        message = 'Pack non retrouvé.'
      } else {
        console.error('Erreur lors de la suppression du pack:', error)
        message = processErrorMessages(error)
      }
      return response.badRequest({ status: 400, error: message })
    }
  }
}

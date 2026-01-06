import type { HttpContext } from '@adonisjs/core/http'
import { processErrorMessages } from '../../helpers/remove_duplicate.js'
import { renewAbonnementValidator } from '#validators/abonnement'
import abonnement_service from '#services/abonnement_service'
import Ws from '#services/ws'
import Abonnement from '#models/abonnement'
import Pack from '#models/pack'
import { DateTime } from 'luxon'

// Fonction helper pour notifier les clients d'une mise à jour
async function emitAbonnementUpdate(companyId: number, eventName: string) {
  if (!companyId) return

  try {
    const { abonnements } = await abonnement_service.fetchAndFormatAbonnements(companyId)

    const roomName = `company_${companyId}`
    const payload = {
      abonnements,
      companyId,
    }

    Ws.io?.to(roomName).emit(eventName, payload)
    console.log(`Événement '${eventName}' émis dans le salon '${roomName}'`)
  } catch (error) {
    console.error(`Erreur lors de l'émission du socket '${eventName}':`, error)
  }
}

export default class AbonnementsController {
  /**
   * Récupère la liste des abonnements pour une compagnie.
   */
  async index({ request, response }: HttpContext) {
    try {
      const { companieId } = request.qs()
      if (!companieId) {
        return response.badRequest({ error: "L'identifiant de l'entreprise est requis." })
      }

      const { abonnements } = await abonnement_service.fetchAndFormatAbonnements(companieId)
      return response.ok({ abonnements })
    } catch (error) {
      return response.status(500).send({ error: 'Erreur interne du serveur' })
    }
  }

  /**
   * Renouvelle un abonnement existant ou en crée un nouveau si aucun n'existe.
   */
  async renouveler({ auth, request, response }: HttpContext) {
    try {
      const userConnected = auth.user

      await userConnected?.load('Profil')

      if (
        userConnected?.Profil?.wording !== 'Superadmin' &&
        userConnected?.Profil?.wording !== 'Admin'
      ) {
        return response.forbidden({
          error: 'Désolé, seul un administrateur peut ajouter un abonnement...',
        })
      }

      const { companieId } = request.qs()
      if (!companieId) {
        return response.badRequest({ error: "L'identifiant de l'entreprise est requis." })
      }

      const payload = await request.validateUsing(renewAbonnementValidator)
      const selectedPack = await Pack.findOrFail(payload.packId)

      const previousAbonnement = await Abonnement.query()
        .where('companieId', companieId)
        .orderBy('dateFin', 'desc')
        .first()

      let dateDebut: DateTime

      if (previousAbonnement) {
        // Si un abonnement existe, le nouveau commence à la fin du précédent ou aujourd'hui (la date la plus tardive)
        const today = DateTime.now()
        dateDebut = DateTime.max(previousAbonnement.dateFin, today)
      } else {
        // S'il n'y a aucun abonnement, le nouveau commence maintenant
        dateDebut = DateTime.now()
      }

      const dateFin = dateDebut.plus({ days: selectedPack.duree })

      // Création d'un NOUVEL enregistrement d'abonnement
      const newAbonnement = await Abonnement.create({
        companieId: Number(companieId),
        packId: selectedPack.id,
        userId: payload.userId,
        packLibelle: selectedPack.libelle,
        packDescription: selectedPack.description,
        packMontant: selectedPack.montant,
        dateDebut: dateDebut,
        dateFin: dateFin,
      })

      await emitAbonnementUpdate(companieId, 'abonnement_updated')

      return response.ok({
        abonnement: newAbonnement,
        message: 'Abonnement renouvelé avec succès.',
      })
    } catch (error) {
      console.log(error)
      const message = processErrorMessages(error)
      return response.badRequest({ status: 400, error: message })
    }
  }
}

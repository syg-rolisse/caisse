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
      console.error('Erreur lors de la récupération des Abonnements:', error)
      return response.status(500).send({ error: 'Erreur interne du serveur' })
    }
  }

  /**
   * Renouvelle un abonnement existant ou en crée un nouveau si aucun n'existe.
   */
  async renouveler({ request, response }: HttpContext) {
    try {
      const { companieId } = request.qs()
      if (!companieId) {
        return response.badRequest({ error: "L'identifiant de l'entreprise est requis." })
      }

      const payload = await request.validateUsing(renewAbonnementValidator)

      // 1. Récupérer les informations du pack sélectionné
      const selectedPack = await Pack.findOrFail(payload.packId)

      // 2. Calculer les nouvelles dates
      const dateDebut = DateTime.now()
      const dateFin = dateDebut.plus({ days: selectedPack.duree })

      // 3. Chercher un abonnement existant pour cette compagnie ou en créer un nouveau
      const abonnement = await Abonnement.firstOrNew(
        { companieId: companieId }, // Critère de recherche
        { userId: payload.userId } // Données à utiliser si un nouvel enregistrement est créé
      )

      // 4. Fusionner les nouvelles informations
      abonnement.merge({
        packId: selectedPack.id,
        userId: payload.userId,
        packLibelle: selectedPack.libelle,
        packDescription: selectedPack.description,
        packMontant: selectedPack.montant,
        dateDebut: dateDebut,
        dateFin: dateFin,
        statut: true, // Un renouvellement active l'abonnement
      })

      // 5. Sauvegarder l'abonnement (crée ou met à jour)
      await abonnement.save()

      // 6. Émettre l'événement socket
      await emitAbonnementUpdate(companieId, 'abonnement_updated')

      return response.ok({
        abonnement,
        message: 'Abonnement renouvelé avec succès.',
      })
    } catch (error) {
      const message = processErrorMessages(error)
      return response.badRequest({ status: 400, error: message })
    }
  }
}

import Abonnement from '#models/abonnement'
import { DateTime } from 'luxon'

export default class LastAbonnementService {
  /**
   * Récupère le dernier abonnement pour une compagnie donnée.
   * @param companyId - L'ID de la compagnie.
   */
  static async fetchLastAbonnement(companyId: number) {
    try {
      const abonnement = await Abonnement.query()
        .where('companieId', companyId)
        .orderBy('dateFin', 'desc')
        .first()

      // Comparer la date de fin avec la date actuelle
      if (abonnement) {
        const today = DateTime.now()
        if (abonnement.dateFin < today) {
          // L'abonnement est expiré
          return { status: 'expired' }
        }
      }

      return { status: 'active' }
    } catch (error) {
      console.error('Erreur lors de la récupération du dernier abonnement:', error)
      return { status: 'error' }
    }
  }
}

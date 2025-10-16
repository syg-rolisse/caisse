import Abonnement from '#models/abonnement'

export default class AbonnementService {
  /**
   * Récupère la liste des abonnements pour une compagnie donnée.
   * @param companyId - L'ID de la compagnie.
   */
  static async fetchAndFormatAbonnements(companyId: number) {
    try {
      const abonnements = await Abonnement.query()
        .where('companieId', companyId)
        .preload('Packs')
        .preload('Users')
        .orderBy('createdAt', 'desc')

      return { abonnements }
    } catch (error) {
      console.error('Erreur lors de la récupération des Abonnements:', error)
      return { abonnements: [] }
    }
  }
}

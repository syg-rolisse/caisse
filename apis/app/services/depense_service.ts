import Depense from '#models/depense'

export default class DepenseService {
  static async fetchAndFormatDepenses(
    companyId: number,
    page = 1,
    perPage = 1000,
    userId: number | undefined | null,
    dateDebut: string,
    dateFin: string
  ) {
    const query = Depense.query()
      .where({ companieId: companyId })
      .preload('user')
      .preload('typeDeDepense')
      .preload('Mouvements')

    if (userId) {
      query.where({ userId })
    }

    if (dateDebut) {
      query.where('createdAt', '>=', dateDebut)
    }

    if (dateFin) {
      query.where('createdAt', '<=', dateFin)
    }

    const [allDepenses, depenses] = await Promise.all([
      query.clone().orderBy('id', 'desc'),
      query.clone().orderBy('id', 'desc').paginate(page, perPage),
    ])

    return { companyId, depenses, allDepenses }
  }
}

import TypeDeDepense from '#models/type_de_depense'

export default class TypeDepenseService {
  static async fetchAndFormatTypeDepenses(companyId: number, page = 1, perPage = 1000) {
    const query = TypeDeDepense.query()
      .where({ companieId: companyId })
      .preload('user')
      .preload('Depenses', (depenseQuery) => {
        depenseQuery.preload('Mouvements')
      })

    const [allTypeDepenses, typeDepenses] = await Promise.all([
      query.clone().orderBy('id', 'desc'),
      query.clone().orderBy('id', 'desc').paginate(page, perPage),
    ])

    return { companyId, typeDepenses, allTypeDepenses }
  }
}

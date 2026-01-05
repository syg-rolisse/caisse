import Approvisionnement from '#models/approvisionnement'

export default class ApproService {
  static async fetchAndFormatAppro(
    companyId: number,
    page = 1,
    perPage = 50,
    keyword: string = ''
  ) {
    const query = Approvisionnement.query()
      .where({ companieId: companyId })
      .preload('user')
      .orderBy('id', 'desc')

    if (keyword) {
      query.where((builder) => {
        builder.where('wording', 'ilike', `%${keyword}%`)

        builder.orWhereRaw('CAST(montant AS TEXT) LIKE ?', [`%${keyword}%`])

        builder.orWhereHas('user', (userQuery) => {
          userQuery.where('fullName', 'ilike', `%${keyword}%`)
          // .orWhere('prenoms', 'ilike', `%${keyword}%`)
        })
      })
    }

    // Exécution de la pagination uniquement
    const approvisionnements = await query.paginate(page, perPage)

    return { approvisionnements }
  }
}

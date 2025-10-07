import Approvisionnement from '#models/approvisionnement'

export default class ApproService {
  static async fetchAndFormatAppro(companyId: number, page = 1, perPage = 1000) {
    const query = Approvisionnement.query().where({ companieId: companyId }).preload('user')

    const [allApprovisionnements, approvisionnements] = await Promise.all([
      query.clone().orderBy('id', 'desc'),
      query.clone().orderBy('id', 'desc').paginate(page, perPage),
    ])

    return { companyId, approvisionnements, allApprovisionnements }
  }
}

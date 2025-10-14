import User from '#models/user'

export default class UserService {
  static async fetchAndFormatUsers(companyId: number, page = 1, perPage = 1000) {
    if (!companyId) {
      return {
        status: 404,
        message: "Identifiant de l'entreprise non reconnu...",
        allUsers: [],
        users: [],
      }
    }

    const query = User.query()
      .where({ companieId: companyId })
      .orderBy('id', 'desc')
      .preload('Profil')
      .preload('Companies')

    const [allUsers, users] = await Promise.all([
      query.clone().orderBy('id', 'desc'),
      query.clone().orderBy('id', 'desc').paginate(page, perPage),
    ])

    return { companyId, users, allUsers }
  }
}

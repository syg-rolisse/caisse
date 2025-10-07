import Solde from '#models/solde'

export default class SoldeService {
  static async fetchAndFormatSolde(companyId: number) {
    const query = Solde.query().where({ companieId: companyId })

    const solde = await query.clone().orderBy('id', 'desc').first()

    return { companyId, solde }
  }
}

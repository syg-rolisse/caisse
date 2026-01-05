import Depense from '#models/depense'

export default class DepenseService {
  static async fetchAndFormatDepenses(
    companyId: number,
    page = 1,
    perPage = 10,
    userId: number | undefined | null,
    dateDebut: string,
    dateFin: string,
    typeDeDepenseId: number | undefined | null,
    by: string | undefined | null,
    keyword: string = ''
  ) {
    const query = Depense.query()
      .where({ companieId: companyId })
      .preload('user')
      .preload('typeDeDepense')
      .preload('Mouvements')

    // --- Filtres Existants ---

    if (userId) {
      query.where({ userId })
    }

    if (dateDebut) {
      query.where('createdAt', '>=', dateDebut)
    }

    if (dateFin) {
      query.where('createdAt', '<=', dateFin)
    }

    if (typeDeDepenseId) {
      query.where({ typeDeDepenseId })
    }

    // Gestion des statuts (Payé, Impayé, Rejeté)
    if (by && by === 'paye') {
      query.where({ status: true })
    }

    if (by && by === 'impaye') {
      query.where({ status: false })
    }

    if (by && by === 'rejete') {
      query.where({ rejeter: true })
    }

    // --- Recherche par Mots-clés (Keyword) ---
    if (keyword) {
      query.where((builder) => {
        // Recherche sur le libellé de la dépense
        builder.where('wording', 'ilike', `%${keyword}%`)

        // Recherche sur le montant
        builder.orWhereRaw('CAST(montant AS TEXT) LIKE ?', [`%${keyword}%`])
      })
    }

    // --- Exécution (Pagination uniquement) ---
    const depenses = await query.orderBy('id', 'desc').paginate(page, perPage)

    return { companyId, depenses }
  }
}

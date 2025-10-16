import Pack from '#models/pack'

export default class PackService {
  static async fetchAndFormatPacks() {
    try {
      const packsList = await Pack.query().orderBy('id', 'desc')
      return { packs: packsList }
    } catch (error) {
      console.error('Erreur lors de la récupération des Packs:', error)
      return { packs: [] }
    }
  }
}

import TypeDeDepense from '#models/type_de_depense'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class TypeDeDepenseSeeder extends BaseSeeder {
  public async run() {
    await TypeDeDepense.createMany([
      { wording: 'Carburant', userId: 1, companieId: 1 },
      { wording: 'Communication', userId: 1, companieId: 1 },
      { wording: 'Emargement', userId: 1, companieId: 1 },
      { wording: 'Impression', userId: 1, companieId: 1 },
      { wording: 'Photocopie', userId: 1, companieId: 1 },
      { wording: 'Achat de fournitures', userId: 1, companieId: 1 },
      { wording: 'Garde vélo', userId: 1, companieId: 1 },
      { wording: 'Déplacement', userId: 1, companieId: 1 },
      { wording: 'Autres achats', userId: 1, companieId: 1 },
      // { wording: 'Carburant', userId: 1, companieId: 2 },
      // { wording: 'Communication', userId: 1, companieId: 2 },
      // { wording: 'Emargement', userId: 1, companieId: 2 },
      // { wording: 'Impression', userId: 1, companieId: 2 },
      // { wording: 'Photocopie', userId: 1, companieId: 2 },
      // { wording: 'Achat de fournitures', userId: 1, companieId: 2 },
      // { wording: 'Garde vélo', userId: 1, companieId: 2 },
      // { wording: 'Déplacement', userId: 1, companieId: 2 },
      // { wording: 'Autres achats', userId: 1, companieId: 2 },
    ])
  }
}

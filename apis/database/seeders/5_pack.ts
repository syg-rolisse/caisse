import Pack from '#models/pack'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class PackSeeder extends BaseSeeder {
  public async run() {
    await Pack.createMany([
      {
        libelle: 'Démo',
        description:
          "Votre porte d'entrée vers notre écosystème. Explorez, testez et innovez avec un accès gratuit de 30 jours. Aucune carte de crédit requise.",
        montant: 0,
        duree: 30, // en jours
        statut: true,
      },
    ])
  }
}

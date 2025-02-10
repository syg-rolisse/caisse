import Profil from '#models/profil'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    await Profil.createMany([
      {
        wording: 'Superadmin',

        companieId: 1,
      },
      {
        wording: 'Admin',

        companieId: 1,
      },
      {
        wording: 'Employé',

        companieId: 1,
      },
      {
        wording: 'Sécrétaire',

        companieId: 1,
      },
    ])
  }
}

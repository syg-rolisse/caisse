import Profil from '#models/profil'
import Companie from '#models/companie'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class ProfilSeeder extends BaseSeeder {
  public async run() {
    const companies = await Companie.all()

    for (const company of companies) {
      await Profil.createMany([
        { wording: 'Superadmin', companieId: company.id },
        { wording: 'Admin', companieId: company.id },
        { wording: 'Employé', companieId: company.id },
        { wording: 'Secrétaire', companieId: company.id },
        { wording: 'Stagiaire', companieId: company.id },
      ])
    }
  }
}

import User from '#models/user'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class UserSeeder extends BaseSeeder {
  public async run() {
    // On définit une liste d'utilisateurs à créer
    const usersToCreate = [
      // --- Utilisateurs pour l'entreprise 1 : Innovatech Solutions ---
      {
        fullName: 'Rolisse ADJEVI',
        email: 'rolissecodeur@gmail.com',
        password: 'password',
        profilId: 1,
        validEmail: true,
        status: true,
        companieId: 1,
      },
      {
        fullName: 'Martinien SEHOUHOUE',
        email: 'martinien.sehouhoue@oraadvices.com',
        password: 'password',
        profilId: 3,
        validEmail: true,
        status: true,
        companieId: 2,
      },
      {
        fullName: 'Fridos KINDJI',
        email: 'fridos.kindji@oraadvices.com',
        password: 'password',
        profilId: 2,
        validEmail: true,
        status: true,
        companieId: 2,
      },

      // --- Utilisateurs pour l'entreprise 2 : Creative Buzz Agency ---
      {
        fullName: 'Honore EDAH',
        email: 'honore.edah@oraadvices.com',
        password: 'password',
        profilId: 1,
        validEmail: true,
        status: true,
        companieId: 2,
      },
      {
        fullName: 'Victoire DANON',
        email: 'victoire.danon@oraadvices.com',
        password: 'password',
        profilId: 2,
        validEmail: true,
        status: true,
        companieId: 2,
      },

      // --- Utilisateurs pour l'entreprise 3 : EcoBuild Constructions ---
      {
        fullName: 'ADMIN',
        email: 'contact@oraadvices.com',
        password: 'password',
        profilId: 1,
        validEmail: true,
        status: true,
        companieId: 2,
      },
    ]

    // Utilise createMany pour insérer tous les utilisateurs en une seule requête
    await User.createMany(usersToCreate)
  }
}

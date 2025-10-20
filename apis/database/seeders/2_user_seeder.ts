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
        fullName: 'Alice Johnson',
        email: 'alice.j@innovatech.com',
        password: 'password',
        profilId: 1, // Supposons que profilId 1 est un manager/admin
        validEmail: true,
        status: true,
        companieId: 1,
      },
      {
        fullName: 'Bob Williams',
        email: 'bob.w@innovatech.com',
        password: 'password',
        profilId: 2, // Supposons que profilId 2 est un utilisateur standard
        validEmail: true,
        status: true,
        companieId: 1,
      },

      // --- Utilisateurs pour l'entreprise 2 : Creative Buzz Agency ---
      {
        fullName: 'Charlie Brown',
        email: 'charlie.b@creativebuzz.com',
        password: 'password',
        profilId: 1,
        validEmail: true,
        status: true,
        companieId: 2,
      },
      {
        fullName: 'Dana Smith',
        email: 'dana.s@creativebuzz.com',
        password: 'password',
        profilId: 2,
        validEmail: true,
        status: true,
        companieId: 2,
      },

      // --- Utilisateurs pour l'entreprise 3 : EcoBuild Constructions ---
      {
        fullName: 'Eve Davis',
        email: 'eve.d@ecobuild.com',
        password: 'password',
        profilId: 1,
        validEmail: true,
        status: true,
        companieId: 3,
      },
      {
        fullName: 'Frank Miller',
        email: 'frank.m@ecobuild.com',
        password: 'password',
        profilId: 2,
        validEmail: true,
        status: true,
        companieId: 3,
      },

      // --- Utilisateurs pour l'entreprise 4 : Gourmet Foods Inc. ---
      {
        fullName: 'Grace Wilson',
        email: 'grace.w@gourmetfoods.com',
        password: 'password',
        profilId: 1,
        validEmail: true,
        status: true,
        companieId: 4,
      },
      {
        fullName: 'Heidi Moore',
        email: 'heidi.m@gourmetfoods.com',
        password: 'password',
        profilId: 2,
        validEmail: true,
        status: true,
        companieId: 4,
      },
    ]

    // Utilise createMany pour insérer tous les utilisateurs en une seule requête
    await User.createMany(usersToCreate)
  }
}

import User from '#models/user'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  public async run() {
    const users = [
      {
        fullName: 'Rolisse ADJEVI',
        email: 'rolissecodeur@gmail.com',
        password: 'password',
        profilId: 1,
        validEmail: true,
        status: true,
        companieId: 1,
      },
    ]

    // Ajoutez la normalisation des e-mails avant la sauvegarde
    await User.createMany(
      users.map((user) => ({
        ...user,
      }))
    )
  }
}

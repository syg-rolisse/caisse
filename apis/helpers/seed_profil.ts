import Profil from '#models/profil'
import db from '@adonisjs/lucid/services/db'

export async function seedProfile(companieId: number) {
  const roleData = [
    { wording: 'Superadmin', companieId: companieId },
    { wording: 'Admin', companieId: companieId },
    { wording: 'Employé', companieId: companieId },
    { wording: 'Sécrétaire', companieId: companieId },
    { wording: 'Stagiaire', companieId: companieId },
  ]

  const trx = await db.transaction()

  try {
    for (const role of roleData) {
      await Profil.create(role, { client: trx })
    }
    await trx.commit()
    return true
  } catch (error) {
    await trx.rollback()
    return false
  }
}

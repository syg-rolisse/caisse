import Profil from '#models/profil'
import { TransactionClientContract } from '@adonisjs/lucid/types/database'

export async function seedProfile(
  companieId: number,
  trx: TransactionClientContract
): Promise<Record<string, number>> {
  const roleNames = ['Superadmin', 'Admin', 'Employé', 'Sécrétaire', 'Stagiaire']
  const profilesMap: Record<string, number> = {}

  for (const wording of roleNames) {
    let existing = await Profil.query({ client: trx })
      .where('wording', wording)
      .where('companie_id', companieId)
      .first()

    if (!existing) {
      existing = await Profil.create({ wording, companieId }, { client: trx })
    }
    profilesMap[wording] = existing.id
  }

  return profilesMap
}

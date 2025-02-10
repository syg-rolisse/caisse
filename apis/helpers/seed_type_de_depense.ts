import TypeDeDepense from '#models/type_de_depense'
import db from '@adonisjs/lucid/services/db'

export async function seedTypeDeDepense(companieId: number, userId: number) {
  const typeDeDepenseData = [
    { wording: 'Carburant', userId, companieId },
    { wording: 'Communication', userId, companieId },
    { wording: 'Emargement', userId, companieId },
    { wording: 'Impression', userId, companieId },
    { wording: 'Photocopie', userId, companieId },
    { wording: 'Achat de fournitures', userId, companieId },
    { wording: 'Garde vélo', userId, companieId },
    { wording: 'Déplacement', userId, companieId },
    { wording: 'Autres achats', userId, companieId },
  ]

  const trx = await db.transaction()

  try {
    for (const type of typeDeDepenseData) {
      await TypeDeDepense.create(type, { client: trx })
    }
    await trx.commit()
    return true
  } catch (error) {
    await trx.rollback()
    return false
  }
}

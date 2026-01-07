import TypeDeDepense from '#models/type_de_depense'
import { TransactionClientContract } from '@adonisjs/lucid/types/database'

export async function seedTypeDeDepense(
  companieId: number,
  userId: number,
  trx: TransactionClientContract
) {
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

  for (const type of typeDeDepenseData) {
    const exists = await TypeDeDepense.query({ client: trx })
      .where('wording', type.wording)
      .where('companie_id', companieId)
      .first()

    if (!exists) {
      await TypeDeDepense.create(type, { client: trx })
    }
  }
  return true
}

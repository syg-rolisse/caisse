import vine, { SimpleMessagesProvider } from '@vinejs/vine'

vine.messagesProvider = new SimpleMessagesProvider({
  'packId.required': 'Veuillez sélectionner un pack pour le renouvellement.',
  'packId.number': 'La sélection du pack est invalide.',
  'userId.required': "L'identifiant de l'utilisateur est requis.",
})

export const renewAbonnementValidator = vine.compile(
  vine.object({
    packId: vine.number(),
    userId: vine.number(),
  })
)

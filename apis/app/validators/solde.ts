import vine, { SimpleMessagesProvider } from '@vinejs/vine'

// Messages personnalisés
vine.messagesProvider = new SimpleMessagesProvider({
  'companieId.required': "L'entreprise est requise.",
  'userId.required': "L'utilisateur est requis.",
  'companieId.number': "L'identifiant de l'entreprise doit être un nombre.",
  'userId.number': "L'identifiant de l'utilisateur doit être un nombre.",
})

// Validator
export const soldeValidator = vine.compile(
  vine.object({
    companieId: vine.number().exists(async (db, value) => {
      const match = await db.from('companies').select('id').where('id', value).first()
      return !!match
    }),
    userId: vine.number().exists(async (db, value) => {
      const match = await db.from('users').select('id').where('id', value).first()
      return !!match
    }),
  })
)

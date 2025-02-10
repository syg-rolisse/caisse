import vine, { SimpleMessagesProvider } from '@vinejs/vine'
// Configuration des messages d’erreur personnalisés
vine.messagesProvider = new SimpleMessagesProvider({
  'wording.trim': 'Le champ "Nom complet" est requis.',
  'wording.string': 'Le "Nom complet" doit être une chaîne de caractères.',
  'userId.number':
    "Identifiant de l'utilisateur connecté non reconnu. Votre session a surement expiré.",
  'userId.required':
    "Identifiant de l'utilisateur connecté non reconnu. Votre session a surement expiré.",
  'companieId.required': "Identifiant de l'entreprise requis",
})

export const createTypeDepenseValidator = vine.compile(
  vine.object({
    wording: vine.string().trim(),
    companieId: vine.number(),
    userId: vine.number(),
  })
)

export const updateTypeDepenseValidator = vine.compile(
  vine.object({
    wording: vine.string().trim(),
  })
)

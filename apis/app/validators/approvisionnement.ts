import vine, { SimpleMessagesProvider } from '@vinejs/vine'
// Configuration des messages d’erreur personnalisés
vine.messagesProvider = new SimpleMessagesProvider({
  'wording.trim': 'Le champ "Nom complet" est requis.',
  'montant.number': 'Veuillez rensigner le montant.',
  'wording.string': 'Le "Nom complet" doit être une chaîne de caractères.',
  'userId.number':
    "Identifiant de l'utilisateur connecté non reconnu. Votre session a surement expiré.",
  'userId.required':
    "Identifiant de l'utilisateur connecté non reconnu. Votre session a surement expiré.",
  'companieId.required': "Identifiant de l'entreprise requis",
})

export const createApprovisionnementValidator = vine.compile(
  vine.object({
    wording: vine.string().trim().optional(),
    userId: vine.number(),
    companieId: vine.number(),
    montant: vine.number(),
  })
)

export const updateApprovisionnementValidator = vine.compile(
  vine.object({
    wording: vine.string().trim().optional(),
    montant: vine.number(),
  })
)

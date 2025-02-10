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
  'depenseId.required': "L'identifiant de la dépense est requise et doit être un nombre.",
  'depenseId.number': "L'identifiant de la dépense est requise et doit être un nombre.",
  'companieId.required': "Identifiant de l'entreprise requis",
})

export const createMouvementValidator = vine.compile(
  vine.object({
    wording: vine.string().trim().optional(),
    userId: vine.number(),
    companieId: vine.number(),
    depenseId: vine.number(),
    montant: vine.number(),
  })
)

export const updateMouvementValidator = vine.compile(
  vine.object({
    wording: vine.string().trim().optional(),
    montant: vine.number(),
    depenseId: vine.number(),
  })
)

import vine, { SimpleMessagesProvider } from '@vinejs/vine'
// Configuration des messages d’erreur personnalisés
vine.messagesProvider = new SimpleMessagesProvider({
  'montant.number': 'Veuillez rensigner le montant.',
  'wording.trim': 'Le champ "Nom complet" est requis.',
  'wording.string': 'Le "Nom complet" doit être une chaîne de caractères.',
  'userId.number':
    "Identifiant de l'utilisateur connecté non reconnu. Votre session a surement expiré.",
  'userId.required':
    "Identifiant de l'utilisateur connecté non reconnu. Votre session a surement expiré.",
  'typeDeDepenseId.number': "L'identifiant du type de dépense est requis.",
  'typeDeDepenseId.required': "L'identifiant du type de dépense est requis.",
  'companieId.required': "Identifiant de l'entreprise requis",
})

export const createDepenseValidator = vine.compile(
  vine.object({
    wording: vine.string().trim(),
    userId: vine.number(),
    montant: vine.number(),
    typeDeDepenseId: vine.number(),
    companieId: vine.number(),
    status: vine.boolean().optional(),
    decharger: vine.boolean().optional(),
    bloquer: vine.boolean().optional(),
  })
)

export const updateDepenseValidator = vine.compile(
  vine.object({
    wording: vine.string().trim(),
    typeDeDepenseId: vine.number(),
    montant: vine.number(),
    status: vine.boolean().optional(),
    decharger: vine.boolean().optional(),
    bloquer: vine.boolean().optional(),
  })
)

import vine, { SimpleMessagesProvider } from '@vinejs/vine'

vine.messagesProvider = new SimpleMessagesProvider({
  'libelle.required': 'Le champ "Libellé" est requis.',
  'libelle.string': 'Le "Libellé" doit être une chaîne de caractères.',
  'montant.required': 'Le champ "Montant" est requis.',
  'montant.number': 'Le "Montant" doit être un nombre.',
  'duree.required': 'Le champ "Durée" est requis.',
  'duree.number': 'La "Durée" doit être un nombre de jours.',
})

export const createPackValidator = vine.compile(
  vine.object({
    libelle: vine.string().trim(),
    montant: vine.number(),
    duree: vine.number(),
    description: vine.string().trim().optional(),
    statut: vine.boolean().optional(),
  })
)

export const updatePackValidator = vine.compile(
  vine.object({
    libelle: vine.string().trim().optional(),
    montant: vine.number().optional(),
    duree: vine.number().optional(),
    description: vine.string().trim().optional(),
    statut: vine.boolean().optional(),
  })
)

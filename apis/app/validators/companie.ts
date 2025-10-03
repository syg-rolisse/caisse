import vine, { SimpleMessagesProvider } from '@vinejs/vine'

// Configuration des messages d’erreur personnalisés
vine.messagesProvider = new SimpleMessagesProvider({
  'companyName.trim': 'Le champ "Nom complet" est requis.',
  'companyName.string': 'Le "Nom complet" doit être une chaîne de caractères.',
  'address.trim': 'Le champ "Adresse" est requis.',
  'address.string': 'L\'"Adresse" doit être une chaîne de caractères.',
  'phoneNumber.trim': 'Le champ "Numéro de téléphone" est requis.',
  'phoneNumber.string': 'Le "Numéro de téléphone" doit être une chaîne de caractères.',
})

export const UpdateCompanieValidator = vine.compile(
  vine.object({
    companyName: vine.string().trim(),
    address: vine.string().trim(),
    phoneNumber: vine.string().trim(),
    showCompanyName: vine.boolean().optional(),
  })
)

import vine, { SimpleMessagesProvider } from '@vinejs/vine'

// Configuration des messages d’erreur personnalisés
vine.messagesProvider = new SimpleMessagesProvider({
  'email.email': 'Veuillez entrer une adresse email valide.',
  'email.unique': 'Cette adresse email est déjà utilisée.',

  'password.trim': 'Le mot de passe est requis.',
  'password.minLength': 'Le mot de passe doit contenir au moins 6 caractères.',
  'confirm.minLength': 'La confirmation du mot de passe doit contenir au moins 6 caractères.',
})

// Définition des règles de validation
const password = vine.string().minLength(6)
const confirm = vine.string().minLength(6)

export const loginValidator = vine.compile(
  vine.object({
    email: vine.string().email().normalizeEmail().trim(),
    password,
  })
)

export const passwordResetValidator = vine.compile(
  vine.object({
    password,
    confirm,
  })
)

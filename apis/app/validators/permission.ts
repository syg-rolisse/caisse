import vine, { SimpleMessagesProvider } from '@vinejs/vine'

// Configuration des messages d’erreur personnalisés
vine.messagesProvider = new SimpleMessagesProvider({
  'profilId.number': 'Le Profil doit être un nombre.',
  'profilId.required': 'Le Profil est requis.',
})

export const updatePermissionValidator = vine.compile(
  vine.object({
    profilId: vine.number(),
    createAppro: vine.boolean().optional(),
    deleteAppro: vine.boolean().optional(),
    readAppro: vine.boolean().optional(),
    updateAppro: vine.boolean().optional(),

    readSortie: vine.boolean().optional(),

    createDepense: vine.boolean().optional(),
    deleteDepense: vine.boolean().optional(),
    readDepense: vine.boolean().optional(),
    updateDepense: vine.boolean().optional(),

    deleteTypeDeDepense: vine.boolean().optional(),
    readTypeDeDepense: vine.boolean().optional(),
    updateTypeDeDepense: vine.boolean().optional(),
    createTypeDeDepense: vine.boolean().optional(),

    createUser: vine.boolean().optional(),
    deleteUser: vine.boolean().optional(),
    readUser: vine.boolean().optional(),
    updateUser: vine.boolean().optional(),

    createAbonnement: vine.boolean().optional(),
    readAbonnement: vine.boolean().optional(),

    createPack: vine.boolean().optional(),
    deletePack: vine.boolean().optional(),
    readPack: vine.boolean().optional(),
    updatePack: vine.boolean().optional(),

    rejectDepense: vine.boolean().optional(),
    payeDepense: vine.boolean().optional(),
    bloqueDepense: vine.boolean().optional(),
    dechargeDepense: vine.boolean().optional(),
    readEdition: vine.boolean().optional(),
    exportEdition: vine.boolean().optional(),

    updatePermission: vine.boolean().optional(),
    readPermission: vine.boolean().optional(),
  })
)

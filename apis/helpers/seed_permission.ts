import Permission from '#models/permission'
import { TransactionClientContract } from '@adonisjs/lucid/types/database'

export async function seedPermission(
  companieId: number,
  profilesMap: Record<string, number>,
  trx: TransactionClientContract
) {
  const getFullPermissions = (profilId: number) => ({
    profilId,
    companieId,
    readUser: true,
    readSortie: true,
    createUser: true,
    readDashboard: true,
    updateUser: true,
    deleteUser: true,
    readAppro: true,
    createAppro: true,
    updateAppro: true,
    deleteAppro: true,
    readDepense: true,
    createDepense: true,
    updateDepense: true,
    deleteDepense: true,
    readTypeDeDepense: true,
    createTypeDeDepense: true,
    updateTypeDeDepense: true,
    deleteTypeDeDepense: true,
    rejectDepense: true,
    payeDepense: true,
    bloqueDepense: true,
    dechargeDepense: true,
    readPermission: true,
    updatePermission: true,
    readAbonnement: true,
    createAbonnement: true,
    readPack: true,
    createPack: true,
    updatePack: true,
    deletePack: true,
    readEdition: true,
    exportEdition: true,
  })

  const getLimitedPermissions = (profilId: number) => ({
    profilId,
    companieId,
    readUser: false,
    readSortie: true,
    createUser: true,
    readDashboard: true,
    updateUser: false,
    deleteUser: false,
    readAppro: false,
    createAppro: false,
    updateAppro: false,
    deleteAppro: false,
    readDepense: true,
    createDepense: true,
    updateDepense: true,
    deleteDepense: false,
    readTypeDeDepense: true,
    createTypeDeDepense: false,
    updateTypeDeDepense: false,
    deleteTypeDeDepense: false,
    rejectDepense: true,
    payeDepense: false,
    bloqueDepense: false,
    dechargeDepense: false,
    readPermission: false,
    updatePermission: false,
    readAbonnement: false,
    createAbonnement: false,
    readPack: false,
    createPack: false,
    updatePack: false,
    deletePack: false,
    readEdition: false,
    exportEdition: false,
  })

  const permissionData = [
    getFullPermissions(profilesMap['Superadmin']),
    getFullPermissions(profilesMap['Admin']),
    getLimitedPermissions(profilesMap['Employé']),
    getLimitedPermissions(profilesMap['Sécrétaire']),
    getLimitedPermissions(profilesMap['Stagiaire']),
  ]

  await Permission.createMany(permissionData, { client: trx })
  return true
}

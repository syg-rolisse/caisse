import Permission from '#models/permission'
import db from '@adonisjs/lucid/services/db'

export async function seedPermission(companieId: number) {
  if (!companieId) {
    throw new Error('companieId est requis pour créer les permissions.')
  }

  const permissionData = [
    {
      profilId: 1,
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
    },
    {
      profilId: 2,
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
    },
    {
      profilId: 3,
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
    },
    {
      profilId: 4,
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
    },
  ]

  const trx = await db.transaction()

  try {
    await Permission.createMany(permissionData, { client: trx })
    await trx.commit()
    return true
  } catch (error) {
    await trx.rollback()
    return false
  }
}

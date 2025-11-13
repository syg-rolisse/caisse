import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import Companies from './companie.js'
import Profil from './profil.js'

export default class Permission extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare companieId: number

  @belongsTo(() => Companies)
  declare Companies: BelongsTo<typeof Companies>

  @column()
  declare profilId: number

  @belongsTo(() => Profil)
  declare Profil: BelongsTo<typeof Profil>

  @column()
  declare readPermission: boolean

  @column()
  declare updatePermission: boolean

  @column()
  declare readUser: boolean

  @column()
  declare createUser: boolean

  @column()
  declare readDashboard: boolean

  @column()
  declare updateUser: boolean

  @column()
  declare deleteUser: boolean

  @column()
  declare readAbonnement: boolean

  @column()
  declare createAbonnement: boolean

  @column()
  declare readPack: boolean

  @column()
  declare createPack: boolean

  @column()
  declare updatePack: boolean

  @column()
  declare deletePack: boolean

  @column()
  declare readSortie: boolean

  @column()
  declare readAppro: boolean

  @column()
  declare createAppro: boolean

  @column()
  declare updateAppro: boolean

  @column()
  declare deleteAppro: boolean

  @column()
  declare rejectDepense: boolean

  @column()
  declare payeDepense: boolean

  @column()
  declare bloqueDepense: boolean

  @column()
  declare dechargeDepense: boolean

  @column()
  declare readEdition: boolean

  @column()
  declare exportEdition: boolean

  @column()
  declare readDepense: boolean

  @column()
  declare createDepense: boolean

  @column()
  declare updateDepense: boolean

  @column()
  declare deleteDepense: boolean

  @column()
  declare readTypeDeDepense: boolean

  @column()
  declare createTypeDeDepense: boolean

  @column()
  declare updateTypeDeDepense: boolean

  @column()
  declare deleteTypeDeDepense: boolean

  @column()
  declare voirLeSolde: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}

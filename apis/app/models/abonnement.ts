import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Companies from './companie.js'
import Packs from './pack.js'
import Users from './user.js'

export default class Abonnement extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare companieId: number

  @column()
  declare packId: number

  @column()
  declare userId: number

  @belongsTo(() => Companies)
  declare Companies: BelongsTo<typeof Companies>

  @belongsTo(() => Users)
  declare Users: BelongsTo<typeof Users>

  @belongsTo(() => Packs)
  declare Packs: BelongsTo<typeof Packs>

  @column()
  declare packLibelle: string

  @column()
  declare packDescription: string

  @column()
  declare packMontant: number

  @column()
  declare dateDebut: DateTime

  @column()
  declare dateFin: DateTime

  @column()
  declare statut: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}

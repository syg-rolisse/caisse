import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import Companies from './companie.js'
import User from './user.js'

export default class Approvisionnement extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare companieId: number

  @belongsTo(() => Companies)
  declare Companies: BelongsTo<typeof Companies>

  @column()
  declare wording: string

  @column()
  declare montant: number

  @column()
  declare userId: number

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  serializeExtras = true
}

import { BaseModel, belongsTo, column, hasOne } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasOne } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import Companies from './companie.js'
import Permission from './permission.js'
import User from './user.js'

export default class Profil extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare companieId: number

  @belongsTo(() => Companies)
  declare Companies: BelongsTo<typeof Companies>
  @column()
  declare userId: number

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @column()
  declare wording: string

  @hasOne(() => Permission)
  declare Permission: HasOne<typeof Permission>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}

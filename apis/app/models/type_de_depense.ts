import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import Companies from './companie.js'
import Depense from './depense.js'
import User from './user.js'

export default class TypeDeDepense extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare companieId: number

  @belongsTo(() => Companies)
  declare Companies: BelongsTo<typeof Companies>

  @column()
  declare wording: string

  @column()
  declare userId: number

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @hasMany(() => Depense)
  declare Depenses: HasMany<typeof Depense>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  serializeExtras = true
}

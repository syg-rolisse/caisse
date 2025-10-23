import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import Companies from './companie.js'
import Mouvement from './mouvement.js'
import TypeDeDepense from './type_de_depense.js'
import User from './user.js'

export default class Depense extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare wording: string

  @column()
  declare companieId: number

  @belongsTo(() => Companies)
  declare Companies: BelongsTo<typeof Companies>

  @column()
  declare rejetMessage: string

  @column()
  declare montant: number

  @column()
  declare factureUrl: string

  @column()
  declare userId: number

  @column()
  declare status: boolean

  @column()
  declare decharger: boolean

  @column()
  declare dateOperation: Date

  @column()
  declare bloquer: boolean

  @column()
  declare rejeter: boolean

  @hasMany(() => Mouvement)
  declare Mouvements: HasMany<typeof Mouvement>

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @column()
  declare typeDeDepenseId: number

  @belongsTo(() => TypeDeDepense)
  declare typeDeDepense: BelongsTo<typeof TypeDeDepense>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}

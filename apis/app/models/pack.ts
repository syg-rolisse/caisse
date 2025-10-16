import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Abonnement from './abonnement.js'

export default class Pack extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare libelle: string

  @column()
  declare description: string | undefined

  @column()
  declare montant: number

  @column()
  declare duree: number

  @hasMany(() => Abonnement)
  declare Abonnement: HasMany<typeof Abonnement>

  @column()
  declare statut: boolean | undefined

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}

import { MultipartFile } from '@adonisjs/core/bodyparser'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import Abonnement from './abonnement.js'
import { DateTime } from 'luxon'
export default class Companie extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare companyName: string

  @column()
  declare status: boolean

  @column()
  declare showCompanyName: boolean

  @column()
  declare address: string

  @column()
  declare phoneNumber: string

  @column()
  declare avatar: MultipartFile | undefined

  @hasMany(() => User)
  declare users: HasMany<typeof User>

  @hasMany(() => Abonnement)
  declare abonnements: HasMany<typeof Abonnement>

  @column()
  declare logoUrl: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}

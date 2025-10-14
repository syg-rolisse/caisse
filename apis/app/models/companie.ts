import { MultipartFile } from '@adonisjs/core/bodyparser'
import { BaseModel, column } from '@adonisjs/lucid/orm'
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

  @column()
  declare logoUrl: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}

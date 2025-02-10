import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { MultipartFile } from '@adonisjs/core/bodyparser'
import { compose } from '@adonisjs/core/helpers'
import hash from '@adonisjs/core/services/hash'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import Companies from './companie.js'
import Profil from './profil.js'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare companyName: string

  @column()
  declare phoneNumber: string

  @column()
  declare fullName: string

  @column()
  declare profilId: number

  @column()
  declare companieId: number

  @belongsTo(() => Companies)
  declare Companies: BelongsTo<typeof Companies>

  @belongsTo(() => Profil)
  declare Profil: BelongsTo<typeof Profil>

  @column()
  declare email: string

  @column()
  declare avatar: MultipartFile | undefined

  @column()
  declare avatarUrl: string

  @column()
  declare validEmail: boolean

  @column()
  declare status: boolean

  @column({ serializeAs: null })
  declare password: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  static accessTokens = DbAccessTokensProvider.forModel(User)
}

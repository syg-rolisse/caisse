import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { MultipartFile } from '@adonisjs/core/bodyparser'
import { compose } from '@adonisjs/core/helpers'
import hash from '@adonisjs/core/services/hash'
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import Companies from './companie.js'
import Profil from './profil.js'
import Depense from './depense.js'
import TypeDeDepense from './type_de_depense.js'
import Mouvement from './mouvement.js'
import Abonnement from './abonnement.js'

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

  @hasMany(() => Depense)
  declare Depense: HasMany<typeof Depense>

  @hasMany(() => TypeDeDepense)
  declare typeDeDepense: HasMany<typeof TypeDeDepense>

  @hasMany(() => Mouvement)
  declare mouvement: HasMany<typeof Mouvement>

  @hasMany(() => Abonnement)
  declare abonnement: HasMany<typeof Abonnement>

  @column()
  declare email: string

  @column()
  declare avatar: MultipartFile | undefined

  @column()
  declare avatarUrl: string | null | undefined

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

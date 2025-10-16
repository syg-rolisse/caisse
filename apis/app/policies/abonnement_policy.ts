import User from '#models/user'
import { BasePolicy } from '@adonisjs/bouncer'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'

export default class AbonnementPolicy extends BasePolicy {
  view(user: User): AuthorizerResponse {
    return user.profilId === user?.Profil?.id && user?.Profil?.Permission?.readAbonnement === true
  }
  create(user: User): AuthorizerResponse {
    return user.profilId === user?.Profil?.id && user?.Profil?.Permission?.createAbonnement === true
  }
}

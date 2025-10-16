import User from '#models/user'
import { BasePolicy } from '@adonisjs/bouncer'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'

export default class PackPolicy extends BasePolicy {
  view(user: User): AuthorizerResponse {
    return user.profilId === user?.Profil?.id && user?.Profil?.Permission?.readPack === true
  }
  create(user: User): AuthorizerResponse {
    return user.profilId === user?.Profil?.id && user?.Profil?.Permission?.createPack === true
  }
  update(user: User): AuthorizerResponse {
    return user.profilId === user?.Profil?.id && user?.Profil?.Permission?.updatePack === true
  }
  delete(user: User): AuthorizerResponse {
    return user.profilId === user?.Profil?.id && user?.Profil?.Permission?.deletePack === true
  }
}

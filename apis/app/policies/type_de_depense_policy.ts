import User from '#models/user'
import { BasePolicy } from '@adonisjs/bouncer'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'

export default class TypeDeDepensePolicy extends BasePolicy {
  view(user: User): AuthorizerResponse {
    return (
      user.profilId === user?.Profil?.id && user?.Profil?.Permission?.readTypeDeDepense === true
    )
  }
  create(user: User): AuthorizerResponse {
    return (
      user.profilId === user?.Profil?.id && user?.Profil?.Permission?.createTypeDeDepense === true
    )
  }
  update(user: User): AuthorizerResponse {
    return (
      user.profilId === user?.Profil?.id && user?.Profil?.Permission?.updateTypeDeDepense === true
    )
  }
  delete(user: User): AuthorizerResponse {
    return (
      user.profilId === user?.Profil?.id && user?.Profil?.Permission?.deleteTypeDeDepense === true
    )
  }
}

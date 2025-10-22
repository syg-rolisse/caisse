import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'
const AuthController = () => import('#controllers/auth_controller')

router
  .group(() => {
    router.post('logout', [AuthController, 'logout'])
  })
  .use(middleware.auth())
  .prefix('api/v1/')

router
  .group(() => {
    router.get('/', [AuthController, 'index'])
    router.post('login', [AuthController, 'login'])
    router.get('authorizeToRead', [AuthController, 'authorizeToRead'])
    router.post('verif_email', [AuthController, 'verif_email'])
    router.post('change_password', [AuthController, 'change_password'])
    router.post('verif_token_to_change_password', [
      AuthController,
      'verif_token_to_change_password',
    ])
  })
  .use(middleware.verifySourceAndUser())
  .prefix('api/v1/')

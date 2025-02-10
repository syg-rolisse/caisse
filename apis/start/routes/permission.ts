import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'
const PermissionsController = () => import('#controllers/permissions_controller')

router
  .group(() => {
    router.get('allPermission', [PermissionsController, 'allPermission'])
    router.get('permission', [PermissionsController, 'show'])
    router.put('permission', [PermissionsController, 'update'])
  })
  .use(middleware.auth())
  .prefix('api/v1/')

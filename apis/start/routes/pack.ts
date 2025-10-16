import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'
const PacksController = () => import('#controllers/packs_controller')

router
  .group(() => {
    router.get('pack/all', [PacksController, 'index'])
    router.get('pack', [PacksController, 'show'])
    router.post('pack', [PacksController, 'create'])
    router.put('pack', [PacksController, 'update'])
    router.delete('pack', [PacksController, 'delete'])
  })
  .use(middleware.auth())
  .prefix('api/v1/')

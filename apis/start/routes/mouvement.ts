import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'
const MouvementsController = () => import('#controllers/mouvements_controller')

router
  .group(() => {
    router.post('sortie', [MouvementsController, 'create'])
    router.get('sortie', [MouvementsController, 'show'])
    router.put('sortie', [MouvementsController, 'update'])
    router.delete('sortie', [MouvementsController, 'delete'])
  })
  .use(middleware.auth())
  .prefix('api/v1/')

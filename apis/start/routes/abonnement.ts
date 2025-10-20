import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'
const AbonnementsController = () => import('#controllers/abonnements_controller')

router
  .group(() => {
    router.get('abonnement/all', [AbonnementsController, 'index'])
    router.post('abonnement/renouveler', [AbonnementsController, 'renouveler'])
  })
  .use(middleware.auth())
  .prefix('api/v1/')

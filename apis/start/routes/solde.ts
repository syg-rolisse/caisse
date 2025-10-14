import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'
const SoldeController = () => import('#controllers/solde_controllers')

router
  .group(() => {
    router.post('companie/solde', [SoldeController, 'soldeCaisse'])
  })
  .use(middleware.auth())
  .prefix('api/v1/')

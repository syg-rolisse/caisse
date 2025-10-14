import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'
const ApprovisionnementsController = () => import('#controllers/approvisionnements_controller')

router
  .group(() => {
    router.get('caisse/solde', [ApprovisionnementsController, 'solde'])
    router.get('approvisionnement/all', [ApprovisionnementsController, 'index'])
    router.get('approvisionnement', [ApprovisionnementsController, 'show'])
    router.post('approvisionnement', [ApprovisionnementsController, 'create'])
    router.put('approvisionnement', [ApprovisionnementsController, 'update'])
    router.delete('approvisionnement', [ApprovisionnementsController, 'delete'])
  })
  .use(middleware.auth())
  .prefix('api/v1/')

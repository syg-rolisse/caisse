import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'
const DepensesController = () => import('#controllers/depenses_controller')

router
  .group(() => {
    router.get('all_depense', [DepensesController, 'index'])
    router.get('depense', [DepensesController, 'show'])
    router.post('depense', [DepensesController, 'create'])
    router.put('depense', [DepensesController, 'update'])
    router.put('rejetDepense', [DepensesController, 'rejeter'])
    router.put('bloquerDepense', [DepensesController, 'bloquer'])
    router.delete('depense', [DepensesController, 'delete'])
  })
  .use(middleware.auth())
  .prefix('api/v1/')

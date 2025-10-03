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

    router.get('depense/all', [DepensesController, 'index'])
    router.get('depense/show', [DepensesController, 'show'])
    router.post('depense/create', [DepensesController, 'create'])
    router.put('depense/update', [DepensesController, 'update'])
    router.put('depense/rejeter', [DepensesController, 'rejeter'])
    router.put('depense/bloquer', [DepensesController, 'bloquer'])
    router.delete('depense/delete', [DepensesController, 'delete'])
  })
  .use(middleware.auth())
  .prefix('api/v1/')

import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'
const TypeDeDepensesController = () => import('#controllers/type_de_depenses_controller')

router
  .group(() => {
    router.get('type_depense/all', [TypeDeDepensesController, 'index'])
    router.get('editions', [TypeDeDepensesController, 'editions'])
    router.get('totalTypeDepense', [TypeDeDepensesController, 'totalTypeDepense'])
    router.get('type_depense', [TypeDeDepensesController, 'show'])
    router.post('type_depense', [TypeDeDepensesController, 'create'])
    router.put('type_depense', [TypeDeDepensesController, 'update'])
    router.delete('type_depense', [TypeDeDepensesController, 'delete'])
  })
  .use(middleware.auth())
  .prefix('api/v1/')

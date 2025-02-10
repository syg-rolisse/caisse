/*
|--------------------------------------------------------------------------
| Bouncer policies
|--------------------------------------------------------------------------
|
| You may define a collection of policies inside this file and pre-register
| them when creating a new bouncer instance.
|
| Pre-registered policies and abilities can be referenced as a string by their
| name. Also they are must if want to perform authorization inside Edge
| templates.
|
*/

export const policies = {
  DepensePolicy: () => import('#policies/depense_policy'),
  UserPolicy: () => import('#policies/user_policy'),
  SortiePolicy: () => import('#policies/sortie_policy'),
  PermissionPolicy: () => import('#policies/permission_policy'),
  TypeDeDepensePolicy: () => import('#policies/type_de_depense_policy'),
  ApproPolicy: () => import('#policies/appro_policy'),
}

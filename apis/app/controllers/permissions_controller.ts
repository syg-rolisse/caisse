import Permission from '#models/permission'
import User from '#models/user'
import { updatePermissionValidator } from '#validators/permission'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { processErrorMessages } from '../../helpers/remove_duplicate.js'
export default class PermissionsController {
  async allPermission({ auth, request, bouncer, response }: HttpContext) {
    const user = auth.user

    if (!user) {
      console.error('Erreur: Utilisateur non authentifié')
      return response.unauthorized('Utilisateur non authentifié')
    }
    // Préchargez le profil et les permissions de l'utilisateur
    await user.load('Profil', (profilQuery: any) => {
      profilQuery.preload('Permission')
    })

    // Vérifie si l'utilisateur a l'autorisation de lire les permissions
    if (await bouncer.with('PermissionPolicy').denies('view')) {
      return response.forbidden("Désolé, vous n'êtes pas autorisé à les permissions.")
    }
    const { companieId } = request.qs()
    const query = Permission.query().where({ companieId })

    const domains = await query
      .orderBy('id', 'asc')
      .preload('Profil')
      .preload('Companies')
      .paginate(1, 50)

    return response.json(domains)
  }

  async show({ auth, bouncer, request, response }: HttpContext) {
    try {
      const user = auth.user

      if (!user) {
        console.error('Erreur: Utilisateur non authentifié')
        return response.unauthorized('Utilisateur non authentifié')
      }
      // Préchargez le profil et les permissions de l'utilisateur
      await user.load('Profil', (profilQuery: any) => {
        profilQuery.preload('Permission')
      })

      // Vérifie si l'utilisateur a l'autorisation de lire les permissions
      if (await bouncer.with('PermissionPolicy').denies('view')) {
        return response.forbidden("Désolé, vous n'êtes pas autorisé à les permissions.")
      }

      const { permissionId } = request.qs()

      if (!permissionId) {
        return response.badRequest({ status: 400, error: 'Permission ID is required' })
      }

      // Chargement de la permission avec la relation Profil
      const permission = await Permission.query()
        .preload('Profil')
        .preload('Companies') // Précharge la relation 'profil'
        .where('id', permissionId)
        .firstOrFail() // Utilise 'firstOrFail' pour garantir que la permission existe

      response.created({ status: 200, permission })
    } catch (error) {
      const message = processErrorMessages(error)
      return response.badRequest({ status: 400, error: message })
    }
  }

  public async update({ auth, bouncer, request, response }: HttpContext) {
    const trx = await db.transaction()

    try {
      console.log(request.body())

      const user = auth.user

      if (!user) {
        console.error('Erreur: Utilisateur non authentifié')
        return response.unauthorized('Utilisateur non authentifié')
      }
      // Préchargez le profil et les permissions de l'utilisateur
      await user.load('Profil', (profilQuery: any) => {
        profilQuery.preload('Permission')
      })

      // Vérifie si l'utilisateur a l'autorisation de modifier les permissions
      if (await bouncer.with('PermissionPolicy').denies('update')) {
        return response.forbidden("Désolé, vous n'êtes pas autorisé à modifier les permissions.")
      }
      // Validation du payload avec Vine
      const payload = await request.validateUsing(updatePermissionValidator)
      // if (payload?.profilId !== 1) {
      //   return response.badRequest({
      //     status: 400,
      //     error: "Désolé, les acces de l'admin ne peuvent-être modifier.",
      //   })
      // }
      const { permissionId, userConnectedId } = request.qs()

      // Récupération de la permission et de l'utilisateur connecté, avec préchargement du profil
      const permission = await Permission.findOrFail(permissionId)
      const userConnected = await User.query()
        .where('id', userConnectedId)
        .preload('Profil')
        .preload('Companies') // Préchargement du profil associé à l'utilisateur
        .firstOrFail()
      console.log(userConnected.Profil.wording)

      // Vérification du rôle d'admin
      // if (userConnected.Profil.wording !== 'Admin') {
      //   await trx.rollback()
      //   return response.badRequest({
      //     status: 400,
      //     error: "Seule l'administrateur est autorisé à modifier les status",
      //   })
      // }

      // Mise à jour des informations de permission avec les données validées
      permission.useTransaction(trx)
      permission.merge(payload) // Merge les permissions valides dans l'objet Permission
      await permission.save()

      // Commit de la transaction
      await trx.commit()

      return response.created({
        status: 200,
        message: 'Permissions mises à jour avec succès.',
      })
    } catch (error) {
      console.log(error)

      // Annulation de la transaction en cas d'erreur
      await trx.rollback()
      const message = processErrorMessages(error)
      return response.badRequest({
        status: 400,
        error: message || 'Une erreur est survenue lors de la mise à jour des permissions.',
      })
    }
  }
}

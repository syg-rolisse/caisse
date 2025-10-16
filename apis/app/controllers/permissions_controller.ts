import Permission from '#models/permission'
import User from '#models/user'
import { updatePermissionValidator } from '#validators/permission'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { processErrorMessages } from '../../helpers/remove_duplicate.js'
import Ws from '#services/ws'

// Fonction helper pour notifier les clients d'une mise à jour de permissions
async function emitPermissionsUpdate(profilId: number, companyId: number) {
  if (!profilId || !companyId) return
  try {
    const affectedUsers = await User.query()
      .where('profilId', profilId)
      .andWhere('companieId', companyId)

    for (const user of affectedUsers) {
      await user.load('Profil', (p) => p.preload('Permission'))
      await user.load('Companies')

      const roomName = `company_${user.companieId}`

      Ws.io?.to(roomName).emit('permissions_updated', user.serialize())
      console.log(
        `Événement 'permissions_updated' émis pour les utilisateurs ${user.id} dans le salon ${roomName}`
      )
    }
  } catch (error) {
    console.error(`Erreur lors de l'émission du socket 'permissions_updated':`, error)
  }
}

export default class PermissionsController {
  async allPermission({ auth, request, bouncer, response }: HttpContext) {
    const user = auth.user

    if (!user) {
      return response.unauthorized('Utilisateur non authentifié')
    }
    await user.load('Profil', (profilQuery: any) => {
      profilQuery.preload('Permission')
    })

    if (await bouncer.with('PermissionPolicy').denies('view')) {
      return response.forbidden("Désolé, vous n'êtes pas autorisé à voir les permissions.")
    }
    const { companieId } = request.qs()
    const query = Permission.query().where({ companieId })

    const permissions = await query
      .orderBy('id', 'asc')
      .preload('Profil')
      .preload('Companies')
      .paginate(1, 50)

    return response.json(permissions)
  }

  async show({ auth, bouncer, request, response }: HttpContext) {
    try {
      const user = auth.user

      if (!user) {
        return response.unauthorized('Utilisateur non authentifié')
      }
      await user.load('Profil', (profilQuery: any) => {
        profilQuery.preload('Permission')
      })

      if (await bouncer.with('PermissionPolicy').denies('view')) {
        return response.forbidden("Désolé, vous n'êtes pas autorisé à voir les permissions.")
      }

      const { permissionId } = request.qs()

      if (!permissionId) {
        return response.badRequest({ status: 400, error: 'Permission ID is required' })
      }

      const permission = await Permission.query()
        .preload('Profil')
        .preload('Companies')
        .where('id', permissionId)
        .firstOrFail()

      return response.ok({ status: 200, permission })
    } catch (error) {
      const message = processErrorMessages(error)
      return response.badRequest({ status: 400, error: message })
    }
  }

  public async update({ auth, bouncer, request, response }: HttpContext) {
    const trx = await db.transaction()
    try {
      const user = auth.user
      if (!user) {
        return response.unauthorized('Utilisateur non authentifié')
      }
      await user.load('Profil', (profilQuery: any) => {
        profilQuery.preload('Permission')
      })

      if (await bouncer.with('PermissionPolicy').denies('update')) {
        await trx.rollback()
        return response.forbidden("Désolé, vous n'êtes pas autorisé à modifier les permissions.")
      }

      const payload = await request.validateUsing(updatePermissionValidator)
      const { permissionId } = request.qs()

      const permission = await Permission.findOrFail(permissionId, { client: trx })

      permission.merge(payload)
      await permission.save()

      await trx.commit()
      if (permission.profilId && permission.companieId) {
        await emitPermissionsUpdate(permission.profilId, permission.companieId)
      }

      return response.ok({
        status: 200,
        message: 'Permissions mises à jour avec succès.',
      })
    } catch (error) {
      await trx.rollback()
      const message = processErrorMessages(error)
      return response.badRequest({
        status: 400,
        error: message || 'Une erreur est survenue lors de la mise à jour des permissions.',
      })
    }
  }
}

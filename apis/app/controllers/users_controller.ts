import Companie from '#models/companie'
import User from '#models/user'
import VerifMailToken from '#models/verif_mail_token'
import fs from 'node:fs/promises'
import env from '#start/env'
import { createUserValidator, updateUserValidator, registerValidator } from '#validators/user'
import { cuid } from '@adonisjs/core/helpers'
import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import db from '@adonisjs/lucid/services/db'
import mail from '@adonisjs/mail/services/main'
import user_service from '#services/user_service'
import crypto from 'node:crypto'
import { processErrorMessages } from '../../helpers/remove_duplicate.js'
import { seedProfile } from '../../helpers/seed_profil.js'
import { seedTypeDeDepense } from '../../helpers/seed_type_de_depense.js'
import { seedPermission } from '../../helpers/seed_permission.js'
import { UpdateCompanieValidator } from '#validators/companie'
import Ws from '#services/ws'
import Pack from '#models/pack'
import Abonnement from '#models/abonnement'
import { DateTime } from 'luxon'

// Fonction helper pour notifier les clients d'une mise à jour des utilisateurs
async function emitUserUpdate(companyId: number, eventName: string) {
  if (!companyId) return

  try {
    const { allUsers, users } = await user_service.fetchAndFormatUsers(companyId, 1, 10)

    const roomName = `company_${companyId}`
    const payload = {
      users,
      allUsers,
      companyId,
    }

    Ws.io?.to(roomName).emit(eventName, payload)
    console.log(`Événement '${eventName}' émis dans le salon '${roomName}'`)
  } catch (error) {
    console.error(`Erreur lors de l'émission du socket '${eventName}':`, error)
  }
}

export default class UsersController {
  // 1. all()
  async all({ request, response }: HttpContext) {
    try {
      const { page, perpage, companieId } = request.qs()
      const pageNumber = page ? Number.parseInt(page) : 1
      const perPageNumber = perpage ? Number.parseInt(perpage) : 10
      const { allUsers, users } = await user_service.fetchAndFormatUsers(
        companieId,
        pageNumber,
        perPageNumber
      )
      return response.ok({ users, allUsers })
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error)
      return response.status(500).send({ error: 'Erreur interne du serveur' })
    }
  }

  // 2. allUserSys()
  async allUserSys({ response }: HttpContext) {
    try {
      const { allUsers, users } = await user_service.fetchAndFormatAllUsers(1, 10000)
      return response.ok({ users, allUsers })
    } catch (error) {
      console.error('Error fetching users:', error)
      return response.status(500).json({ error: 'An error occurred while fetching users.' })
    }
  }

  // 2. allCompanies()
  async allCompanies({ response }: HttpContext) {
    try {
      const { allCompanies, companies } = await user_service.fetchAndFormatAllCompanies(1, 10000)
      return response.ok({ companies, allCompanies })
    } catch (error) {
      console.error('Error fetching users:', error)
      return response.status(500).json({ error: 'An error occurred while fetching users.' })
    }
  }

  async register({ request, response }: HttpContext) {
    const trx = await db.transaction()

    try {
      const payload = await request.validateUsing(registerValidator)
      const { companyName, address, phoneNumber } = request.body()

      let logoUrl: string = ''
      if (payload?.avatar) {
        const uniqueId = cuid()
        const fileName = `${uniqueId}.${payload.avatar.extname}`
        await payload.avatar.move(app.makePath('uploads/logo'), {
          name: fileName,
          overwrite: true,
        })
        logoUrl = `logo/${fileName}`
      }

      const company = await Companie.create(
        { logoUrl, companyName, address, phoneNumber, showCompanyName: true },
        { client: trx }
      )

      const profilesMap = await seedProfile(company.id, trx)

      const user = await User.create(
        {
          ...payload,
          companieId: company.id,
          profilId: profilesMap['Superadmin'],
        },
        { client: trx }
      )

      await seedTypeDeDepense(company.id, user.id, trx)
      await seedPermission(company.id, profilesMap, trx)

      let tokenGenerated: string
      let existingToken: any
      do {
        tokenGenerated = crypto.randomBytes(20).toString('hex')
        existingToken = await VerifMailToken.query().where('token', tokenGenerated).first()
      } while (existingToken)

      await VerifMailToken.create(
        { userId: user.id, email: user.email, token: tokenGenerated },
        { client: trx }
      )

      const link = `${env.get('VITE_FRONT_URL')}/login?token=${tokenGenerated}&render=register&email=${user.email}&userId=${user.id}`
      const texto = `${tokenGenerated}${user.email}${user.id}`
      const mailFrom = env.get('MAIL_FROM') || ''
      await mail.send((message) => {
        message
          .to(user.email)
          .from(mailFrom)
          .subject('CAISSE | VALIDATION DE MAIL')
          .embed(app.publicPath('logo/logo.png'), 'logo')
          .htmlView('emails/verify_email', { link, texto })
      })

      const selectedPack = await Pack.query().where('libelle', 'Démo').first()
      if (selectedPack) {
        const dateDebut = DateTime.now()
        const dateFin = dateDebut.plus({ days: selectedPack.duree })

        await Abonnement.create(
          {
            companieId: company.id,
            packId: selectedPack.id,
            userId: user.id,
            packLibelle: selectedPack.libelle,
            packDescription: selectedPack.description,
            packMontant: selectedPack.montant,
            dateDebut: dateDebut,
            dateFin: dateFin,
          },
          { client: trx }
        )
      }

      await trx.commit()

      return response.created({
        status: 200,
        message: 'Nous avons bien reçu vos données. Veuillez vérifier votre boîte mail.',
      })
    } catch (error) {
      console.log(error.message)
      await trx.rollback()
      const message =
        typeof processErrorMessages === 'function' ? processErrorMessages(error) : error.message
      return response.badRequest({ status: 400, error: message })
    }
  }

  // 4. createUser()
  async createUser({ request, response }: HttpContext) {
    const trx = await db.transaction()
    try {
      const payload = await request.validateUsing(createUserValidator)

      let logoUrl: string | null = null
      const profil = request.file('photo', { extnames: ['jpg', 'jpeg', 'png'], size: '5mb' })

      if (profil && !profil.hasErrors) {
        const fileName = `${cuid()}.${profil.extname}`
        await profil.move(app.makePath('uploads/photoProfil'), { name: fileName, overwrite: true })
        logoUrl = `photoProfil/${fileName}`
      }

      const password = crypto.randomBytes(3).toString('hex')
      const user = await User.create({ ...payload, password, avatarUrl: logoUrl }, { client: trx })

      let tokenGenerated: string
      let existingToken: any
      do {
        tokenGenerated = crypto.randomBytes(20).toString('hex')
        existingToken = await VerifMailToken.query({ client: trx })
          .where('token', tokenGenerated)
          .first()
      } while (existingToken)

      await VerifMailToken.create(
        { userId: user.id, email: user.email, token: tokenGenerated },
        { client: trx }
      )

      const link = `${env.get('VITE_FRONT_URL')}/login?token=${tokenGenerated}&render=register&email=${user.email}&userId=${user.id}`
      const texto = `${tokenGenerated}${user.email}${user.id}`
      const mailFrom = env.get('MAIL_FROM') || ''
      await mail.send((message) => {
        message
          .to(user.email)
          .from(mailFrom)
          .subject('CAISSE | VALIDATION DE MAIL')
          .embed('public/logo/logo.png', 'logo')
          .htmlView('emails/compte_mail', { link, texto, email: user.email, password })
      })

      await trx.commit()

      if (user.companieId) {
        await emitUserUpdate(user.companieId, 'user_created')
      }

      return response.created({
        status: 200,
        message: 'Utilisateur créé. Un email de vérification a été envoyé.',
      })
    } catch (error) {
      await trx.rollback()
      const message = processErrorMessages(error)
      return response.badRequest({ status: 400, error: message })
    }
  }

  // 5. updateCompany()
  async updateCompany({ request, response }: HttpContext) {
    try {
      const { companieId } = request.qs()
      const companie = await Companie.findOrFail(companieId)
      let logoUrl: string = companie.logoUrl
      const payload = await request.validateUsing(UpdateCompanieValidator)
      const avatarFile = request.file('avatar')

      if (avatarFile) {
        const fileName = `${cuid()}.${avatarFile.extname}`
        await avatarFile.move(app.makePath('uploads/logo'), { name: fileName, overwrite: true })
        logoUrl = `logo/${fileName}`
      }

      companie.merge({ ...payload, logoUrl })
      await companie.save()

      return response.created({
        status: 200,
        message: 'Entreprise modifiée avec succès',
      })
    } catch (error) {
      const message = processErrorMessages(error)
      return response.badRequest({
        status: 400,
        error: message || 'Une erreur est survenue lors de la mise à jour de l’Entreprise.',
      })
    }
  }

  // 6. update()
  // Imports requis (assumés pour fs, app, cuid, etc.)

  async update({ request, response }: HttpContext) {
    try {
      const { userId } = request.qs()
      const user = await User.findOrFail(userId)

      // 1. Validation des données de formulaire (texte)
      const payload = await request.validateUsing(updateUserValidator(userId))

      if (payload.email && payload.email !== user.email) {
        const existingUser = await User.query().where('email', payload.email).first()
        if (existingUser) {
          return response.badRequest({ status: 400, error: "L'adresse e-mail est déjà utilisée." })
        }
      }

      let avatarUrl: any = user.avatarUrl

      // 2. Récupération et validation du fichier une seule fois
      const profil = request.file('photo', {
        extnames: ['jpg', 'jpeg', 'png'],
        size: '5mb',
      })

      // 3. Vérification : le fichier existe et n'a pas d'erreurs
      if (profil && !profil.hasErrors) {
        if (user.avatarUrl) {
          // Utiliser user.avatarUrl au lieu d'avatarUrl (qui a la même valeur mais c'est plus clair)
          // Tentative de suppression de l'ancien fichier
          fs.unlink(app.makePath('uploads', user.avatarUrl)).catch(() =>
            console.warn('Ancienne image introuvable ou déjà supprimée.')
          )
        }

        const fileName = `${cuid()}.${profil.extname}`
        // Utilisation du chemin correct pour le move
        await profil.move(app.makePath('uploads/photoProfil'), { name: fileName, overwrite: true })
        avatarUrl = `photoProfil/${fileName}`
      }

      // Si aucun nouveau fichier n'est fourni, avatarUrl garde la valeur précédente de user.avatarUrl.
      user.merge({ ...payload, avatarUrl })
      await user.save()

      if (user.companieId) {
        await emitUserUpdate(user.companieId, 'user_updated')
      }

      return response.ok({ status: 200, message: 'Utilisateur modifié avec succès' })
    } catch (error) {
      console.log(error?.message)
      const message = processErrorMessages(error)
      return response.badRequest({ status: 400, error: message })
    }
  }

  // 7. show()
  async show({ request, response }: HttpContext) {
    try {
      const { userId } = request.qs()
      if (!userId) return response.badRequest({ status: 400, error: 'User ID is required' })
      const user = await User.findOrFail(userId)
      return response.ok({ status: 200, user })
    } catch (error) {
      const message = processErrorMessages(error)
      return response.badRequest({ status: 400, error: message })
    }
  }

  // 8. showCompnany()
  async showCompnany({ request, response }: HttpContext) {
    try {
      const { companieId } = request.qs()
      if (!companieId) return response.badRequest({ status: 400, error: 'Companie ID is required' })
      const companie = await Companie.findOrFail(companieId)
      return response.ok({ status: 200, companie })
    } catch (error) {
      const message = processErrorMessages(error)
      return response.badRequest({ status: 400, error: message })
    }
  }

  // 9. changeAccountStatus()
  async changeAccountStatus({ auth, request, response }: HttpContext) {
    const trx = await db.transaction()
    const userConnected = auth.user!
    try {
      const { userId, profilId, status } = request.body()
      if (profilId === undefined || status === undefined || userId === undefined) {
        throw new Error("Le profil, le statut et l'utilisateur sont requis.")
      }
      const user = await User.findOrFail(userId, { client: trx })
      if (userConnected.profilId !== 1) {
        await trx.rollback()
        return response.forbidden("Seul l'administrateur est autorisé à modifier les statuts.")
      }
      if (user.profilId === 1) {
        await trx.rollback()
        return response.forbidden(
          'Le profil de super admin ne peut être modifié pour des raison de sécurité.'
        )
      }
      user.merge({ status: status, profilId: profilId })
      await user.save()
      await trx.commit()
      if (user.companieId) {
        await emitUserUpdate(user.companieId, 'user_updated')
      }
      return response.ok({
        status: 200,
        message: 'Modification éffectuée avec succès.',
      })
    } catch (error) {
      await trx.rollback()
      const message = processErrorMessages(error)
      return response.badRequest({ status: 400, error: message })
    }
  }

  // 10. delete()
  async delete({ auth, bouncer, request, response }: HttpContext) {
    try {
      const userConnected = auth.user!
      await userConnected?.load('Profil', (profilQuery) => {
        profilQuery.preload('Permission')
      })

      if (await bouncer.with('UserPolicy').denies('delete')) {
        return response.forbidden("Désolé, vous n'êtes pas autorisé à supprimer des utilisateurs.")
      }

      const { userId } = request.qs()
      const user = await User.query().where('id', userId).preload('Depense').firstOrFail()
      const companyId = user.companieId

      if (Array.isArray(user.Depense) && user.Depense.length > 0) {
        return response.badRequest({
          status: 400,
          error: "Vueillez d'abord supprimer les dépenses liées à ce compte.",
        })
      }

      await user.delete()

      if (companyId) {
        await emitUserUpdate(companyId, 'user_deleted')
      }

      return response.ok({ status: 200, message: 'Utilisateur supprimé avec succès' })
    } catch (error) {
      console.log(error?.message)
      const message = processErrorMessages(error)
      return response.badRequest({ status: 400, error: message })
    }
  }

  // 11. activeAccount()
  async activeAccount({ request, response }: HttpContext) {
    try {
      const { userId, token, email } = request.qs()
      if (!userId || !token || !email) {
        return response.badRequest({ status: 400, message: 'Paramètres manquants.' })
      }
      console.log(request.qs())

      const userToken = await VerifMailToken.query().where({ userId, token, email }).first()

      if (userToken) {
        const userFound = await User.findOrFail(userId)
        if (userFound.validEmail) {
          return response.ok({
            status: 200,
            render: 'login',
            message: 'Votre compte est déjà actif.',
          })
        }
        if (userFound.email !== email) {
          return response.badRequest({ status: 400, message: "L'email ne correspond pas." })
        }

        userFound.merge({ validEmail: true })
        await userFound.save()

        await emitUserUpdate(userFound.companieId, 'user_updated')

        return response.ok({
          status: 200,
          render: 'login',
          message: 'Email confirmé. Votre compte sera activé sous peu.',
        })
      } else {
        return response.badRequest({ status: 400, message: 'Token non reconnu !' })
      }
    } catch (error) {
      console.log(error?.message)
      const message = processErrorMessages(error)
      return response.badRequest({ status: 400, error: message })
    }
  }
}

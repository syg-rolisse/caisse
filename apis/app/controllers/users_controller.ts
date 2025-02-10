import Approvisionnement from '#models/approvisionnement'
import Companies from '#models/companie'
import Solde from '#models/solde'
import User from '#models/user'
import VerifMailToken from '#models/verif_mail_token'
import env from '#start/env'
import { registerValidator, updateUserValidator } from '#validators/user'
import { cuid } from '@adonisjs/core/helpers'
import type { HttpContext } from '@adonisjs/core/http'
//import app from '@adonisjs/core/services/app'
import app from '@adonisjs/core/services/app'
import db from '@adonisjs/lucid/services/db'
import mail from '@adonisjs/mail/services/main'
import crypto from 'node:crypto'
import { processErrorMessages } from '../../helpers/remove_duplicate.js'
import { seedProfile } from '../../helpers/seed_profil.js'
import { seedTypeDeDepense } from '../../helpers/seed_type_de_depense.js'
import { seedPermission } from '../../helpers/seed_permission.js'
import TypeDeDepense from '#models/type_de_depense'
import Companie from '#models/companie'
import { UpdateCompanieValidator } from '#validators/companie'
export default class UsersController {
  async dashboardInfos({ request, response }: HttpContext) {
    try {
      const { companieId } = request.qs()

      // Vérification que companieId est présent et est un nombre valide
      if (!companieId || Number.isNaN(Number(companieId))) {
        return response.ok({
          data: [],
          message: "Identifiant de l'entreprise non reconnu...",
        })
      }

      const users = await User.query().where({ companieId }).preload('Profil').preload('Companies')

      const activeUserCount = users.filter((user) => user.status === true).length
      const inactiveUserCount = users.filter((user) => user.status === false).length

      const adminCount = users.filter(
        (user) => user.Profil?.$attributes?.wording === 'Admin'
      ).length
      const employeCount = users.filter(
        (user) => user.Profil?.$attributes?.wording === 'Employé'
      ).length
      const secretaireCount = users.filter(
        (user) => user.Profil?.$attributes?.wording === 'Sécrétaire'
      ).length

      let solde = await Solde.query().where({ companieId }).forUpdate().first()
      let leSolde = solde ? solde.montant : 0

      const { dateDebut, dateFin } = request.qs()

      const query = Approvisionnement.query().where({ companieId })

      if (dateDebut) {
        query.where('created_at', '>=', new Date(dateDebut))
      }
      if (dateFin) {
        query.where('created_at', '<=', new Date(dateFin))
      }

      const totalApproResult = await query.sum('montant as total')
      const totalAppro = totalApproResult[0]?.$extras?.total || 0

      const dernierAppro = await Approvisionnement.query()
        .where({ companieId })
        .orderBy('created_at', 'desc')
        .first()

      const totalTypeDepense = await TypeDeDepense.query()
        .where({ companieId })
        .orderBy('created_at', 'desc')

      return {
        statusSummary: {
          activeUsers: activeUserCount,
          inactiveUsers: inactiveUserCount,
        },
        profilSummary: {
          admin: adminCount,
          employe: employeCount,
          secretaire: secretaireCount,
        },
        solde: leSolde,
        totalTypeDepense: totalTypeDepense.length,
        approvisionnementSummary: {
          total: totalAppro,
          dernierMontant: dernierAppro?.montant || 0,
          du: dernierAppro?.createdAt || '',
        },
        users,
      }
    } catch (error) {
      console.error('Error fetching dashboard information:', error)
      return response.status(500).json({
        error: 'An error occurred while fetching dashboard information.',
      })
    }
  }

  async allUsers({ request, response }: HttpContext) {
    try {
      const { page, perpage, companieId, status } = request.qs()

      // Vérification que companieId est présent et est un nombre valide
      if (!companieId || Number.isNaN(Number(companieId))) {
        return response.ok({
          data: [],
          message: "Identifiant de l'entreprise non reconnu...",
          meta: {
            total: 0,
            per_page: perpage || 10,
            current_page: page || 1,
            last_page: 1,
          },
        })
      }
      const query = User.query()
        .where({ companieId })
        .orderBy('id', 'desc')
        .preload('Profil')
        .preload('Companies')

      if (status) {
        // query.where('status', JSON.parse(status))
      }

      const users = await query.paginate(page || 1, perpage || 10)
      return response.json(users.toJSON())
    } catch (error) {
      console.error('Error fetching users:', error)
      return response.status(500).json({ error: 'An error occurred while fetching users.' })
    }
  }

  async allUserSys({ request, response }: HttpContext) {
    try {
      const { page, perpage, status } = request.qs()

      const query = User.query().orderBy('id', 'desc').preload('Profil').preload('Companies')

      if (status) {
        // query.where('status', JSON.parse(status))
      }

      const users = await query.paginate(page || 1, perpage || 10)
      return response.json(users.toJSON())
    } catch (error) {
      console.error('Error fetching users:', error)
      return response.status(500).json({ error: 'An error occurred while fetching users.' })
    }
  }

  async register({ request, response }: HttpContext) {
    const trx = await db.transaction()
    let logoUrl: string = ''
    const { companyName, address, phoneNumber } = request.body()

    try {
      const payload = await request.validateUsing(registerValidator)

      if (payload?.avatar) {
        const uniqueId = cuid()
        const fileName = `${uniqueId}.${payload.avatar.extname}`

        await payload.avatar.move(app.makePath('uploads/logo'), {
          name: fileName,
          overwrite: true,
        })
        logoUrl = `logo/${fileName}`
      }

      const company = await Companies.create({
        logoUrl,
        companyName: companyName,
        address: address,
        phoneNumber: phoneNumber,
      })

      if (company) {
        const user = await User.create({ ...payload, companieId: company.$attributes.id })

        /*Création des profils */
        const profilSeedingSuccess = await seedProfile(company.$attributes.id)
        if (!profilSeedingSuccess) {
          throw new Error('Erreur lors de la création des profils.')
        }
        /*Création des profils */
        const typeDepenseSeedingSuccess = await seedTypeDeDepense(
          company.$attributes.id,
          user.$attributes.id
        )
        if (!typeDepenseSeedingSuccess) {
          throw new Error('Erreur lors de la création des profils.')
        }

        /*Création des permissions */
        const permissionSeedingSuccess = await seedPermission(company.$attributes.id)
        if (!permissionSeedingSuccess) {
          throw new Error('Erreur lors de la création des profils.')
        }

        let tokenGenerated: string
        let existingToken: any

        do {
          tokenGenerated = crypto.randomBytes(20).toString('hex')
          existingToken = await VerifMailToken.query().where('token', tokenGenerated).first()
        } while (existingToken)

        await VerifMailToken.create({ userId: user?.id, email: user?.email, token: tokenGenerated })

        const link = `${env.get('VITE_FRONT_URL')}/login?token=${tokenGenerated}&render=register&email=${user?.email}&userId=${user?.id}`
        const texto = `${tokenGenerated + '' + user?.email + '' + user?.id}`
        await mail.send((message) => {
          message
            .to(user.email)
            .from('rolissecodeur@gmail.com')
            .subject('CAISSE | VALIDATION DE MAIL')
            .htmlView('emails/verify_email', {
              link: link,
              texto: texto,
            })
        })

        await trx.commit() // Valider la transaction

        return response.created({
          status: 200,
          message: 'Nous avons bien reçu vos données. Bien vouloir vérifier votre boite mail.',
        })
      } else {
        return response.forbidden("Echec de la création de l'entreprise.")
      }
    } catch (error) {
      console.log(error.message)

      await trx.rollback()
      const message = processErrorMessages(error)
      return response.badRequest({ status: 400, error: message })
    }
  }

  async updateCompany({ request, response }: HttpContext) {
    try {
      const { companieId } = request.qs()
      console.log(request.files('avatar'))
      const companie = await Companie.findOrFail(companieId)
      let logoUrl: string = ''
      const payload = await request.validateUsing(UpdateCompanieValidator)
      const avatarFile = request.files('avatar')[0]
      console.log(avatarFile?.extname)

      //Gestion de l'avatar
      if (avatarFile) {
        const uniqueId = cuid() // Générer un identifiant unique
        const fileName = `${uniqueId}.${avatarFile.extname}`
        // Créer le nom de fichier avec l'extension
        await avatarFile.move(app.makePath('uploads/logo'), {
          name: fileName,
          overwrite: true,
        })
        logoUrl = `logo/${fileName}`
      } else {
        logoUrl = companie.$attributes.avatarUrl
      }
      // delete payload.avatar

      //Mise à jour des informations Entreprise , : payload.email
      companie.merge({ ...payload, logoUrl: logoUrl })
      await companie.save()

      return response.created({
        status: 200,
        message: 'Entreprise modifiée avec succès',
      })
    } catch (error) {
      console.log(error.message)

      const message = processErrorMessages(error)
      return response.badRequest({
        status: 400,
        error: message || 'Une erreur est survenue lors de la mise à jour de l’Entreprise.',
      })
    }
  }

  async update({ request, response }: HttpContext) {
    try {
      const { userId } = request.qs()

      const user = await User.findOrFail(userId)

      const payload = await request.validateUsing(updateUserValidator(userId))

      if (payload.profilId === 1) {
        return response.badRequest({
          status: 400,
          error:
            "Pour des raisons de sécurité, ils ne pas permis de modiifer les informations de l'admin.",
        })
      }

      // Vérifier si un autre utilisateur utilise déjà cet e-mail
      if (payload.email && payload.email !== user.email) {
        const existingUser = await User.query().where('email', payload.email).first()
        if (existingUser) {
          return response.badRequest({
            status: 400,
            error: "L'adresse e-mail est déjà utilisée par un autre utilisateur.",
          })
        }
      }
      // console.log(payload)

      // Gestion de l'avatar
      if (payload?.avatar) {
        const uniqueId = cuid() // Générer un identifiant unique
        const fileName = `${uniqueId}.${payload.avatar.extname}`
        // Créer le nom de fichier avec l'extension
        await payload.avatar.move(app.makePath('uploads/avatars'), {
          name: fileName,
          overwrite: true,
        })
        payload.avatarUrl = `avatars/${fileName}`
      } else {
        payload.avatarUrl = user.$attributes.avatarUrl
      }
      delete payload.avatar

      // Mise à jour des informations utilisateur , : payload.email
      user.merge({ ...payload })
      await user.save()

      return response.created({
        status: 200,
        message: 'Utilisateur modifié avec succès',
      })
    } catch (error) {
      console.log(error.message)

      const message = processErrorMessages(error)
      return response.badRequest({
        status: 400,
        error: message || 'Une erreur est survenue lors de la mise à jour de l’utilisateur.',
      })
    }
  }

  async show({ request, response }: HttpContext) {
    try {
      const { userId } = request.qs()

      if (!userId) {
        return response.badRequest({ status: 400, error: 'User ID is required' })
      }

      const user = await User.findOrFail(userId)

      response.created({ status: 200, user })
    } catch (error) {
      const message = processErrorMessages(error)
      return response.badRequest({ status: 400, error: message })
    }
  }
  async showCompnany({ request, response }: HttpContext) {
    try {
      const { companieId } = request.qs()

      if (!companieId) {
        return response.badRequest({ status: 400, error: 'companie ID is required' })
      }

      const companie = await Companie.findOrFail(companieId)

      response.created({ status: 200, companie })
    } catch (error) {
      const message = processErrorMessages(error)
      return response.badRequest({ status: 400, error: message })
    }
  }

  async changeAccountStatus({ request, response }: HttpContext) {
    const trx = await db.transaction()

    try {
      const { userId, userConnectedId } = request.qs()
      const { profilId, status } = request.body()

      // Vérification des entrées
      if (!profilId || status === undefined) {
        throw new Error('Profil ID et Status sont requis.')
      }

      // Récupération des utilisateurs dans la transaction
      const user = await User.query({ client: trx }).where('id', userId).firstOrFail()
      const userConnected = await User.query({ client: trx })
        .where('id', userConnectedId)
        .preload('Profil')
        .preload('Companies')
        .first()

      if (!userConnected) {
        throw new Error('Compte non identifié.')
      }

      if (userConnected && userConnected?.$attributes?.profilId !== 1) {
        return response.badRequest({
          status: 400,
          error: "Seule l'administrateur est autorisé à modifier les status",
        })
      }
      if (profilId === 1) {
        return response.badRequest({
          status: 400,
          error:
            "Pour des raisons de sécurité, ils ne pas permis de modiifer les informations de l'admin.",
        })
      }

      // Mise à jour des informations utilisateur avec la transaction
      user.useTransaction(trx)
      user.merge({ status: status, profilId: profilId })
      await user.save()

      // Commit de la transaction
      await trx.commit()

      return response.created({
        status: 200,
        message: status ? 'Compte activé avec succès' : 'Compte désactivé avec succès',
      })
    } catch (error) {
      // Rollback en cas d'erreur
      await trx.rollback()
      console.log(error.message)

      return response.badRequest({
        status: 400,
        error: error.message || "Une erreur est survenue lors de la mise à jour de l'utilisateur.",
      })
    } finally {
      // S'assurer que la transaction est terminée
      if (!trx.isCompleted) {
        await trx.rollback()
      }
    }
  }

  async delete({ auth, bouncer, request, response }: HttpContext) {
    try {
      const userConnected = auth.user

      if (!userConnected) {
        console.error('Erreur: Utilisateur non authentifié')
        return response.unauthorized('Utilisateur non authentifié')
      }
      // Préchargez le profil et les permissions de l'utilisateur
      await userConnected.load('Profil', (profilQuery: any) => {
        profilQuery.preload('Permission')
      })

      // Vérifie si l'utilisateur a l'autorisation de supprimer les utilisateurs
      if (await bouncer.with('UserPolicy').denies('delete')) {
        return response.forbidden("Désolé, vous n'êtes pas autorisé à supprimer les utilisateurs.")
      }

      const { userId } = request.qs()

      const user = await User.findOrFail(userId)

      if (user.$attributes.profilId === 1) {
        return response.forbidden('Désolé, le compte admin ne peut être supprimer.')
      }

      user.delete()
      return response.created({ status: 200, message: 'Utilisateur supprimé avec succès' })
    } catch (error) {
      const message = processErrorMessages(error)
      return response.badRequest({ status: 400, error: message })
    }
  }
  async activeAccount({ request, response }: HttpContext) {
    try {
      // Récupération des paramètres de la requête
      const { userId, token, email } = request.qs()

      // Vérification que tous les paramètres nécessaires sont présents
      if (!userId || !token || !email) {
        return response.badRequest({ status: 400, message: 'Paramètres manquants.' })
      }

      // Vérification du token dans la table VerifMailToken
      const user = await VerifMailToken.query()
        .where({
          userId: userId,
          token: token,
          email: email,
        })
        .first()

      // Si le token est valide
      if (user) {
        // Trouver l'utilisateur correspondant
        const userFound = await User.findOrFail(userId)

        // Vérification si l'email est déjà validé
        if (userFound?.$attributes?.validEmail) {
          if (userFound?.$attributes?.status) {
            return response.ok({
              status: 200,
              render: 'login',
              message: 'Votre compte est déjà actif. Vous pouvez vous connecter.',
            })
          } else {
            return response.ok({
              status: 200,
              render: 'login',
              message: 'Votre mail a bien été vérifié. Patientez-que le compte soit actif.',
            })
          }
        } else {
          // Si l'email n'est pas validé, on le marque comme validé
          if (userFound.email !== email) {
            return response.badRequest({
              status: 400,
              message: "Email ne correspond pas à l'utilisateur.",
            })
          }

          userFound.merge({ validEmail: true })
          await userFound.save()

          return response.ok({
            status: 200,
            render: 'login',
            message: 'Votre mail est bien confirmé. Votre compte sera actif sous peu.',
          })
        }
      } else {
        // Si le token est invalide ou introuvable
        return response.badRequest({ status: 400, message: 'Token non reconnu !' })
      }
    } catch (error) {
      // Traitement des erreurs générales
      console.log(error.message)

      const message = processErrorMessages(error)
      return response.badRequest({ status: 400, error: message })
    }
  }
}

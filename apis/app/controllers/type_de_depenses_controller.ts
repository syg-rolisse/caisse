import Depense from '#models/depense'
import TypeDeDepense from '#models/type_de_depense'
import { createTypeDepenseValidator, updateTypeDepenseValidator } from '#validators/type_de_depense'
import type { HttpContext } from '@adonisjs/core/http'
import { processErrorMessages } from '../../helpers/remove_duplicate.js'
import type_depense_service from '#services/type_depense_service'
import Ws from '#services/ws'

async function emitTypeDepenseUpdate(companyId: number, eventName: string) {
  if (!companyId) return

  try {
    const { allTypeDepenses, typeDepenses } = await type_depense_service.fetchAndFormatTypeDepenses(
      companyId,
      1,
      10
    )

    const roomName = `company_${companyId}`
    const payload = {
      typeDepenses,
      allTypeDepenses,
      companyId,
    }

    Ws.io?.to(roomName).emit(eventName, payload)
    console.log(`Événement '${eventName}' émis dans le salon '${roomName}'`)
  } catch (error) {
    console.error(`Erreur lors de l'émission du socket '${eventName}':`, error)
  }
}

export default class TypeDeDepensesController {
  async index({ request, response }: HttpContext) {
    try {
      const { page, perpage, companieId } = request.qs()
      const pageNumber = page ? Number.parseInt(page) : 1
      const perPageNumber = perpage ? Number.parseInt(perpage) : 10

      const { allTypeDepenses, typeDepenses } =
        await type_depense_service.fetchAndFormatTypeDepenses(companieId, pageNumber, perPageNumber)
      return response.ok({ typeDepenses, allTypeDepenses })
    } catch (error) {
      console.error('Erreur lors de la récupération des Type De Depense:', error)
      return response.status(500).send({ error: 'Erreur interne du serveur' })
    }
  }

  async totalTypeDepense({ request, response }: HttpContext) {
    try {
      const { du, au, userId } = request.qs()
      const typesDeDepense = await TypeDeDepense.query()
        .preload('Depenses', (query) => {
          query
            .if(userId, (q) => q.where({ userId }))
            .if(du, (q) => q.where('createdAt', '>=', du))
            .if(au, (q) => q.where('createdAt', '<=', au))
            .preload('Mouvements')
        })
        .select('id', 'wording')

      const totals = typesDeDepense.map((type) => {
        const totalMontant = type.Depenses.reduce((sum, depense) => sum + depense.montant, 0)
        const totalPaye = type.Depenses.reduce(
          (sum, depense) =>
            sum + depense.Mouvements.reduce((paySum, mouvement) => paySum + mouvement.montant, 0),
          0
        )
        return {
          typeDeDepenseId: type.id,
          wording: type.wording,
          total: totalMontant,
          totalPaye: totalPaye,
        }
      })

      return response.ok(totals)
    } catch (error) {
      console.error('Erreur lors de la récupération des Type De Depense:', error)
      return response.status(500).send({ error: 'Erreur interne du serveur' })
    }
  }

  async editions({ request, response }: HttpContext) {
    try {
      const { du, au, userId, companieId } = request.qs()
      if (!companieId || Number.isNaN(Number(companieId))) {
        return response.ok({ data: [], message: "Identifiant de l'entreprise non reconnu..." })
      }
      const depenses = await Depense.query()
        .where({ companieId })
        .if(userId, (query) => query.where('userId', userId))
        .if(du, (query) => query.where('createdAt', '>=', du))
        .if(au, (query) => query.where('createdAt', '<=', au))
        .preload('typeDeDepense')
        .preload('Mouvements')
        .preload('user')
        .select('id', 'montant', 'facture_url', 'wording', 'createdAt', 'userId', 'typeDeDepenseId')
      return response.ok(depenses)
    } catch (error) {
      console.error('Erreur lors de la récupération des dépenses:', error)
      return response.status(500).send({ error: 'Erreur interne du serveur' })
    }
  }

  public async create({ request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(createTypeDepenseValidator)
      const typeDepense = await TypeDeDepense.create({ ...payload })

      if (payload.companieId) {
        await emitTypeDepenseUpdate(payload.companieId, 'type_depense_created')
      }

      return response.created({
        typeDepense,
        message: 'Type de dépense enregistré avec succès.',
      })
    } catch (error) {
      const message = processErrorMessages(error)
      return response.badRequest({ status: 400, error: message })
    }
  }

  async show({ request, response }: HttpContext) {
    try {
      const { typeDepenseId } = request.qs()
      if (!typeDepenseId) {
        return response.badRequest({
          status: 400,
          error: "L'identifiant du type de dépense est requis.",
        })
      }
      const typededepense = await TypeDeDepense.findOrFail(typeDepenseId)
      response.ok({ status: 200, typededepense })
    } catch (error) {
      const message = processErrorMessages(error)
      return response.badRequest({ status: 400, error: message })
    }
  }

  async update({ request, response }: HttpContext) {
    try {
      const { typeDepenseId } = request.qs()
      const typededepense = await TypeDeDepense.findOrFail(typeDepenseId)
      const payload = await request.validateUsing(updateTypeDepenseValidator)

      typededepense.merge(payload)
      await typededepense.save()

      if (typededepense.companieId) {
        await emitTypeDepenseUpdate(typededepense.companieId, 'type_depense_updated')
      }

      return response.ok({ status: 200, message: 'Type de dépense modifié avec succès' })
    } catch (error) {
      const message = processErrorMessages(error)
      return response.badRequest({ status: 500, error: message })
    }
  }

  async delete({ request, response }: HttpContext) {
    try {
      const { typeDepenseId } = request.qs()
      const typededepense = await TypeDeDepense.findOrFail(typeDepenseId)
      const companyId = typededepense.companieId

      await typededepense.delete()

      if (companyId) {
        await emitTypeDepenseUpdate(companyId, 'type_depense_deleted')
      }

      return response.ok({
        status: 200,
        message: 'Type de dépense supprimé avec succès',
      })
    } catch (error) {
      let message = ''
      if (error.code === 'E_ROW_NOT_FOUND') {
        message = 'Type de dépense non retrouvé.'
      } else {
        message = processErrorMessages(error)
      }
      return response.badRequest({ status: 400, error: message })
    }
  }
}

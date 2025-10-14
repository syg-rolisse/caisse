import Solde from '#models/solde'
import type { HttpContext } from '@adonisjs/core/http'
import { processErrorMessages } from '../../helpers/remove_duplicate.js'
import { soldeValidator } from '#validators/solde'
export default class SoldeController {
  async soldeCaisse({ auth, request, response }: HttpContext) {
    try {
      console.log(request.body())
      const payload = await request.validateUsing(soldeValidator)

      const user = await auth.use('api').authenticate()

      if (!user) {
        return response.unauthorized({
          status: 401,
          error: 'Unauthorized',
        })
      }

      const solde = await Solde.query().where({ companieId: payload.companieId }).first()

      return response.ok({ solde })
    } catch (error) {
      const message = processErrorMessages(error)
      return response.badRequest({ status: 500, error: message })
    }
  }
}

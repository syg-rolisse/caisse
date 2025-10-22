import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class VerifySourceAndUserMiddleware {
  private allowedOrigins = [
    'http://localhost:5174',
    'http://82.112.254.228:82',
    'http://82.112.254.228:84',
  ]
  private allowedEmails = [
    'rolissecodeur@gmail.com',
    'contact@oraadvices.com',
    'rolisse.adjevi@oraadvices.com',
    'bob.w@innovatech.com',
  ]

  public async handle(ctx: HttpContext, next: NextFn) {
    const { request, auth, response } = ctx
    const origin = request.header('origin') || request.header('referer') || ''
    const isAllowedOrigin = this.allowedOrigins.some((allowed) => origin.startsWith(allowed))

    if (isAllowedOrigin) {
      let connectedEmail: string | undefined
      let providedEmail: string | undefined

      try {
        await auth.check()
        connectedEmail = auth.user?.email
      } catch {}

      providedEmail = request.input('email')

      // Vérifier qu’au moins un email est fourni
      const emailToCheck = providedEmail || connectedEmail
      if (!emailToCheck) {
        return response.unauthorized({ error: 'Aucun utilisateur détecté.' })
      }

      // Si les deux existent, ils doivent être identiques
      if (connectedEmail && providedEmail && connectedEmail !== providedEmail) {
        return response.forbidden({
          error: 'Email fourni ne correspond pas à l’utilisateur connecté.',
        })
      }

      // Vérifier que l’email est autorisé
      if (!this.allowedEmails.includes(emailToCheck)) {
        return response.forbidden({ error: 'Désolé, ici est un espace réservé à ORA ADVICES.' })
      }
    }

    return next()
  }
}

// import type { HttpContext } from '@adonisjs/core/http'
// import type { NextFn } from '@adonisjs/core/types/http'

// export default class VerifySourceAndUserMiddleware {
//   async handle(ctx: HttpContext, next: NextFn) {
//     /**
//      * Middleware logic goes here (before the next call)
//      */
//     console.log(ctx)

//     /**
//      * Call next method in the pipeline and return its output
//      */
//     const output = await next()
//     return output
//   }
// }

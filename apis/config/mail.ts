import env from '#start/env'
import { defineConfig, transports } from '@adonisjs/mail'

const smtpUser = env.get('SMTP_USERNAME')
const smtpPassword = env.get('SMTP_PASSWORD')
const smtpHost = env.get('SMTP_HOST')
const smtpPort = env.get('SMTP_PORT')

if (!smtpUser || !smtpPassword || !smtpHost || !smtpPort) {
  throw new Error('SMTP configuration is incomplete. Please check your environment variables.')
}

const mailConfig = defineConfig({
  default: 'smtp',

  mailers: {
    smtp: transports.smtp({
      host: smtpHost,
      port: smtpPort,
      auth: {
        type: 'login',
        user: smtpUser,
        pass: smtpPassword,
      },
    }),
  },
})

export default mailConfig

declare module '@adonisjs/mail/types' {
  export interface MailersList extends InferMailers<typeof mailConfig> {}
}

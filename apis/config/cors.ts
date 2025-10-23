import { defineConfig } from '@adonisjs/cors'
/**
 * Configuration options to tweak the CORS policy. The following
 * options are documented on the official documentation website.
 *
 * https://docs.adonisjs.com/guides/security/cors
 */
const corsConfig = defineConfig({
  enabled: true,
  origin: [
    'http://82.112.254.228:5174',
    'https://staging-caisse.oraadvices.com',
    'https://caisse.oraadvices.com',
    'https://staging-backoffice-caisse.oraadvices.com',
    'https://backoffice-caisse.oraadvices.com',
    'http://localhost:5173',
    'http://localhost:5174',
  ], // Autoriser cette origine spécifique
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE'],
  headers: true,
  exposeHeaders: [],
  credentials: true,
  maxAge: 90,
})

export default corsConfig

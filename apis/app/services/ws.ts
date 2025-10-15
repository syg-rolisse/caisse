import server from '@adonisjs/core/services/server'
import { Server } from 'socket.io'

class Ws {
  io: Server | undefined
  private booted = false

  boot() {
    if (this.booted) {
      return
    }

    this.booted = true
    this.io = new Server(server.getNodeServer(), {
      cors: {
        // Remplacer '*' par la liste explicite des origines
        origin: [
          'http://82.112.254.228:5174',
          'http://82.112.254.228:81',
          'http://82.112.254.228:80',
          'https://caisse.oraadvices.com',
          'http://localhost:5173',
        ],
        methods: ['GET', 'POST'],
        // Ajouter cette ligne, c'est la plus importante !
        credentials: true,
      },
    })
  }
}

export default new Ws()

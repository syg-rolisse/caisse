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
        origin: '*',
      },
    })
  }
}

export default new Ws()

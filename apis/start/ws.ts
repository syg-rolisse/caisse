import Ws from '#services/ws'
import app from '@adonisjs/core/services/app'

app.ready(() => {
  Ws.boot()

  const io = Ws.io
  io?.on('connection', (socket) => {
    console.log('Nouvelle connexion:', socket.id)

    socket.on('depense_created', (companyId) => {
      socket.broadcast.emit('depense_created', companyId)
    })

    socket.on('depense_updated', (companyId) => {
      socket.broadcast.emit('depense_updated', companyId)
    })

    socket.on('depense_deleted', (companyId) => {
      socket.broadcast.emit('depense_deleted', companyId)
    })

    socket.on('type_depense_created', (companyId) => {
      socket.broadcast.emit('type_depense_created', companyId)
    })

    socket.on('type_depense_updated', (companyId) => {
      socket.broadcast.emit('type_depense_updated', companyId)
    })

    socket.on('type_depense_deleted', (companyId) => {
      socket.broadcast.emit('type_depense_deleted', companyId)
    })

    socket.on('approvisionnement_created', () => {
      socket.broadcast.emit('approvisionnement_created')
    })

    socket.on('approvisionnement_updated', () => {
      socket.broadcast.emit('approvisionnement_updated')
    })

    socket.on('approvisionnement_deleted', () => {
      socket.broadcast.emit('approvisionnement_deleted')
    })

    socket.on('user_created', () => {
      socket.broadcast.emit('user_created')
    })

    socket.on('user_updated', () => {
      socket.broadcast.emit('user_updated')
    })

    socket.on('user_deleted', () => {
      socket.broadcast.emit('user_deleted')
    })

    socket.on('sortie_created', () => {
      socket.broadcast.emit('sortie_created')
    })

    socket.on('sortie_updated', () => {
      socket.broadcast.emit('sortie_updated')
    })

    socket.on('sortie_deleted', () => {
      socket.broadcast.emit('sortie_deleted')
    })

    socket.on('test_created', () => {
      socket.broadcast.emit('test_created')
    })
  })
})

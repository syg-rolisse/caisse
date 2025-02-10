import { Socket } from 'socket.io'

export default class ThematiqueChannel {
  socket: Socket

  constructor(socket: Socket) {
    this.socket = socket
  }

  // Gérer l'événement 'new-thematique'
  handleNewThematique(data: any) {
    console.log('Nouvelle thématique reçue:', data)
    // Vous pouvez ici émettre à tous les clients connectés
    this.socket.broadcast.emit('new-thematique', {
      message: `Nouvelle thématique ajoutée: ${data.message}`,
    })
  }

  // Gérer l'événement 'update-thematique'
  handleUpdateThematique(data: any) {
    console.log('Thématique mise à jour:', data)
    this.socket.broadcast.emit('update-thematique', {
      message: `Thématique mise à jour: ${data.message}`,
    })
  }

  // Gérer l'événement 'delete-thematique'
  handleDeleteThematique(data: any) {
    console.log('Thématique supprimée:', data)
    this.socket.broadcast.emit('delete-thematique', {
      message: `Thématique supprimée: ${data.message}`,
    })
  }
}

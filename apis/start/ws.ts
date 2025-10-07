import Ws from '#services/ws'
import app from '@adonisjs/core/services/app'
import type_depense_service from '#services/type_depense_service'
import depense_service from '#services/depense_service'
import user_service from '#services/user_service'
import appro_service from '#services/appro_service'
import solde_service from '#services/solde_service'

app.ready(() => {
  Ws.boot()

  const io = Ws.io
  io?.on('connection', (socket) => {
    console.log('Nouvelle connexion:', socket.id)

    // Un client rejoint une "room" liée à son entreprise
    socket.on('join_company_room', (companyId: number) => {
      if (companyId) {
        const roomName = `company_${companyId}`
        socket.join(roomName)
        console.log(`Socket ${socket.id} a rejoint la room ${roomName}`)
      }
    })

    // Récupération et formatage des types de dépense
    const fetchAndFormatTypeDepenses = async (companyId: number) => {
      const pageNumber = 1
      const perPageNumber = 1000
      const { allTypeDepenses, typeDepenses } =
        await type_depense_service.fetchAndFormatTypeDepenses(companyId, pageNumber, perPageNumber)

      return { companyId, typeDepenses, allTypeDepenses }
    }

    // Récupération et formatage des dépenses
    const fetchAndFormatDepenses = async (companyId: number) => {
      const pageNumber = 1
      const perPageNumber = 1000
      const { allDepenses, depenses } = await depense_service.fetchAndFormatDepenses(
        companyId,
        pageNumber,
        perPageNumber
      )

      return { companyId, depenses, allDepenses }
    }
    // Récupération et formatage des users
    const fetchAndFormatUsers = async (companyId: number) => {
      const pageNumber = 1
      const perPageNumber = 1000
      const { allUsers, users } = await user_service.fetchAndFormatUsers(
        companyId,
        pageNumber,
        perPageNumber
      )

      return { companyId, users, allUsers }
    }

    // Récupération et formatage des approvisionnements
    const fetchAndFormatAppro = async (companyId: number) => {
      const pageNumber = 1
      const perPageNumber = 1000
      const { allApprovisionnements, approvisionnements } = await appro_service.fetchAndFormatAppro(
        companyId,
        pageNumber,
        perPageNumber
      )

      return { companyId, approvisionnements, allApprovisionnements }
    }

    // Récupération et formatage des approvisionnements
    const fetchAndFormatSolde = async (companyId: number) => {
      const { solde } = await solde_service.fetchAndFormatSolde(companyId)

      return { companyId, solde }
    }

    // Diffusion des types de dépense à la room de l'entreprise
    const handleAndEmit = async (eventName: string, companyId: number) => {
      try {
        if (!companyId) throw new Error('companyId manquant')
        const data = await fetchAndFormatTypeDepenses(companyId)
        const roomName = `company_${companyId}`
        Ws?.io?.to(roomName).emit(eventName, data)
        console.log(`Événement '${eventName}' envoyé à la room ${roomName}`)
      } catch (error) {
        console.error(`Erreur pour l'événement ${eventName}:`, error)
      }
    }

    // Diffusion des dépenses à la room de l'entreprise
    const handleAndEmitDepense = async (eventName: string, companyId: number) => {
      try {
        if (!companyId) throw new Error('companyId manquant')
        const data = await fetchAndFormatDepenses(companyId)
        const roomName = `company_${companyId}`
        Ws?.io?.to(roomName).emit(eventName, data)
        console.log(`Événement '${eventName}' envoyé à la room ${roomName}`)
      } catch (error) {
        console.error(`Erreur pour l'événement ${eventName}:`, error)
      }
    }

    // Diffusion des users à la room de l'entreprise
    const handleAndEmitUser = async (eventName: string, companyId: number) => {
      try {
        if (!companyId) throw new Error('companyId manquant')
        const data = await fetchAndFormatUsers(companyId)
        const roomName = `company_${companyId}`
        Ws?.io?.to(roomName).emit(eventName, data)
        console.log(`Événement '${eventName}' envoyé à la room ${roomName}`)
      } catch (error) {
        console.error(`Erreur pour l'événement ${eventName}:`, error)
      }
    }

    // Diffusion des approvisionnements à la room de l'entreprise
    const handleAndEmitAppro = async (eventName: string, companyId: number) => {
      try {
        if (!companyId) throw new Error('companyId manquant')
        const data = await fetchAndFormatAppro(companyId)
        const roomName = `company_${companyId}`
        Ws?.io?.to(roomName).emit(eventName, data)
        console.log(`Événement '${eventName}' envoyé à la room ${roomName}`)
      } catch (error) {
        console.error(`Erreur pour l'événement ${eventName}:`, error)
      }
    }

    // Diffusion des approvisionnements à la room de l'entreprise
    const handleAndEmitSolde = async (eventName: string, companyId: number) => {
      try {
        if (!companyId) throw new Error('companyId manquant')
        const data = await fetchAndFormatSolde(companyId)
        const roomName = `company_${companyId}`
        Ws?.io?.to(roomName).emit(eventName, data)
        console.log(`Événement '${eventName}' envoyé à la room ${roomName}`)
      } catch (error) {
        console.error(`Erreur pour l'événement ${eventName}:`, error)
      }
    }

    // Listeners pour les types de dépense
    socket.on('type_depense_created', (companyId) =>
      handleAndEmit('type_depense_created', companyId)
    )
    socket.on('type_depense_updated', (companyId) =>
      handleAndEmit('type_depense_updated', companyId)
    )
    socket.on('type_depense_deleted', (companyId) =>
      handleAndEmit('type_depense_deleted', companyId)
    )

    // Listeners pour les dépenses
    socket.on('depense_created', (companyId) => {
      console.log('depense_created', companyId)
      handleAndEmitDepense('depense_created', companyId)
      handleAndEmit('type_depense_created', companyId)
      handleAndEmitSolde('solde_caisse_updated', companyId)
    })
    socket.on('depense_updated', (companyId) => {
      handleAndEmitDepense('depense_updated', companyId)
      handleAndEmit('type_depense_updated', companyId)
      handleAndEmitSolde('solde_caisse_updated', companyId)
    })
    socket.on('depense_deleted', (companyId) => {
      handleAndEmitDepense('depense_deleted', companyId)
      handleAndEmit('type_depense_deleted', companyId)
      handleAndEmitSolde('solde_caisse_updated', companyId)
    })

    // Listeners pour les users
    socket.on('user_created', (companyId) => {
      handleAndEmitUser('user_created', companyId)
    })
    socket.on('user_updated', (companyId) => {
      handleAndEmitUser('user_updated', companyId)
    })
    socket.on('user_deleted', (companyId) => {
      handleAndEmitUser('user_deleted', companyId)
    })

    // Listeners pour les approvisionnements
    socket.on('approvisionnement_created', (companyId) => {
      console.log('approvisionnement_created', companyId)
      handleAndEmitAppro('approvisionnement_created', companyId)
      handleAndEmitSolde('solde_caisse_updated', companyId)
    })
    socket.on('approvisionnement_updated', (companyId) => {
      console.log('approvisionnement_updated', companyId)
      handleAndEmitAppro('approvisionnement_updated', companyId)
      handleAndEmitSolde('solde_caisse_updated', companyId)
    })
    socket.on('approvisionnement_deleted', (companyId) => {
      handleAndEmitAppro('approvisionnement_deleted', companyId)
      handleAndEmitSolde('solde_caisse_updated', companyId)
    })
  })
})

import Abonnement from '#models/abonnement'
import Companie from '#models/companie'
import Pack from '#models/pack'
import User from '#models/user'
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { DateTime } from 'luxon'

export default class AbonnementSeeder extends BaseSeeder {
  public async run() {
    // 1. Récupérer le pack "Démo"
    const demoPack = await Pack.find(1)

    // S'assurer que le pack existe avant de continuer
    if (!demoPack) {
      console.log(
        'AbonnementSeeder: Pack Démo (ID=1) introuvable. Veuillez exécuter le PackSeeder.'
      )
      return
    }

    // 2. Récupérer toutes les entreprises et tous les utilisateurs
    const companies = await Companie.all()
    const users = await User.all()

    // 3. Préparer les données d'abonnement pour chaque entreprise
    const abonnementsToCreate = []

    for (const company of companies) {
      // Trouver le premier utilisateur associé à cette entreprise pour l'assigner comme créateur de l'abonnement
      const companyUser = users.find((user) => user.companieId === company.id)

      if (!companyUser) {
        console.log(
          `AbonnementSeeder: Auc-un utilisateur trouvé pour l'entreprise "${company.companyName}". L'abonnement ne sera pas créé.`
        )
        continue // Passe à l'entreprise suivante
      }

      const startDate = DateTime.now()
      const endDate = startDate.plus({ days: demoPack.duree })

      abonnementsToCreate.push({
        companieId: company.id,
        packId: demoPack.id,
        userId: companyUser.id, // ID du premier utilisateur trouvé pour cette entreprise
        packLibelle: demoPack.libelle,
        packDescription: demoPack.description,
        packMontant: demoPack.montant,
        dateDebut: startDate,
        dateFin: endDate,
      })
    }

    // 4. Créer tous les abonnements en une seule requête
    if (abonnementsToCreate.length > 0) {
      await Abonnement.createMany(abonnementsToCreate)
      console.log(
        `AbonnementSeeder: Création de ${abonnementsToCreate.length} abonnements de démo réussie.`
      )
    } else {
      console.log('AbonnementSeeder: Aucun abonnement à créer.')
    }
  }
}

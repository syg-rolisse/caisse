#!/bin/sh

echo "Lancement des migrations de la base de données..."
# === LA CORRECTION EST ICI : on utilise "ace.js" ===
node ace.js migration:run --force

# On vérifie si la commande précédente a réussi
# Le code $? contient le code de sortie de la dernière commande. 0 = succès.
if [ $? -ne 0 ]; then
  echo "ERREUR : Les migrations ont échoué. Le conteneur va s'arrêter."
  exit 1
fi

echo "Migrations terminées avec succès. Démarrage du serveur..."
# 'exec' remplace ce script par le processus node, ce qui est une bonne pratique
exec "$@"
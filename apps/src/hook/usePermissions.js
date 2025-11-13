// Fichier: src/hook/usePermissions.js

import { useAuth } from "../context/AuthContext.jsx"; // Assurez-vous que le chemin vers votre AuthContext est correct

/**
 * Hook personnalisé pour accéder facilement aux permissions de l'utilisateur connecté.
 * Il fournit une fonction utilitaire `can()` pour des vérifications simples et lisibles.
 */
export const usePermissions = () => {
  // 1. On récupère l'objet `permissions` depuis notre contexte d'authentification.
  // C'est la source unique de vérité.
  const { permissions } = useAuth();

  console.log(permissions);
  

  /**
   * Vérifie si l'utilisateur actuel a une permission spécifique.
   * @param {string} action - Le nom de la permission à vérifier (ex: "createDepense", "deleteUser").
   * @returns {boolean} - `true` si l'utilisateur a la permission, sinon `false`.
   */
  const can = (action) => {
    // Le `!!` est une astuce pour s'assurer que le résultat est toujours un vrai booléen.
    // Si `permissions[action]` est `true`, `!!true` donne `true`.
    // Si `permissions[action]` est `undefined` ou `false`, `!!undefined` donne `false`.
    return !!permissions[action];
  };

  // 3. On retourne la fonction `can` pour une utilisation simple,
  // et l'objet de permissions complet au cas où on aurait besoin de faire
  // des vérifications plus complexes.
  return { permissions, can };
};
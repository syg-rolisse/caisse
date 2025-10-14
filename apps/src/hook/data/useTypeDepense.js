// src/hooks/data/useTypeDepense.js
import { useState, useEffect, useMemo } from "react";
import { useFetchTypeDepense } from "../api/useFetchTypeDepense";

export function useTypeDepense(page = 1, perpage = 10) {
  // State pour les données brutes de l'API
  const [rawTypeDepense, setRawTypeDepense] = useState([]);
  const [typeDepenseError, setTypeDepenseError] = useState(null);

  const { fetchTypeDepense, isLoading, isError, error, data } = useFetchTypeDepense();

  useEffect(() => {
    fetchTypeDepense({ page, perpage });
  }, [fetchTypeDepense, page, perpage]);

  useEffect(() => {
    
    if (data) {      
      setRawTypeDepense(data.allTypeDepenses);
    }
  }, [data]);

  useEffect(() => {
    if (isError) {
      setTypeDepenseError(error);
    }
  }, [isError, error]);

  // ✅ Utilisation de useMemo pour traiter les données et calculer les totaux
  const allTypeDepense = useMemo(() => {
    // Si pas de données, on retourne un tableau vide
    if (!rawTypeDepense || rawTypeDepense.length === 0) {
      return [];
    }

    // On transforme chaque "type de dépense"
    return rawTypeDepense.map((type) => {
      // 1. Calcul du total des dépenses pour ce type
      const totalDepense = (type.Depenses || []).reduce(
        (sum, currentDepense) => sum + (currentDepense.montant || 0),
        0
      );

      // 2. Calcul du total des mouvements pour ce type
      // On aplatit tous les tableaux de mouvements en un seul, puis on somme
      const totalMouvement = (type.Depenses || [])
        .flatMap((depense) => depense.Mouvements || []) // Crée un seul tableau de tous les mouvements
        .reduce((sum, currentMouvement) => sum + (currentMouvement.montant || 0), 0);

      // On retourne un nouvel objet avec les données originales ET les totaux calculés
      return {
        ...type,
        totalDepense,
        totalMouvement,
      };
    });
  }, [rawTypeDepense]); // Ce calcul se relance uniquement si rawTypeDepense change

  // Le hook retourne maintenant les données traitées
  return {
    allTypeDepense, // 👈 Les données sont maintenant enrichies
    typeDepenseLoading: isLoading,
    typeDepenseError,
    refetchTypeDepense: fetchTypeDepense,
  };
}
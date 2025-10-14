// src/hooks/data/useTypeDepense.js
import { useState, useEffect, useMemo } from "react";
import { useFetchSolde } from "../api/useFetchSolde";

export function useSolde() {
  // State pour les données brutes de l'API
  const [rawSolde, setRawSolde] = useState([]);
  const [soldeError, setSoldeError] = useState(null);

  const { fetchSolde, isLoading, isError, error, data } = useFetchSolde();

  useEffect(() => {
    fetchSolde();
  }, [fetchSolde]);

  useEffect(() => {

    console.log(data);
    
    if (data) {      
      setRawSolde(data.solde);
    }
  }, [data]);

  useEffect(() => {
    if (isError) {
      setSoldeError(error);
    }
  }, [isError, error]);

  // ✅ Utilisation de useMemo pour traiter les données et calculer les totaux
  const allSolde = useMemo(() => {
    // Si pas de données, on retourne un tableau vide
    if (!rawSolde || rawSolde.length === 0) {
      return [];
    }

    // On transforme chaque "type de dépense"
    return rawSolde.map((solde) => {
      // 1. Calcul du total des dépenses pour ce type
      const montant = (solde.montant || []).reduce(
        (sum, currentDepense) => sum + (currentDepense.montant || 0),
        0
      );

      // On retourne un nouvel objet avec les données originales ET les totaux calculés
      return {
        ...solde,
        montant,
      };
    });
  }, [rawSolde]); // Ce calcul se relance uniquement si rawSolde change

  // Le hook retourne maintenant les données traitées
  return {
    allSolde, // 👈 Les données sont maintenant enrichies
    soldeLoading: isLoading,
    soldeError,
    refetchSolde: fetchSolde,
  };
}
import { useState, useEffect, useContext } from "react";
import { useFetchTypeDepense } from "../hook/api/useFetchTypeDepense";
import { SocketContext } from "../context/socket";

// 👇 NOUVELLE FONCTION UTILITAIRE DE TRANSFORMATION
/**
 * Prend la liste brute des types de dépense du backend et calcule les totaux.
 * @param {Array} typeDepenseList - La liste d'objets reçue de l'API/socket.
 * @returns {Array} La liste transformée avec les champs totalDepense et totalMouvement.
 */
const transformData = (typeDepenseList = []) => {
  return typeDepenseList.map(type => {
    // Calcul du total des dépenses
    const totalDepense = type.Depenses?.reduce((sum, depense) => sum + depense.montant, 0) || 0;

    // Calcul du total des mouvements (on somme les montants de chaque mouvement dans chaque dépense)
    const totalMouvement = type.Depenses?.reduce((sum, depense) => {
      const mouvementSum = depense.Mouvements?.reduce((mSum, mouvement) => mSum + mouvement.montant, 0) || 0;
      return sum + mouvementSum;
    }, 0) || 0;

    return {
      ...type, // On garde toutes les propriétés originales
      totalDepense, // On ajoute le total calculé
      totalMouvement // On ajoute le total calculé
    };
  });
};


export const useRealtimeTypeDepense = () => {
  const { fetchTypeDepense, isLoading, error, data } = useFetchTypeDepense();
  const [allTypeDepense, setAllTypeDepense] = useState([]);
  const socket = useContext(SocketContext);
  const user = JSON.parse(localStorage.getItem("user"));

  // Effet pour le chargement initial des données
  useEffect(() => {
    fetchTypeDepense({ all: true });
  }, [fetchTypeDepense]);

  // Effet pour remplir l'état initial après le fetch
  useEffect(() => {
    if (data && data.allTypeDepenses) {
      const transformedList = transformData(data.allTypeDepenses);
      setAllTypeDepense(transformedList);
    }
  }, [data]);

  // Effet pour la gestion des sockets
  useEffect(() => {
    if (!socket || !user?.company?.id) return;

    socket.emit("join_company_room", user.company.id);

    const handleDataUpdate = (socketData) => {
      if (socketData.companyId !== user.company.id) return;
      if (!socketData.allTypeDepenses) {
        return;
      }
      
      // 👇 ON TRANSFORME LES DONNÉES AVANT DE METTRE À JOUR L'ÉTAT
      const transformedList = transformData(socketData.allTypeDepenses);

      setAllTypeDepense(transformedList);
    };

    socket.on("type_depense_created", handleDataUpdate);
    socket.on("type_depense_updated", handleDataUpdate);
    socket.on("type_depense_deleted", handleDataUpdate);

    return () => {
      socket.off("type_depense_created", handleDataUpdate);
      socket.off("type_depense_updated", handleDataUpdate);
      socket.off("type_depense_deleted", handleDataUpdate);
    };
  }, [socket, user?.company.id]);

  return {
    allTypeDepense,
    typeDepenseLoading: isLoading,
    typeDepenseError: error,
  };
};
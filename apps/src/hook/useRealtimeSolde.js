import { useState, useEffect, useContext } from "react";
import { useFetchSoldeCaisse } from "./api/useFetchSoldeCaisse";
import { SocketContext } from "../context/socket";

export const useRealtimeSolde = () => {
  const { fetchSoldeCaisse, isLoading, error, data } = useFetchSoldeCaisse();
  const [solde, setSolde] = useState(0);
  const socket = useContext(SocketContext);
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetchSoldeCaisse();
  }, [fetchSoldeCaisse]);

  useEffect(() => {
    if (data && typeof data.solde?.montant === 'number') {
      setSolde(data.solde.montant);
    }
  }, [data]);

  useEffect(() => {
    if (!socket || !user?.company?.id) return;
    socket.emit("join_company_room", user.company.id);

    // Fonction de rappel pour la mise à jour d solde
    const handleSoldeUpdate = (socketData) => {
      // Le backend envoie un objet `{ companyId, solde: { montant: ... } }`
      if (socketData.companyId !== user.company.id) return;
      if (typeof socketData.solde?.montant === 'number') {
        setSolde(socketData.solde.montant);
      } else {
         console.error("[SOCKET] Données de solde invalides:", socketData);
      }
    };

    socket.on("solde_caisse_updated", handleSoldeUpdate);

    return () => {
      socket.off("solde_caisse_updated", handleSoldeUpdate);
    };
  }, [socket, user?.company.id]);

  return {
    solde,
    soldeLoading: isLoading,
    soldeError: error,
  };
};
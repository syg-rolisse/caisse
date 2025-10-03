import { useState, useEffect, useMemo } from "react";
import useSocketEvents from "../../components/UseSocketEvents";
import { useFetchSoldeCaisse } from "../api/useFetchSoldeCaisse";

export function useSoldeCaisse() {
  const [soldeCaisse, setSoldeCaisse] = useState(null);
  const [soldeCaisseError, setSoldeCaisseError] = useState(null);

  const { shouldRefreshUsers } = useSocketEvents();
  const { fetchSoldeCaisse, isLoading, isError, error, data } = useFetchSoldeCaisse();

  useEffect(() => {
    fetchSoldeCaisse();
  }, [fetchSoldeCaisse, shouldRefreshUsers]);

  useEffect(() => {
    if (data) {
      setSoldeCaisse(data); // data devrait être { solde: number | null }
    }
  }, [data]);

  useEffect(() => {
    if (isError) {
      setSoldeCaisseError(error);
    }
  }, [isError, error]);

  const soldeCaisseStats = useMemo(() => {
    // ⚠️ Normalisation : si solde est null, on renvoie 0
    const montant = soldeCaisse?.solde ?? 0;
    return { solde: montant };
  }, [soldeCaisse]);

  return {
    soldeCaisse,
    soldeCaisseLoading: isLoading,
    soldeCaisseError,
    soldeCaisseStats,
    refetchSoldeCaisse: fetchSoldeCaisse,
  };
}

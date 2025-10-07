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
    console.log(data?.solde?.montant);
    
    if (data) {
      setSoldeCaisse(data?.solde?.montant);
    }
  }, [data]);

  useEffect(() => {
    if (isError) {
      setSoldeCaisseError(error);
    }
  }, [isError, error]);

  const soldeCaisseStats = useMemo(() => {
    const montant = soldeCaisse ?? 0;
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

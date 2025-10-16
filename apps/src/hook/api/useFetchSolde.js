// Fichier: src/hook/api/useFetchSolde.js

import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../config/axiosConfig";
import { useHandleError } from "../useHandleError";

export function useFetchSolde({ companyId }) {
  const handleError = useHandleError();

  return useQuery({
    queryKey: ["solde", companyId],
    
    queryFn: async () => {
      const response = await axiosInstance.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/caisse/solde`,
        {
          params: { companieId: companyId },
        }
      );
      return {
        solde: response.data?.montant,
      };
    },
    
    enabled: !!companyId,

    onError: handleError,
  });
}
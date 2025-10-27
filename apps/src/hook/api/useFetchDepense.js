// src/hook/api/useFetchDepense.js

import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../config/axiosConfig";
import { useHandleError } from "../useHandleError";

export function useFetchDepenses({ page, perpage, companyId, userId, dateDebut, dateFin }) {
  const handleError = useHandleError();

  return useQuery({
    // MODIFICATION CLÉ : Ajoutez toutes les dépendances de la requête ici
    queryKey: ["depenses", companyId, page, perpage, userId, dateDebut, dateFin],
    
    queryFn: async () => {
      const response = await axiosInstance.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/depense/all`,
        {
          params: {
            companieId: companyId,
            page: page,
            perpage: perpage,
            userId: userId,
            dateDebut: dateDebut,
            dateFin: dateFin,
          },
        }
      );

      return {
        depenses: response.data?.depenses,
        allDepenses: response.data?.allDepenses,
      };
    },
    
    enabled: !!companyId,

    onError: handleError,
  });
}
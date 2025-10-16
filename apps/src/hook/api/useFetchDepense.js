import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../config/axiosConfig";
import { useHandleError } from "../useHandleError";

export function useFetchDepenses({ page, perpage, companyId }) {
  const handleError = useHandleError();

  return useQuery({
    // La clé de query inclut toutes les dépendances pour une mise en cache correcte
    queryKey: ["depenses", companyId, page, perpage],
    
    queryFn: async () => {
      const response = await axiosInstance.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/depense/all`,
        {
          // Utiliser l'objet `params` d'Axios est plus propre
          params: {
            companieId: companyId,
            page: page,
            perpage: perpage,
          },
        }
      );

      return {
        depenses: response.data?.depenses,      // liste paginée avec meta
        allDepenses: response.data?.allDepenses, // liste brute
      };
    },
    
    // La requête ne s'exécutera que si companyId est fourni
    enabled: !!companyId,

    onError: handleError,
  });
}
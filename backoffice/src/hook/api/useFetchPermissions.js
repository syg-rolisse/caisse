import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../config/axiosConfig";
import { useHandleError } from "../useHandleError";

export function useFetchPermissions({ page, perpage, companyId }) {
  const handleError = useHandleError();

  return useQuery({
    // 1. La clé de query est unique pour les permissions.
    // Elle dépend des mêmes paramètres pour la mise en cache.
    queryKey: ["permissions", companyId, page, perpage],
    
    queryFn: async () => {
      // 2. L'appel API pointe vers l'endpoint des permissions.
      // J'ai supposé la route `/api/v1/permission/all` en me basant sur votre contrôleur.
      const response = await axiosInstance.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/permission/all`,
        {
          // 3. Les paramètres sont les mêmes que pour vos autres listes.
          params: {
            companieId: companyId,
            page: page,
            perpage: perpage,
          },
        }
      );
      // 4. Votre API retourne directement l'objet de pagination Lucid { meta, data }.
      // Il n'y a pas de "allPermissions", donc on retourne directement `response.data`.
      // Le composant accèdera aux données via `data.data` et à la pagination via `data.meta`.
      return response.data;
    },
    
    // 5. La requête ne s'exécute que si l'ID de l'entreprise est fourni.
    enabled: !!companyId,

    onError: handleError,
  });
}
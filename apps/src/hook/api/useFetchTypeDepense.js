import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../config/axiosConfig";
import { useHandleError } from "../useHandleError";

export function useFetchTypeDepense({ page, perpage, companyId }) {
  const handleError = useHandleError();

  return useQuery({
    queryKey: ["typeDepenses", companyId, page, perpage],
    
    queryFn: async () => {
      const response = await axiosInstance.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/type_depense/all`,
        {
          params: {
            companieId: companyId,
            page: page,
            perpage: perpage,
          },
        }
      );

      return {
        typeDepenses: response.data?.typeDepenses,      
        allTypeDepenses: response.data?.allTypeDepenses, 
      };
    },
    
    enabled: !!companyId,

    onError: handleError,
  });
}

import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../config/axiosConfig";
import { useHandleError } from "../useHandleError";

export function useFetchApprovisionnement({ page, perpage, companyId }) {
  const handleError = useHandleError();

  return useQuery({
    queryKey: ["approvisionnements", companyId, page, perpage],
    
    queryFn: async () => {
      const response = await axiosInstance.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/approvisionnement/all`,
        {
          params: {
            companieId: companyId,
            page: page,
            perpage: perpage,
          },
        }
      );

      return {
        approvisionnements: response.data?.approvisionnements,      
        allApprovisionnements: response.data?.allApprovisionnements, 
      };
    },
    
    enabled: !!companyId,

    onError: handleError,
  });
}

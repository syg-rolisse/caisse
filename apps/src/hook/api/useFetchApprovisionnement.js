import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../config/axiosConfig";
import { useHandleError } from "../useHandleError";

export function useFetchApprovisionnement({ page, perpage, companyId, keyword }) {
  const handleError = useHandleError();

  return useQuery({
    queryKey: ["approvisionnements", companyId, page, perpage, keyword],
    
    queryFn: async () => {
      const response = await axiosInstance.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/approvisionnement/all`,
        {
          params: {
            companieId: companyId,
            page: page,
            perpage: perpage,
            keyword: keyword,
          },
        }
      );

      return {
        approvisionnements: response.data?.approvisionnements,      
      };
    },
    
    enabled: !!companyId,

    onError: handleError,
  });
}
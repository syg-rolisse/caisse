import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../config/axiosConfig";
import { useHandleError } from "../useHandleError";

export function useFetchCompanies() {
  const handleError = useHandleError();

  return useQuery({
    queryKey: ["companies"],
    
    queryFn: async () => {
      const response = await axiosInstance.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/allCompanies`,
        {
          params: {
            page: 1,
            perpage: 1000,
          },
        }
      );

      return {
        companies: response.data?.companies,      
        allCompanies: response.data?.allCompanies, 
      };
    },
    
    enabled: true,

    onError: handleError,
  });
}

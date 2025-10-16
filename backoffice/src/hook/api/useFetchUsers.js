import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../config/axiosConfig";
import { useHandleError } from "../useHandleError";

export function useFetchUsers({ page, perpage, companyId }) {
  const handleError = useHandleError();

  return useQuery({
    queryKey: ["users", companyId, page, perpage],
    
    queryFn: async () => {
      const response = await axiosInstance.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/user/all`,
        {
          params: {
            companieId: companyId,
            page: page,
            perpage: perpage,
          },
        }
      );

      return {
        users: response.data?.users,      
        allUsers: response.data?.allUsers, 
      };
    },
    
    enabled: !!companyId,

    onError: handleError,
  });
}

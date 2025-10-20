import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../config/axiosConfig";
import { useHandleError } from "../useHandleError";

export function useFetchUsers() {
  const handleError = useHandleError();

  return useQuery({
    queryKey: ["users"],
    
    queryFn: async () => {
      const response = await axiosInstance.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/allUserSys`,
        {
          params: {
            page: 1,
            perpage: 1000,
          },
        }
      );

      return {
        users: response.data?.users,      
        allUsers: response.data?.allUsers, 
      };
    },
    
    enabled: true,

    onError: handleError,
  });
}

import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../config/axiosConfig";
import { useHandleError } from "../useHandleError";

export function useFetchAbonnement() {
  const handleError = useHandleError();

  return useQuery({
    queryKey: ["abonnements"],
    queryFn: async () => {
      const user = JSON.parse(localStorage.getItem("user"));
      const response = await axiosInstance.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/abonnement/all`,
        {
          params: {
            companieId: user.company.id,
          },
        }
      );
      console.log(response.data);
      return {
        abonnements: response.data?.abonnements,
      };
    },

    onError: handleError,
  });
}

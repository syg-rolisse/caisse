import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../config/axiosConfig";
import { useHandleError } from "../useHandleError";

export function useFetchEditions({ companyId, dateDebut, dateFin, userId }) {
  const handleError = useHandleError();

  return useQuery({
    queryKey: ["editions", companyId, dateDebut, dateFin, userId],

    queryFn: async () => {
      const response = await axiosInstance.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/editions`,
        {
          params: {
            companieId: companyId,
            dateDebut,
            dateFin,
            userId: userId || "",
          },
        }
      );
      return response.data;
    },

    enabled: !!companyId,

    onError: handleError,
  });
}

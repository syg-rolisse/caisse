import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../config/axiosConfig";
import { useHandleError } from "../useHandleError";

export function useFetchEditions({ companyId, dateDebut, dateFin, userId, typeDeDepenseId }) {
  const handleError = useHandleError();

  return useQuery({
    queryKey: ["editions", companyId, dateDebut, dateFin, userId, typeDeDepenseId],

    queryFn: async () => {
      const response = await axiosInstance.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/editions`,
        {
          params: {
            companieId: companyId,
            dateDebut,
            dateFin,
            userId: userId || "",
            typeDeDepenseId: typeDeDepenseId || null,
          },
        }
      );
      return response.data;
    },

    enabled: !!companyId,

    onError: handleError,
  });
}

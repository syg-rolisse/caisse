import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../config/axiosConfig";
import { useHandleError } from "../useHandleError";

export function useFetchDepenses({ page, perpage, companyId, userId, dateDebut, dateFin, typeDeDepenseId, by, keyword }) {
  const handleError = useHandleError();

  return useQuery({
    queryKey: ["depenses", companyId, page, perpage, userId, dateDebut, dateFin, typeDeDepenseId, by, keyword],
    
    queryFn: async () => {
      const response = await axiosInstance.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/depense/all`,
        {
          params: {
            companieId: companyId,
            page: page,
            perpage: perpage,
            userId: userId,
            dateDebut: dateDebut,
            dateFin: dateFin,
            typeDeDepenseId: typeDeDepenseId,
            by: by,
            keyword: keyword,
          },
        }
      );

      return {
        depenses: response.data?.depenses,
      };
    },
    
    enabled: !!companyId,

    onError: handleError,
  });
}
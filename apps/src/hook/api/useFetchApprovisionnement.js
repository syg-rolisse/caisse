import { useMutation } from "@tanstack/react-query";
import axiosInstance from "../../config/axiosConfig";
import { useHandleError } from "../useHandleError";

export function useFetchApprovisionnement(page, perpage) {
  const user = JSON.parse(localStorage.getItem("user"));
  const handleError = useHandleError();

  const { mutate: fetchApprovisionnement, isLoading, isError, error, data } = useMutation(
    async () => {
      const response = await axiosInstance.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/approvisionnement/all?companieId=${user?.company?.id}&page=${page}&perpage=${perpage}`
      );

      return {
        approvisionnements: response.data?.approvisionnements,      // liste paginée avec meta
        allApprovisionnements: response.data?.allApprovisionnements, // liste brute
      };
    },
    {
      onError: (err) => handleError(err),
    }
  );

  return { fetchApprovisionnement, isLoading, isError, error, data };
}

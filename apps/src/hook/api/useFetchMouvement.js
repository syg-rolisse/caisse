import { useMutation } from "@tanstack/react-query";
import axiosInstance from "../../config/axiosConfig";
import { useHandleError } from "../useHandleError";

export function useFetchMouvement(page, perpage) {
  const user = JSON.parse(localStorage.getItem("user"));
  const handleError = useHandleError();

  const { mutate: fetchMouvement, isLoading, isError, error, data } = useMutation(
    async () => {
      const response = await axiosInstance.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/depense/all?companieId=${user?.company?.id}&page=${page}&perpage=${perpage}`
      );

      return {
        depenses: response.data?.depenses,      // liste paginée avec meta
        allDepenses: response.data?.allDepenses, // liste brute
      };
    },
    {
      onError: (err) => handleError(err),
    }
  );

  return { fetchMouvement, isLoading, isError, error, data };
}

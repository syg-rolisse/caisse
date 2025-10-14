import { useMutation } from "@tanstack/react-query";
import axiosInstance from "../../config/axiosConfig";
import { useHandleError } from "../useHandleError";

export function useFetchTypeDepense() {
  const user = JSON.parse(localStorage.getItem("user"));
  const handleError = useHandleError();

  const { mutate: fetchTypeDepense, isLoading, isError, error, data } = useMutation(
    async () => {
      const response = await axiosInstance.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/type_depense/all?companieId=${user?.company?.id}`
      );

      // On retourne les deux structures envoyées par le backend
      return {
        typeDepenses: response.data?.typeDepenses,
        allTypeDepenses: response.data?.allTypeDepenses,
      };
    },
    {
      onError: (err) => handleError(err),
    }
  );

  return { fetchTypeDepense, isLoading, isError, error, data };
}

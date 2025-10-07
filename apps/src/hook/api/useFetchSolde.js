import { useMutation } from "@tanstack/react-query";
import axiosInstance from "../../config/axiosConfig";
import { useHandleError } from "../useHandleError";

export function useFetchSolde() {
  const user = JSON.parse(localStorage.getItem("user"));
  const handleError = useHandleError();

  const { mutate: fetchSolde, isLoading, isError, error, data } = useMutation(
    async () => {
      const response = await axiosInstance.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/caisse/solde?companieId=${user?.company?.id}`
      );

      console.log(response.data?.solde);

      return {
        solde: response.data?.solde, 
      };
    },
    {
      onError: (err) => handleError(err),
    }
  );

  return { fetchSolde, isLoading, isError, error, data };
}

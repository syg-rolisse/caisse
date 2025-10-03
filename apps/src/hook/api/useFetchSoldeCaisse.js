// src/hooks/api/useFetchSoldeCaisse.js
import { useMutation } from "@tanstack/react-query";
import axiosInstance from "../../config/axiosConfig";
import { useHandleError } from "../useHandleError"; // <-- vérifie le chemin exact

export function useFetchSoldeCaisse() {
  const user = JSON.parse(localStorage.getItem("user"));
  const handleError = useHandleError(); // Hook pour gérer les erreurs via toast

  const { mutate: fetchSoldeCaisse, isLoading, isError, error, data } = useMutation(
    async () => {
      const response = await axiosInstance.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/companie/solde`,
        {
          companieId: user?.company?.id,
          userId: user?.id,
        }
      );
      return response.data;
    },
    {
      onError: (err) => handleError(err),
    }
  );

  return { fetchSoldeCaisse, isLoading, isError, error, data };
}

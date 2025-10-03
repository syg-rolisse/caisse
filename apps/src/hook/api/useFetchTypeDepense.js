// src/hooks/api/useFetchSoldeCaisse.js
import { useMutation } from "@tanstack/react-query";
import axiosInstance from "../../config/axiosConfig";
import { useHandleError } from "../useHandleError"; // <-- vérifie le chemin exact

export function useFetchTypeDepense() {
  const user = JSON.parse(localStorage.getItem("user"));
  const handleError = useHandleError(); // Hook pour gérer les erreurs via toast

  const { mutate: fetchTypeDepense, isLoading, isError, error, data } = useMutation(
    async () => {
      const response = await axiosInstance.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/type_depense/all?companieId=${user?.company?.id}`,
      );
      
      return {data : response.data?.allTypeDepense};
    },
    {
      onError: (err) => handleError(err),
    }
  );

  return { fetchTypeDepense, isLoading, isError, error, data };
}

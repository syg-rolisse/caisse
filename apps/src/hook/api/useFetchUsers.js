import { useMutation } from "@tanstack/react-query";
import axiosInstance from "../../config/axiosConfig";
import { useHandleError } from "../useHandleError";

export function useFetchUsers() {
  const user = JSON.parse(localStorage.getItem("user"));
  const handleError = useHandleError();

  const { mutate: fetchUsers, isLoading, isError, error, data } = useMutation(
    // La fonction de mutation accepte maintenant des 'params'
    async (params = {}) => {
      // On extrait page et perpage des paramètres, avec des valeurs par défaut si besoin
      const { page = 1, perpage = 10 } = params;

      // Construction de l'URL avec les bons séparateurs (&)
      const url = `${import.meta.env.VITE_BACKEND_URL}/api/v1/user/all?companieId=${user?.company?.id}&page=${page}&perpage=${perpage}`;

      const response = await axiosInstance.get(url);
      
      // On retourne les données depuis la propriété `data` de la réponse
      return response.data;
    },
    {
      onError: (err) => handleError(err),
    }
  );

  return { fetchUsers, isLoading, isError, error, data };
}
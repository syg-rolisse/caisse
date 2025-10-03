// src/hooks/api/useFetchUsers.js
import { useMutation } from "@tanstack/react-query";
import axiosInstance from "../../config/axiosConfig";
import toast from "react-hot-toast";

export function useFetchUsers() {
  const { mutate: fetchUsers, isLoading, isError, error, data } = useMutation(
    async ({ page = 1, perpage = 10 }) => {
      const response = await axiosInstance.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/allUserSys?page=${page}&perpage=${perpage}`
      );
      return response.data;
    },
    {
      onError: (error) => {
        if (error?.response?.data?.includes("Désolé")) {
          toast.error(error.response?.data, { duration: 5000 });
        } else {
          toast.error(error?.response?.data?.error || "Erreur inconnue", {
            duration: 3000,
          });
        }
      },
    }
  );

  return { fetchUsers, isLoading, isError, error, data };
}

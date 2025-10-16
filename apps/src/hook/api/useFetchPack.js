import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../config/axiosConfig";
import { useHandleError } from "../useHandleError";

export function useFetchPack() {
  const handleError = useHandleError();

  return useQuery({
    queryKey: ["packs"],

    queryFn: async () => {
      const response = await axiosInstance.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/pack/all`
      );

      return {
        packs: response.data?.packs,
      };
    },

    onError: handleError,
  });
}

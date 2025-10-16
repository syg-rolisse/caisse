import toast from "react-hot-toast";

export const useHandleError = () => {
  // Fonction centrale pour gérer toutes les erreurs provenant des requêtes
  const handleError = (error) => {
    const validationErrors = error?.response?.data?.error;

    if (validationErrors && Array.isArray(validationErrors)) {
      validationErrors.forEach((err) =>
        toast.error(err.message, { duration: 5000 })
      );
    } else {
      toast.error(
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        JSON.stringify(error?.response?.data) ||
        "Une erreur inconnue est survenue",
        { duration: 5000 }
      );
    }
  };

  // Retourne un objet pour pouvoir faire le destructuring dans le composant
  return { handleError };
};

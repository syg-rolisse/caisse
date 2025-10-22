import toast from "react-hot-toast"

export function showErrorToast(error: any) {
  const validationErrors = error?.response?.data?.error

  if (validationErrors && Array.isArray(validationErrors)) {
    validationErrors.forEach((err) => {
      toast.error(err.message || "Erreur inconnue", { duration: 12000 })
    })
  } else {
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      (typeof error?.response?.data === "string"
        ? error.response.data
        : "Une erreur est survenue. Veuillez réessayer.")

    toast.error(message, { duration: 4000 })
  }

  if (!error.response) {
    toast.error("Impossible de contacter le serveur.", { duration: 4000 })
  }
}

// src/components/DeleteDepense.js
import { useMutation } from "@tanstack/react-query";
import PropTypes from "prop-types";
import { useState } from "react";
import toast from "react-hot-toast";
import { Loader2, AlertTriangle, Trash2 } from "lucide-react";
import axiosInstance from "../../config/axiosConfig";
import ConfirmationInput from "../ConfirmationInput";
import { useHandleError } from "../../hook/useHandleError";

function DeleteDepense({ depense, onSuccess }) {
  const { handleError } = useHandleError();
  const user = JSON.parse(localStorage.getItem("user"));
  const [isConfirmed, setIsConfirmed] = useState(false);

  const { mutate: deleteExpense, isLoading: isDeleting } = useMutation({
    mutationFn: (depenseId) =>
      axiosInstance.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/depense?depenseId=${depenseId}&userConnectedId=${user?.id}`
      ),
    onSuccess: (response) => {
      toast.success(response?.data?.message);
      onSuccess(); 
     
        if(!user?.company?.id){
          toast.error("Echec du rafraîchissement de la liste des dépenses.");
          return;
        }
       
    },
    onError: (error) => {
      handleError(error);
    },
  });

  const handleDelete = () => {
    if (!isConfirmed || !depense?.id) return;
    deleteExpense(depense.id);
  };

  return (
    <div className="tw-space-y-6">
      <div className="tw-bg-amber-50 tw-p-4 tw-rounded-lg tw-border-l-4 tw-border-amber-400">
        <div className="tw-flex">
          <div className="tw-flex-shrink-0">
            <AlertTriangle className="tw-h-5 tw-w-5 tw-text-amber-500" />
          </div>
          <div className="tw-ml-3">
            <h3 className="tw-text-sm tw-font-semibold tw-text-amber-800">Action Irréversible</h3>
            <div className="tw-mt-2 tw-text-sm tw-text-amber-700">
              <p>
                Vous êtes sur le point de supprimer définitivement cette dépense et tous ses mouvements associés.
              </p>
            </div>
          </div>
        </div>
      </div>

      <ConfirmationInput 
        onValidationChange={(isValid) => setIsConfirmed(isValid)} 
        codeLength={6}
      />

      <button
        onClick={handleDelete}
        disabled={!isConfirmed || isDeleting}
        className="
          tw-w-full tw-flex tw-items-center tw-justify-center tw-p-3 tw-font-bold tw-text-white tw-rounded-lg tw-transition-all 
          tw-bg-red-600 hover:tw-bg-red-700 
          disabled:tw-bg-gray-400 disabled:tw-cursor-not-allowed disabled:tw-shadow-none
          focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-offset-2 focus:tw-ring-red-500
        "
      >
        {isDeleting ? (
          <>
            <Loader2 className="tw-mr-2 tw-animate-spin" size={20} />
            Suppression en cours...
          </>
        ) : (
          <>
            <Trash2 className="tw-mr-2" size={20} />
            Confirmer la Suppression
          </>
        )}
      </button>
    </div>
  );
}

DeleteDepense.propTypes = {
  depense: PropTypes.object,
  onSuccess: PropTypes.func.isRequired,
};

export default DeleteDepense;
import { useMutation } from "@tanstack/react-query";
import PropTypes from "prop-types";
import { useContext, useState } from "react";
import toast from "react-hot-toast";
import { Loader2, AlertTriangle, Trash2, X } from "lucide-react";
import axiosInstance from "../../config/axiosConfig";
import { SocketContext } from "../../context/socket";
import { useHandleError } from "../../hook/useHandleError";
import ConfirmationInput from "../ConfirmationInput";

function DeleteSortie({ sortie, onSuccess, onClose }) {
  const { handleError } = useHandleError();
  const socket = useContext(SocketContext);
  const user = JSON.parse(localStorage.getItem("user"));
  const [isConfirmed, setIsConfirmed] = useState(false);

  const { mutate: deleteMutation, isLoading: isDeleting } = useMutation({
    mutationFn: (sortieId) =>
      axiosInstance.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/sortie?sortieId=${sortieId}&userConnectedId=${user?.id}`
      ),
    onSuccess: (response) => {
      toast.success(response?.data?.message);
      onSuccess();
      
      if (socket?.connected && user?.company?.id) {
        // La suppression d'une sortie (mouvement) met à jour la dépense parente
        socket.emit("depense_updated", user.company.id);
      }
    },
    onError: handleError,
  });

  const handleDelete = () => {
    if (!isConfirmed || !sortie?.id) return;
    deleteMutation(sortie.id);
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
                Vous êtes sur le point de supprimer définitivement ce paiement de <strong>{sortie?.montant?.toLocaleString()} F</strong>. Cette action ne peut pas être annulée.
              </p>
            </div>
          </div>
        </div>
      </div>

      <ConfirmationInput 
        onValidationChange={(isValid) => setIsConfirmed(isValid)} 
        codeLength={4} // Un code à 4 chiffres est suffisant
      />

      <div className="tw-pt-5 tw-flex tw-justify-between tw-items-center">
        <button
          type="button"
          className="tw-py-2 tw-px-4 tw-rounded-md tw-border tw-border-gray-300 tw-bg-white tw-text-sm tw-font-medium tw-text-gray-700 hover:tw-bg-gray-50"
          onClick={onClose}
        >
          <X size={16} className="tw-inline tw-mr-1" />
          Annuler
        </button>
        <button
          onClick={handleDelete}
          disabled={!isConfirmed || isDeleting}
          className="
            tw-inline-flex tw-items-center tw-justify-center tw-py-2 tw-px-6 tw-font-bold tw-text-white tw-rounded-lg tw-transition-all 
            tw-bg-red-600 hover:tw-bg-red-700 
            disabled:tw-bg-gray-400 disabled:tw-cursor-not-allowed
          "
        >
          {isDeleting ? (
            <>
              <Loader2 className="tw-mr-2 tw-animate-spin" size={20} />
              Suppression...
            </>
          ) : (
            <>
              <Trash2 className="tw-mr-2" size={20} />
              Confirmer
            </>
          )}
        </button>
      </div>
    </div>
  );
}

DeleteSortie.propTypes = {
  sortie: PropTypes.object.isRequired, // 'sortie' est un mouvement (paiement)
  onSuccess: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default DeleteSortie;
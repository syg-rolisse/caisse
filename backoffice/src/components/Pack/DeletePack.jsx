import { useMutation } from "@tanstack/react-query";
import PropTypes from "prop-types";
import { useState } from "react";
import toast from "react-hot-toast";
import { Loader2, AlertTriangle, Trash2 } from "lucide-react";
import axiosInstance from "../../config/axiosConfig";
import ConfirmationInput from "../ConfirmationInput";
import { useHandleError } from "../../hook/useHandleError";

export default function DeletePack({ pack, onSuccess }) {
  const { handleError } = useHandleError();
  const [isConfirmed, setIsConfirmed] = useState(false);

  const { mutate: deletePack, isLoading: isDeleting } = useMutation({
    mutationFn: (packId) => axiosInstance.delete(`${import.meta.env.VITE_BACKEND_URL}/api/v1/pack?packId=${packId}`),
    onSuccess: (response) => {
      toast.success(response?.data?.message);
      onSuccess();
    },
    onError: handleError,
  });

  const handleDelete = () => {
    if (!isConfirmed || !pack?.id) return;
    deletePack(pack.id);
  };

  return (
    <div className="tw-space-y-6">
      <div className="tw-bg-red-50 tw-p-4 tw-rounded-lg tw-border-l-4 tw-border-red-400">
        <div className="tw-flex">
          <div className="tw-flex-shrink-0"><AlertTriangle className="tw-h-5 tw-w-5 tw-text-red-500" /></div>
          <div className="tw-ml-3">
            <h3 className="tw-text-sm tw-font-semibold tw-text-red-800">Action Irréversible</h3>
            <div className="tw-mt-2 tw-text-sm tw-text-red-700"><p>Vous êtes sur le point de supprimer le pack <strong>&quot;{pack?.libelle}&quot;</strong>.</p></div>
          </div>
        </div>
      </div>
      <ConfirmationInput onValidationChange={setIsConfirmed} codeLength={6} />
      <button onClick={handleDelete} disabled={!isConfirmed || isDeleting} className="btn btn-danger tw-w-full tw-flex tw-items-center tw-justify-center">
        {isDeleting ? <Loader2 className="tw-mr-2 tw-animate-spin" size={20} /> : <Trash2 className="tw-mr-2" size={20} />}
        Confirmer la Suppression
      </button>
    </div>
  );
}

DeletePack.propTypes = {
  pack: PropTypes.object,
  onSuccess: PropTypes.func.isRequired,
};
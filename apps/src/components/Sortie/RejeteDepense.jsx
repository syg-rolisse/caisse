import { useMutation } from "@tanstack/react-query";
import PropTypes from "prop-types";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import axiosInstance from "../../config/axiosConfig";
import { useHandleError } from "../../hook/useHandleError";
import { Loader2, CheckCircle, X, AlertCircle } from "lucide-react";

function RejeteDepense({ depense, onSuccess, onClose }) {
  const { handleError } = useHandleError();
  const user = JSON.parse(localStorage.getItem("user"));

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors }, // 👈 CORRECTION : On récupère l'objet 'errors' ici
  } = useForm();

  const isRejeterChecked = watch("rejeter", depense?.rejeter || false);

  const { mutate: updateDepense, isLoading } = useMutation({
    mutationFn: (data) =>
      axiosInstance.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/rejetDepense?userConnectedId=${user.id}&depenseId=${depense.id}`,
        data
      ),
    onSuccess: (response) => {
      toast.success(response?.data?.message);
      onSuccess();
     
    },
    onError: handleError,
  });

  const onSubmit = (data) => {
    updateDepense(data);
  };

  useEffect(() => {
    if (depense) {
      reset({
        rejeter: depense.rejeter || false,
        rejetMessage: depense.rejetMessage || "",
      });
    }
  }, [depense, reset]);

  return (
    <div className="tw-bg-white tw-p-2">
      <div className="tw-mb-4">
        <h3 className="tw-text-lg tw-font-semibold tw-text-gray-900">
          Rejeter / Approuver la Dépense
        </h3>
        <p className="tw-text-sm tw-text-gray-500">
          Une dépense rejetée ne pourra pas être payée tant qu&apos;elle ne sera pas approuvée.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="tw-space-y-6">
        <div className="tw-bg-gray-50 tw-p-4 tw-rounded-lg tw-border tw-border-gray-200">
          <p className="tw-text-sm tw-font-medium tw-text-gray-600">Dépense concernée :</p>
          <p className="tw-text-lg tw-font-semibold tw-text-gray-800">{depense?.wording}</p>
          <p className="tw-text-md tw-font-bold tw-text-orange-600">{depense?.montant?.toLocaleString()} F</p>
        </div>

        <div className="tw-relative tw-flex tw-justify-center tw-items-center tw-p-4 tw-border tw-border-gray-200 tw-rounded-lg">
          <div className="tw-flex tw-h-6 tw-items-center">
            <input
              id="rejeter"
              type="checkbox"
              className="tw-h-6 tw-w-6 tw-rounded tw-border-gray-300 tw-text-red-600 focus:tw-ring-red-600 tw-cursor-pointer"
              {...register("rejeter")}
            />
          </div>
          <div className="tw-ml-4 tw-text-sm tw-leading-6">
            <label htmlFor="rejeter" className="tw-font-medium tw-text-gray-900 tw-text-lg tw-cursor-pointer">
              {isRejeterChecked ? "Dépense Rejetée" : "Dépense Approuvée"}
            </label>
            <p className="tw-text-gray-500">
              Cochez pour rejeter, décochez pour approuver.
            </p>
          </div>
        </div>
        
        {isRejeterChecked && (
          <div>
            <label htmlFor="rejetMessage" className="tw-block tw-text-sm tw-font-medium tw-text-gray-700">
              Raison du rejet <span className="tw-text-red-500">*</span>
            </label>
            <textarea
              id="rejetMessage"
              rows={3}
              className="tw-mt-1 tw-block tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md tw-shadow-sm focus:tw-outline-none focus:tw-ring-red-500 focus:tw-border-red-500 sm:tw-text-sm"
              placeholder="Expliquez brièvement pourquoi la dépense est rejetée..."
              {...register("rejetMessage", { required: "La raison du rejet est obligatoire." })}
            />
            {errors.rejetMessage && (
              <p className="tw-mt-1 tw-text-sm tw-text-red-600">
                <AlertCircle size={14} className="tw-inline tw-mr-1" />
                {errors.rejetMessage.message}
              </p>
            )}
          </div>
        )}

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
            type="submit"
            className="tw-inline-flex tw-justify-center tw-py-2 tw-px-6 tw-border tw-border-transparent tw-rounded-md tw-shadow-sm tw-text-sm tw-font-medium tw-text-white tw-bg-green-600 hover:tw-bg-green-700 disabled:tw-bg-gray-400"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="tw-animate-spin" size={20} />
            ) : (
              <>
                <CheckCircle size={16} className="tw-inline tw-mr-2" />
                Appliquer le statut
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

RejeteDepense.propTypes = {
  depense: PropTypes.object,
  onSuccess: PropTypes.func,
  onClose: PropTypes.func,
};

export default RejeteDepense;
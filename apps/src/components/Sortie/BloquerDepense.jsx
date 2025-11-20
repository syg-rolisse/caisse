import { useMutation } from "@tanstack/react-query";
import PropTypes from "prop-types";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import axiosInstance from "../../config/axiosConfig";
import { useHandleError } from "../../hook/useHandleError";
import { Loader2, CheckCircle, X, Lock, Unlock } from "lucide-react";

function BloquerDepense({ depense, onSuccess, onClose }) {
  const { handleError } = useHandleError();
  const user = JSON.parse(localStorage.getItem("user"));

  const {
    register,
    handleSubmit,
    reset,
    watch, // Pour observer la valeur du checkbox en temps réel
  } = useForm();

  const isBloquerChecked = watch("bloquer", depense?.bloquer || false);

  const { mutate: updateDepense, isLoading } = useMutation({
    mutationFn: (data) =>
      axiosInstance.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/bloquerDepense?userConnectedId=${user.id}&depenseId=${depense.id}&bloquer=${isBloquerChecked}`,
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
        bloquer: depense.bloquer || false,
      });
    }
  }, [depense, reset]);

  return (
    <div className="tw-bg-white tw-p-2">
      <div className="tw-mb-4">
        <h3 className="tw-text-lg tw-font-semibold tw-text-gray-900">
          Bloquer / Débloquer la Dépense
        </h3>
        <p className="tw-text-sm tw-text-gray-500">
          Une dépense bloquée ne peut plus être modifiée ni recevoir de paiements.
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
              id="bloquer"
              type="checkbox"
              className="tw-h-6 tw-w-6 tw-rounded tw-border-gray-300 tw-text-red-600 focus:tw-ring-red-600 tw-cursor-pointer"
              {...register("bloquer")}
            />
          </div>
          <div className="tw-ml-4 tw-text-sm tw-leading-6">
            <label htmlFor="bloquer" className="tw-font-medium tw-text-gray-900 tw-text-lg tw-cursor-pointer">
              {isBloquerChecked ? "Dépense Bloquée" : "Dépense Débloquée"}
            </label>
            <p className="tw-text-gray-500">
              Cochez pour bloquer, décochez pour débloquer.
            </p>
          </div>
          {isBloquerChecked ? (
            <Lock className="tw-absolute tw-top-2 tw-right-2 tw-text-red-500" />
          ) : (
            <Unlock className="tw-absolute tw-top-2 tw-right-2 tw-text-green-500" />
          )}
        </div>

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
                Appliquer
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

BloquerDepense.propTypes = {
  depense: PropTypes.object,
  onSuccess: PropTypes.func,
  onClose: PropTypes.func,
};

export default BloquerDepense;
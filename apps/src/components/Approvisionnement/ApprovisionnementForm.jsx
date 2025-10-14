import { useMutation } from "@tanstack/react-query";
import PropTypes from "prop-types";
import { useContext, useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import axiosInstance from "../../config/axiosConfig";
import { SocketContext } from "../../context/socket";
import InputField from "../InputField";
import { useHandleError } from "../../hook/useHandleError";
import { CheckCircle, Loader2, X } from "lucide-react";

const defaultFormValues = {
  montant: "",
  wording: "",
};

function ApprovisionnementForm({ approvisionnement, onSuccess, onClose }) {
  const user = JSON.parse(localStorage.getItem("user"));
  const { handleError } = useHandleError();
  const socket = useContext(SocketContext);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: defaultFormValues });

  const { mutate, isLoading } = useMutation({
    mutationFn: ({ data, approvisionnementId }) => {
      const url = approvisionnementId
        ? `${import.meta.env.VITE_BACKEND_URL}/api/v1/approvisionnement?approvisionnementId=${approvisionnementId}`
        : `${import.meta.env.VITE_BACKEND_URL}/api/v1/approvisionnement`;
      const method = approvisionnementId ? axiosInstance.put : axiosInstance.post;
      return method(url, data);
    },
    onSuccess: (response, { approvisionnementId }) => {
      socket.emit(
        `approvisionnement_${approvisionnementId ? "updated" : "created"}`,
        user?.company?.id
      );
      toast.success(response?.data?.message);
      onSuccess();
    },
    onError: handleError,
  });

  const onSubmit = (data) => {
    if (!user) {
      toast.error("Utilisateur non trouvé.");
      return;
    }
    mutate({
      data: { ...data, companieId: user?.company?.id, userId: user.id },
      approvisionnementId: approvisionnement?.id,
    });
  };

  useEffect(() => {
    if (approvisionnement) {
      reset({
        montant: approvisionnement.montant || "",
        wording: approvisionnement.wording || "",
      });
    } else {
      reset(defaultFormValues);
    }
  }, [approvisionnement, reset]);

  return (
    <div className="tw-bg-white tw-p-2">
      <div className="tw-mb-4">
        <h3 className="tw-text-lg tw-font-semibold tw-text-gray-900">
          {approvisionnement ? "Modifier l'approvisionnement" : "Nouvel approvisionnement"}
        </h3>
        <p className="tw-text-sm tw-text-gray-500">
          Les champs marqués d&apos;un <span className="tw-text-red-500">*</span> sont obligatoires.
        </p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="tw-space-y-6">
        <InputField
          id="montant"
          label="Montant"
          type="number"
          placeholder="Ex: 50000"
          {...register("montant", { 
            required: "Le montant est requis",
            valueAsNumber: true,
          })}
          errors={errors}
        />

        <div>
          <label htmlFor="wording" className="tw-block tw-text-sm tw-font-medium tw-text-gray-700">
            Message
          </label>
          <textarea
            id="wording"
            rows={4}
            className="tw-mt-1 tw-block tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md tw-shadow-sm focus:tw-outline-none focus:tw-ring-orange-500 focus:tw-border-orange-500 sm:tw-text-sm"
            placeholder="Ajoutez une note ou un message..."
            {...register("wording")}
          />
        </div>

        <div className="tw-pt-5 tw-flex tw-justify-between tw-items-center">
          <button
            type="button"
            className="tw-py-2 tw-px-4 tw-rounded-md tw-border tw-border-gray-300 tw-bg-white tw-text-sm tw-font-medium tw-text-gray-700 hover:tw-bg-gray-50"
            onClick={onClose}
          >
            <X size={16} className="tw-inline tw-mr-1" />
            Fermer
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
                {approvisionnement ? "Mettre à jour" : "Enregistrer"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

ApprovisionnementForm.propTypes = {
  approvisionnement: PropTypes.object,
  onSuccess: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ApprovisionnementForm;
import { useMutation } from "@tanstack/react-query";
import PropTypes from "prop-types";
import { useContext, useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import axiosInstance from "../../config/axiosConfig";
import { SocketContext } from "../../context/socket";
import InputField from "../InputField";
import { useHandleError } from "../../hook/useHandleError";
import { CheckCircle, Loader2 } from "lucide-react";

const defaultFormValues = {
  wording: "",
};

function TypeDeDepenseForm({ typeDepense, onSuccess }) {
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
    mutationFn: ({ data, typeDepenseId }) => {
      const url = typeDepenseId
        ? `${
            import.meta.env.VITE_BACKEND_URL
          }/api/v1/type_depense?typeDepenseId=${typeDepenseId}&userConnectedId=${
            user?.id
          }`
        : `${import.meta.env.VITE_BACKEND_URL}/api/v1/type_depense`;
      const method = typeDepenseId ? axiosInstance.put : axiosInstance.post;
      return method(url, data);
    },
    onSuccess: (response, { typeDepenseId }) => {
      socket.emit(
        `type_depense_${typeDepenseId ? "updated" : "created"}`,
        user?.company?.id
      );
      toast.success(response?.data?.message);
      onSuccess();
    },
    onError: handleError,
  });

  const onSubmit = (data) => {
    if (!user) {
      toast.error("Utilisateur non trouvé dans le stockage local");
      return;
    }
    mutate({
      data: { ...data, companieId: user?.company?.id, userId: user.id },
      typeDepenseId: typeDepense?.id,
    });
  };

  useEffect(() => {
    if (typeDepense) {
      reset({
        wording: typeDepense.wording || "",
      });
    } else {
      reset(defaultFormValues);
    }
  }, [typeDepense, reset]);

  return (
    <div className="tw-bg-white tw-p-2">
      <div className="tw-mb-4">
        <p className="tw-text-sm tw-text-gray-500">
          Les champs marqués d&apos;un{" "}
          <span className="tw-text-red-500">*</span> sont obligatoires.
        </p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="tw-space-y-6">
        <InputField
          id="wording"
          label="Intitulé"
          placeholder="Ex: Voyages & Hebergement"
          {...register("wording", { required: "L'intitulé est requis" })}
          errors={errors}
        />

        <div className="tw-flex tw-justify-between tw-items-center">
          <button
            type="submit"
            className="tw-inline-flex tw-justify-center tw-py-2 tw-px-6 tw-border tw-border-transparent tw-rounded-md tw-shadow-sm tw-text-sm tw-font-medium tw-text-white tw-bg-green-600 hover:tw-bg-green-700 disabled:tw-bg-gray-400 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-offset-2 focus:tw-ring-green-500"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="tw-animate-spin" size={20} />
            ) : (
              <>
                <CheckCircle size={16} className="tw-inline tw-mr-2" />
                {typeDepense?.id ? "Mettre à jour" : "Enregistrer"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

TypeDeDepenseForm.propTypes = {
  typeDepense: PropTypes.object,
  onSuccess: PropTypes.func.isRequired,
};

export default TypeDeDepenseForm;

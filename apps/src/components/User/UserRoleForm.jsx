import { useMutation } from "@tanstack/react-query";
import PropTypes from "prop-types";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import axiosInstance from "../../config/axiosConfig";
import { useHandleError } from "../../hook/useHandleError";
import { CheckCircle, Loader2, X } from "lucide-react";

const defaultFormValues = {
  profilId: "",
  status: true,
};

function UserForm({ user: userToEdit, onSuccess, onClose }) {
  const loggedInUser = JSON.parse(localStorage.getItem("user"));
  const { handleError } = useHandleError();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: defaultFormValues });

  const { mutate, isLoading } = useMutation({
    mutationFn: ({ data }) => {
      // Logique pour déterminer l'URL et la méthode
      const url = `${import.meta.env.VITE_BACKEND_URL}/api/v1/changeAccountStatus`
      const method = axiosInstance.put;
      return method(url, data);
    },
    onSuccess: (response) => {
      toast.success(response?.data?.message);
      onSuccess(); // Appelle la fonction de succès du parent (fermer le modal, etc.)
    },
    onError: handleError,
  });

  const onSubmit = (data) => {
    if (!loggedInUser) {
      toast.error("Il semble que vous êtes déconnecté.");
      return;
    }

    const payload = {
      ...data,
      userId: userToEdit.id,
    };

    mutate({ data: payload});
  };

  // Pré-remplir le formulaire si un utilisateur est passé en props
  useEffect(() => {
    if (userToEdit) {
      reset({
        profilId: userToEdit.Profil?.id || "",
        status: userToEdit.status,
      });
    } else {
      reset(defaultFormValues);
    }
  }, [userToEdit, reset]);

  return (
    <div className="tw-bg-white tw-p-2">
      <div className="tw-mb-4">
        <h3 className="tw-text-lg tw-font-semibold tw-text-gray-900">
          {userToEdit ? "Modifier l'utilisateur" : "Ajouter un nouvel utilisateur"}
        </h3>
        <p className="tw-text-sm tw-text-gray-500">
          Les champs marqués d&apos;un <span className="tw-text-red-500">*</span> sont obligatoires.
        </p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="tw-space-y-6">
        
        <div>
          <label htmlFor="profilId" className="tw-block tw-text-sm tw-font-medium tw-text-gray-700">
            Rôle <span className="tw-text-red-500">*</span>
          </label>
          <select
            id="profilId"
            className={`tw-mt-1 tw-block tw-w-full tw-px-3 tw-py-2 tw-border ${errors.profilId ? 'tw-border-red-500' : 'tw-border-gray-300'} tw-rounded-md tw-shadow-sm focus:tw-outline-none focus:tw-ring-orange-500 focus:tw-border-orange-500 sm:tw-text-sm`}
            {...register("profilId", { required: "Le rôle est requis" })}
          >
            <option value="">Sélectionner un rôle</option>
            <option value="2">Admin</option>
            <option value="3">Employé</option>
            <option value="4">Secrétaire</option>
          </select>
          {errors.profilId && <p className="tw-mt-1 tw-text-sm tw-text-red-600">{errors.profilId.message}</p>}
        </div>

        <div className="tw-relative tw-flex tw-items-start">
          <div className="tw-flex tw-h-6 tw-items-center">
            <input
              id="status"
              type="checkbox"
              className="tw-h-4 tw-w-4 tw-rounded tw-border-gray-300 tw-text-green-600 focus:tw-ring-green-600"
              {...register("status")}
            />
          </div>
          <div className="tw-ml-3 tw-text-sm tw-leading-6">
            <label htmlFor="status" className="tw-font-medium tw-text-gray-900">
              Activer le compte de l&apos;utilisateur
            </label>
          </div>
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
                {userToEdit ? "Mettre à jour" : "Enregistrer"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

UserForm.propTypes = {
  user: PropTypes.object,
  onSuccess: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default UserForm;
import { useMutation } from "@tanstack/react-query";
import PropTypes from "prop-types";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import axiosInstance from "../../config/axiosConfig";
import SelectTypeDeDepense from "./SelectTypeDeDepense";
import InputField from "../../components/InputField";
import { useHandleError } from "../../hook/useHandleError";
import { CheckCircle, Loader2, X, FileText, Download, Paperclip } from "lucide-react";

const defaultFormValues = {
  wording: "",
  montant: "",
  decharger: false,
  typeDeDepenseId: "",
  facture: null,
};

function DepenseForm({ depense, onSuccess, onClose }) {
  const user = JSON.parse(localStorage.getItem("user"));
  const { handleError } = useHandleError();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: defaultFormValues });

  const { mutate, isLoading } = useMutation({
    mutationFn: ({ data, depenseId }) => {
      const url = depenseId
        ? `${
            import.meta.env.VITE_BACKEND_URL
          }/api/v1/depense?depenseId=${depenseId}&userConnectedId=${user?.id}`
        : `${import.meta.env.VITE_BACKEND_URL}/api/v1/depense`;
      const method = depenseId ? axiosInstance.put : axiosInstance.post;
      return method(url, data);
    },
    onSuccess: (response) => {
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
    const facture = data.facture?.[0];
    const formData = new FormData();
    formData.append("wording", data.wording);
    formData.append("typeDeDepenseId", data.typeDeDepenseId);
    formData.append("montant", data.montant);
    formData.append("decharger", data.decharger || false);
    formData.append("userId", user.id);
    formData.append("companieId", user?.company?.id);
    if (facture) formData.append("facture", facture);
    mutate({
      data: formData,
      depenseId: depense?.id,
    });
  };

  useEffect(() => {
    if (depense) {
      reset({
        wording: depense.wording || "",
        montant: depense.montant || "",
        decharger: depense.decharger || false,
        typeDeDepenseId: depense.typeDeDepenseId || "",
        facture: null,
      });
    } else {
      reset(defaultFormValues);
    }
  }, [depense, reset]);

  return (
    <div className="tw-bg-white tw-p-2">
      <div className="tw-mb-4">
        <p className="tw-text-sm tw-text-gray-500">
          Les champs marqués d&apos;un <span className="tw-text-red-500">*</span> sont obligatoires.
        </p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="tw-space-y-6">
        <InputField
          id="wording"
          label="Intitulé"
          placeholder="Ex: Achat de fournitures"
          {...register("wording", { required: "L'intitulé est requis" })}
          errors={errors}
        />
        <SelectTypeDeDepense
          name="typeDeDepenseId"
          label="Type de dépense"
          register={register}
          watch={watch}
          errors={errors}
          setValue={setValue}
          defaultValue={depense?.typeDeDepenseId}
          validationRules={{ required: "Le type de dépense est obligatoire" }}
        />
        <InputField
          id="montant"
          label="Montant"
          type="number"
          placeholder="Ex: 15000"
          {...register("montant", {
            required: "Le montant est requis",
            valueAsNumber: true,
          })}
          errors={errors}
        />
        <div>
          <label htmlFor="facture" className="tw-block tw-text-sm tw-font-medium tw-text-gray-700">
            Facture (PDF optionnel)
          </label>
          {depense?.factureUrl && (
            <div className="tw-mt-2 tw-p-3 tw-rounded-md tw-bg-green-50 tw-border tw-border-green-200 tw-flex tw-items-center tw-justify-between">
              <div className="tw-flex tw-items-center">
                <FileText className="tw-w-5 tw-h-5 tw-text-green-600 tw-mr-2" />
                <span className="tw-text-sm tw-font-medium tw-text-green-800">
                  Facture jointe
                </span>
              </div>
              <a
                href={`${import.meta.env.VITE_BACKEND_URL}/uploads/${depense.factureUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="tw-inline-flex tw-items-center tw-px-2.5 tw-py-1.5 tw-border tw-border-transparent tw-text-xs tw-font-medium tw-rounded tw-text-green-700 tw-bg-green-100 hover:tw-bg-green-200"
              >
                <Download size={14} className="tw-mr-1" />
                Voir le fichier
              </a>
            </div>
          )}
          <div className="tw-mt-2 tw-flex tw-items-center tw-justify-center tw-px-6 tw-pt-5 tw-pb-6 tw-border-2 tw-border-gray-300 tw-border-dashed tw-rounded-md">
            <div className="tw-space-y-1 tw-text-center">
              <Paperclip className="tw-mx-auto tw-h-12 tw-w-12 tw-text-gray-400" />
              <div className="tw-flex tw-text-sm tw-text-gray-600">
                <label
                  htmlFor="facture"
                  className="tw-relative tw-cursor-pointer tw-rounded-md tw-bg-white tw-font-medium tw-text-orange-600 hover:tw-text-orange-500 focus-within:tw-outline-none"
                >
                  <span>
                    {depense?.factureUrl ? "Remplacer la facture" : "Joindre une facture"}
                  </span>
                  <input
                    id="facture"
                    type="file"
                    className="tw-sr-only"
                    accept=".pdf"
                    {...register("facture")}
                  />
                </label>
              </div>
              <p className="tw-text-xs tw-text-gray-500">
                Fichier PDF uniquement
              </p>
            </div>
          </div>
        </div>
        {depense?.id && (
          <div className="tw-relative tw-flex tw-items-start">
            <div className="tw-flex tw-h-6 tw-items-center">
              <input
                id="decharger"
                type="checkbox"
                className="tw-h-4 tw-w-4 tw-rounded tw-border-gray-300 tw-text-green-600 focus:tw-ring-green-600"
                {...register("decharger")}
              />
            </div>
            <div className="tw-ml-3 tw-text-sm tw-leading-6">
              <label htmlFor="decharger" className="tw-font-medium tw-text-gray-900">
                Marquer comme déchargé
              </label>
            </div>
          </div>
        )}
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
            className="tw-inline-flex tw-justify-center tw-py-2 tw-px-6 tw-border tw-border-transparent tw-rounded-md tw-shadow-sm tw-text-sm tw-font-medium tw-text-white tw-bg-green-600 hover:tw-bg-green-700 disabled:tw-bg-gray-400 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-offset-2 focus:tw-ring-green-500"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="tw-animate-spin" size={20} />
            ) : (
              <>
                <CheckCircle size={16} className="tw-inline tw-mr-2" />
                {depense?.id ? "Mettre à jour" : "Enregistrer"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

DepenseForm.propTypes = {
  depense: PropTypes.object,
  onSuccess: PropTypes.func.isRequired,
  onClose: PropTypes.func,
};

export default DepenseForm;
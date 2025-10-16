import { useMutation } from "@tanstack/react-query";
import PropTypes from "prop-types";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import axiosInstance from "../../config/axiosConfig";
import { useHandleError } from "../../hook/useHandleError";
import { CheckCircle, Loader2 } from "lucide-react";
import InputField from "../InputField";

const defaultFormValues = {
  libelle: "",
  montant: "",
  duree: "",
  description: "",
  statut: false,
};

export default function PackForm({ pack, onSuccess }) {
  const { handleError } = useHandleError();
  const { register, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues: defaultFormValues });

  const { mutate, isLoading } = useMutation({
    mutationFn: ({ data, packId }) => {
      const url = packId ? `${import.meta.env.VITE_BACKEND_URL}/api/v1/pack?packId=${packId}` : `${import.meta.env.VITE_BACKEND_URL}/api/v1/pack`;
      const method = packId ? axiosInstance.put : axiosInstance.post;
      return method(url, data);
    },
    onSuccess: (response) => {
      toast.success(response?.data?.message);
      onSuccess();
    },
    onError: handleError,
  });

  const onSubmit = (data) => {
    mutate({ data, packId: pack?.id });
  };

  useEffect(() => {
    if (pack) {
      reset({
        libelle: pack.libelle || "",
        montant: pack.montant || "",
        duree: pack.duree || "",
        description: pack.description || "",
        statut: pack.statut || false,
      });
    } else {
      reset(defaultFormValues);
    }
  }, [pack, reset]);

  return (
    <div className="tw-bg-white tw-p-2">
      <div className="tw-mb-4">
        <h3 className="tw-text-lg tw-font-semibold">{pack?.id ? "Modifier le Pack" : "Créer un nouveau Pack"}</h3>
        <p className="tw-text-sm tw-text-gray-500">Les champs marqués d&apos;une <span className="tw-text-red-500">*</span> sont obligatoires.</p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="tw-space-y-6">
        <InputField id="libelle" label="Libellé" placeholder="Ex: Pack Premium" {...register("libelle", { required: "Le libellé est requis" })} errors={errors} />
        <InputField id="montant" label="Montant" type="number" placeholder="Ex: 50000" {...register("montant", { required: "Le montant est requis", valueAsNumber: true })} errors={errors} />
        <InputField id="duree" label="Durée (en jours)" type="number" placeholder="Ex: 30" {...register("duree", { required: "La durée est requise", valueAsNumber: true })} errors={errors} />
        
        <div>
          <label htmlFor="description" className="tw-block tw-text-sm tw-font-medium tw-text-gray-700">Description (Optionnel)</label>
          <textarea id="description" rows={3} className="form-control" {...register("description")} />
        </div>

        <div className="form-check">
          <input className="form-check-input" type="checkbox" id="statut" {...register("statut")} />
          <label className="form-check-label" htmlFor="statut">Activer ce pack</label>
        </div>

        <div className="tw-flex tw-justify-end">
          <button type="submit" className="btn btn-primary tw-flex tw-items-center" disabled={isLoading}>
            {isLoading ? <Loader2 className="tw-animate-spin tw-mr-2" /> : <CheckCircle size={16} className="tw-mr-2" />}
            {pack?.id ? "Mettre à jour" : "Enregistrer"}
          </button>
        </div>
      </form>
    </div>
  );
}

PackForm.propTypes = {
  pack: PropTypes.object,
  onSuccess: PropTypes.func.isRequired,
};
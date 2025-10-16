import { useMutation } from "@tanstack/react-query";
import PropTypes from "prop-types";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import axiosInstance from "../../config/axiosConfig";
import { useHandleError } from "../../hook/useHandleError";
import { useFetchPack } from "../../hook/api/useFetchPack";
import { CheckCircle, Loader2 } from "lucide-react";

export default function AbonnementForm({ onSuccess }) {
  const { handleError } = useHandleError();
  const { register, handleSubmit, formState: { errors } } = useForm();
  
  const user = JSON.parse(localStorage.getItem("user"));
  const companyId = user?.company?.id;

  // Récupérer la liste des packs pour le select
  const { data: packData, isLoading: isLoadingPacks } = useFetchPack();
  const allPacks = packData?.packs || [];

  const { mutate, isLoading: isRenewing } = useMutation({
    mutationFn: (data) =>
      axiosInstance.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/abonnement/renouveler?companieId=${companyId}`,
        data
      ),
    onSuccess: (response) => {
      toast.success(response?.data?.message);
      onSuccess();
    },
    onError: handleError,
  });

  const onSubmit = (data) => {
    mutate({
      ...data,
      userId: user.id, // Ajoute l'ID de l'utilisateur qui effectue l'action
    });
  };

  return (
    <div className="tw-bg-white tw-p-2">
      <div className="tw-mb-4">
        <h3 className="tw-text-lg tw-font-semibold">Renouveler l&apos;abonnement</h3>
        <p className="tw-text-sm tw-text-gray-500">Sélectionnez un pack pour mettre à jour votre abonnement.</p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="tw-space-y-6">
        <div>
          <label htmlFor="packId" className="form-label">Choisissez un Pack <span className="text-danger">*</span></label>
          <select 
            id="packId" 
            className={`form-select ${errors.packId ? 'is-invalid' : ''}`}
            {...register("packId", { required: "Veuillez sélectionner un pack." })}
            disabled={isLoadingPacks}
          >
            {isLoadingPacks ? (
              <option>Chargement des packs...</option>
            ) : (
              <>
                <option value="">-- Sélectionner --</option>
                {allPacks.map(pack => (
                  <option key={pack.id} value={pack.id}>
                    {pack.libelle} - {pack.montant?.toLocaleString()} F pour {pack.duree} jours
                  </option>
                ))}
              </>
            )}
          </select>
          {errors.packId && <div className="invalid-feedback">{errors.packId.message}</div>}
        </div>

        <div className="tw-flex tw-justify-end">
          <button type="submit" className="btn btn-primary tw-flex tw-items-center" disabled={isRenewing || isLoadingPacks}>
            {isRenewing ? <Loader2 className="tw-animate-spin tw-mr-2" /> : <CheckCircle size={16} className="tw-mr-2" />}
            Renouveler
          </button>
        </div>
      </form>
    </div>
  );
}

AbonnementForm.propTypes = {
  onSuccess: PropTypes.func.isRequired,
};
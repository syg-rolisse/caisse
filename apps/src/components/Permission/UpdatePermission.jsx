import { useMutation } from "@tanstack/react-query";
import PropTypes from "prop-types";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import axiosInstance from "../../config/axiosConfig";
import { useHandleError } from "../../hook/useHandleError";
import { Loader2 } from "lucide-react";

const PermissionCheckbox = ({ id, label, register }) => (
  <div className="form-check tw-flex tw-items-center">
    <input type="checkbox" className="form-check-input" id={id} {...register(id)} />
    <label className="form-check-label tw-ml-2" htmlFor={id}>
      {label}
    </label>
  </div>
);

PermissionCheckbox.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  register: PropTypes.func.isRequired,
};

export default function UpdatePermission({ permission, onSuccess, onClose }) {
  const user = JSON.parse(localStorage.getItem("user"));
  const { handleError } = useHandleError();
  
  const { register, handleSubmit, reset } = useForm();

  const { mutate: updatePermission, isLoading } = useMutation({
    mutationFn: (data) =>
      axiosInstance.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/permission?permissionId=${permission.id}&userConnectedId=${user.id}`,
        data
      ),
    onSuccess: (response) => {
      toast.success(response?.data?.message);
      onSuccess();
    },
    onError: handleError,
  });

  const onSubmit = (data) => {
    if (permission) {
      updatePermission(data);
    }
  };

  useEffect(() => {
    if (permission) {
      reset({
        profilId: permission.Profil?.id,
        readUser: permission.readUser,
        createUser: permission.createUser,
        updateUser: permission.updateUser,
        deleteUser: permission.deleteUser,
        readAppro: permission.readAppro,
        createAppro: permission.createAppro,
        updateAppro: permission.updateAppro,
        deleteAppro: permission.deleteAppro,
        readDepense: permission.readDepense,
        createDepense: permission.createDepense,
        updateDepense: permission.updateDepense,
        deleteDepense: permission.deleteDepense,
        readSortie: permission.readSortie,
        readTypeDeDepense: permission.readTypeDeDepense,
        createTypeDeDepense: permission.createTypeDeDepense,
        updateTypeDeDepense: permission.updateTypeDeDepense,
        deleteTypeDeDepense: permission.deleteTypeDeDepense,
        bloqueDepense: permission.bloqueDepense,
        dechargeDepense: permission.dechargeDepense,
        rejectDepense: permission.rejectDepense,
        payeDepense: permission.payeDepense,
        updatePermission: permission.updatePermission,
        readDashboard: permission.readDashboard,
        readPermission: permission.readPermission,
        createAbonnement: permission.createAbonnement,
        readAbonnement: permission.readAbonnement,
        createPacks: permission.createPacks,
        readPacks: permission.readPacks,
        updatePacks: permission.updatePacks,
        deletePacks: permission.deletePacks,
      });
    }
  }, [permission, reset]);

  return (
    // On utilise flexbox en colonne pour séparer l'en-tête, le contenu et le pied de page
    <div className="tw-flex tw-flex-col tw-h-[80vh]">
      <div className="tw-flex-shrink-0 tw-mb-4">
        <h3 className="tw-text-lg tw-font-semibold tw-text-gray-900">
          Modifier les permissions de &quot;{permission?.Profil?.wording || '...'}&quot;
        </h3>
        <p className="tw-text-sm tw-text-gray-500">
          Cochez les droits à accorder à ce profil.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="tw-flex tw-flex-col tw-flex-grow tw-overflow-hidden">
        {/* Cette div permet le défilement vertical du contenu du formulaire */}
        <div className="tw-flex-grow tw-overflow-y-auto tw-pr-4">
          <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-6">
            <div className="tw-border tw-p-4 tw-rounded-lg tw-space-y-3">
              <h4 className="tw-font-semibold">Administration</h4>
              <PermissionCheckbox id="readDashboard" label="Voir le TdB" register={register} />
              <PermissionCheckbox id="readPermission" label="Lire les permissions" register={register} />
              <PermissionCheckbox id="updatePermission" label="Modifier les permissions" register={register} />
            </div>

            <div className="tw-border tw-p-4 tw-rounded-lg tw-space-y-3">
              <h4 className="tw-font-semibold">Utilisateurs</h4>
              <PermissionCheckbox id="readUser" label="Lire" register={register} />
              <PermissionCheckbox id="createUser" label="Créer" register={register} />
              <PermissionCheckbox id="updateUser" label="Modifier" register={register} />
              <PermissionCheckbox id="deleteUser" label="Supprimer" register={register} />
            </div>

            <div className="tw-border tw-p-4 tw-rounded-lg tw-space-y-3">
              <h4 className="tw-font-semibold">Approvisionnements</h4>
              <PermissionCheckbox id="readAppro" label="Lire" register={register} />
              <PermissionCheckbox id="createAppro" label="Créer" register={register} />
              <PermissionCheckbox id="updateAppro" label="Modifier" register={register} />
              <PermissionCheckbox id="deleteAppro" label="Supprimer" register={register} />
            </div>

            <div className="tw-border tw-p-4 tw-rounded-lg tw-space-y-3">
              <h4 className="tw-font-semibold">Dépenses</h4>
              <PermissionCheckbox id="readDepense" label="Lire" register={register} />
              <PermissionCheckbox id="createDepense" label="Créer" register={register} />
              <PermissionCheckbox id="updateDepense" label="Modifier" register={register} />
              <PermissionCheckbox id="deleteDepense" label="Supprimer" register={register} />
            </div>

            <div className="tw-border tw-p-4 tw-rounded-lg tw-space-y-3">
              <h4 className="tw-font-semibold">Types de Dépenses</h4>
              <PermissionCheckbox id="readTypeDeDepense" label="Lire" register={register} />
              <PermissionCheckbox id="createTypeDeDepense" label="Créer" register={register} />
              <PermissionCheckbox id="updateTypeDeDepense" label="Modifier" register={register} />
              <PermissionCheckbox id="deleteTypeDeDepense" label="Supprimer" register={register} />
            </div>

            {/* <div className="tw-border tw-p-4 tw-rounded-lg tw-space-y-3">
              <h4 className="tw-font-semibold">Packs</h4>
              <PermissionCheckbox id="readPacks" label="Lire" register={register} />
              <PermissionCheckbox id="createPacks" label="Créer" register={register} />
              <PermissionCheckbox id="updatePacks" label="Modifier" register={register} />
              <PermissionCheckbox id="deletePacks" label="Supprimer" register={register} />
            </div> */}

            <div className="tw-border tw-p-4 tw-rounded-lg tw-space-y-3">
              <h4 className="tw-font-semibold">Abonnements</h4>
              <PermissionCheckbox id="readAbonnement" label="Lire" register={register} />
              <PermissionCheckbox id="createAbonnement" label="Créer" register={register} />
            </div>

            <div className="tw-border tw-p-4 tw-rounded-lg tw-space-y-3">
              <h4 className="tw-font-semibold">Actions Sorties</h4>
              <PermissionCheckbox id="readSortie" label="Voir les sorties" register={register} />
              <PermissionCheckbox id="payeDepense" label="Payer (Décaisser)" register={register} />
              <PermissionCheckbox id="rejectDepense" label="Rejeter" register={register} />
              <PermissionCheckbox id="bloqueDepense" label="Bloquer" register={register} />
              <PermissionCheckbox id="dechargeDepense" label="Décharger" register={register} />
            </div>
          </div>
        </div>
        
        {/* Le pied de page est séparé et reste fixe en bas */}
        <div className="tw-flex-shrink-0 tw-pt-5 tw-flex tw-justify-end tw-items-center tw-gap-3">
          <button type="button" className="btn btn-light" onClick={onClose}>
            Annuler
          </button>
          <button type="submit" className="btn btn-primary" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="tw-animate-spin tw-inline tw-mr-2" size={16} />
                Mise à jour...
              </>
            ) : (
              "Mettre à jour"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

UpdatePermission.propTypes = {
  permission: PropTypes.object,
  onSuccess: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};
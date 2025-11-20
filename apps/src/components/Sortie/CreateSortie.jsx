import { useMutation } from "@tanstack/react-query";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import axiosInstance from "../../config/axiosConfig";
import { useHandleError } from "../../hook/useHandleError";
import { Loader2, CheckCircle, X, PlusCircle, Pencil, Save } from "lucide-react";
import InputField from "../InputField";

function CreateSortie({ depense, onSuccess, onClose }) {
  const { handleError } = useHandleError();
  const user = JSON.parse(localStorage.getItem("user"));
  const [editingMouvement, setEditingMouvement] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({ defaultValues: { montant: "", wording: "" } });

  // Calculs des totaux
  const totalDejaPaye = depense?.Mouvements?.reduce((sum, mov) => sum + mov.montant, 0) || 0;
  const resteAPayer = (depense?.montant || 0) - totalDejaPaye;

  const { mutate, isLoading } = useMutation({
    mutationFn: (data) => {
      const isEdit = !!editingMouvement;
      const url = isEdit
        ? `${import.meta.env.VITE_BACKEND_URL}/api/v1/sortie?sortieId=${editingMouvement.id}` // Vérifie bien si c'est ?id= ou ?sortieId= selon ton back
        : `${import.meta.env.VITE_BACKEND_URL}/api/v1/sortie`;
      
      const method = isEdit ? axiosInstance.put : axiosInstance.post;
      return method(url, data);
    },
    onSuccess: (response) => {
      toast.success(response?.data?.message);
      handleCancelEdit();
      onSuccess();
    },
    onError: handleError,
  });

  const onSubmit = (data) => {
    // 1. Calcul du plafond autorisé
    const maxAuthorised = editingMouvement 
      ? resteAPayer + editingMouvement.montant 
      : resteAPayer;

    // 2. Vérification manuelle ici (maintenant que validate est retiré, ce code va s'exécuter)
    if (data.montant > maxAuthorised) {
      toast.error(`Le montant ne peut pas dépasser ${maxAuthorised.toLocaleString()} F.`);
      return; // On arrête tout ici
    }

    const payload = {
      ...data,
      depenseId: depense.id,
      userId: user.id,
      companieId: user.company.id,
    };

    mutate(payload);
  };

  const handleEditClick = (mouvement) => {
    setEditingMouvement(mouvement);
    setValue("montant", mouvement.montant);
    setValue("wording", mouvement.wording || "");
  };

  const handleCancelEdit = () => {
    setEditingMouvement(null);
    reset({ montant: "", wording: "" });
  };

  useEffect(() => {
    if (!editingMouvement) {
      reset({ montant: "", wording: "" });
    }
  }, [depense, reset, editingMouvement]);

  return (
    <div className="tw-bg-white tw-p-2">
      <div className="tw-mb-4">
        <h3 className="tw-text-lg tw-font-semibold tw-text-gray-900">Gérer les Paiements</h3>
        <div className="tw-bg-gray-50 tw-p-3 tw-rounded-lg tw-border tw-border-gray-200 tw-mt-2">
          <p className="tw-text-sm tw-text-gray-600">Dépense : <span className="tw-font-medium tw-text-gray-800">{depense?.wording}</span></p>
          <div className="tw-flex tw-justify-between tw-items-baseline tw-mt-1">
            <span className="tw-text-md tw-font-bold tw-text-orange-600">Total : {depense?.montant?.toLocaleString()} F</span>
            <span className="tw-text-sm tw-font-bold tw-text-green-600">Reste à payer : {resteAPayer.toLocaleString()} F</span>
          </div>
        </div>
      </div>

      <div className="tw-space-y-2 tw-mb-6">
        <h4 className="tw-text-md tw-font-semibold tw-text-gray-700">Paiements déjà effectués</h4>
        {depense?.Mouvements?.length > 0 ? (
          depense.Mouvements.map((mouvement) => (
            <div 
              key={mouvement.id} 
              className={`tw-flex tw-items-center tw-justify-between tw-p-2 tw-border tw-rounded-md ${editingMouvement?.id === mouvement.id ? 'tw-bg-orange-50 tw-border-orange-300' : 'tw-bg-green-50 tw-border-green-200'}`}
            >
              <div>
                <p className="tw-font-semibold tw-text-gray-800">{mouvement.montant.toLocaleString()} F</p>
                <p className="tw-text-xs tw-text-gray-500">
                  {mouvement.wording ? `${mouvement.wording} - ` : ""} 
                  {new Date(mouvement.createdAt).toLocaleDateString('fr-FR')}
                </p>
              </div>
              <button 
                type="button" 
                onClick={() => handleEditClick(mouvement)}
                className="tw-p-1 tw-text-gray-500 hover:tw-text-orange-600 hover:tw-bg-orange-100 tw-rounded transition-colors"
                title="Modifier ce paiement"
              >
                <Pencil size={16} />
              </button>
            </div>
          ))
        ) : (
          <p className="tw-text-sm tw-text-gray-500 tw-italic">Aucun paiement enregistré.</p>
        )}
      </div>

      {(resteAPayer > 0 || editingMouvement) ? (
        <form onSubmit={handleSubmit(onSubmit)} className="tw-space-y-4 tw-pt-4 tw-border-t">
          <div className="tw-flex tw-justify-between tw-items-center">
            <h4 className="tw-text-md tw-font-semibold tw-text-gray-700">
              {editingMouvement ? "Modifier le paiement" : "Ajouter un nouveau paiement"}
            </h4>
            {editingMouvement && (
              <button 
                type="button" 
                onClick={handleCancelEdit}
                className="tw-text-xs tw-text-red-500 hover:tw-underline"
              >
                Annuler modification
              </button>
            )}
          </div>
          
          <InputField
            id="montant"
            label="Montant à payer"
            type="number"
            placeholder="Montant"
            {...register("montant", { 
              required: "Le montant est requis.",
              valueAsNumber: true,
              // J'ai supprimé le 'validate' ici pour laisser le onSubmit gérer l'erreur via Toast
            })}
            errors={errors}
          />
          <div>
            <label htmlFor="wording" className="tw-block tw-text-sm tw-font-medium tw-text-gray-700">Note (optionnel)</label>
            <textarea
              id="wording"
              rows={2}
              className="tw-mt-1 tw-block tw-w-full tw-rounded-md tw-border-gray-300 tw-shadow-sm focus:tw-border-orange-500 focus:tw-ring-orange-500 sm:tw-text-sm"
              {...register("wording")}
            />
          </div>
          
          <div className="tw-pt-4 tw-flex tw-justify-between tw-items-center">
            <button type="button" className="btn btn-light" onClick={onClose}>
              <X size={16} className="tw-inline tw-mr-1" />
              Fermer
            </button>
            <button 
              type="submit" 
              className={`btn ${editingMouvement ? 'btn-warning' : 'btn-success'} tw-text-white`} 
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="tw-animate-spin" />
              ) : (
                <>
                  {editingMouvement ? <Save size={16} className="tw-inline tw-mr-2" /> : <PlusCircle size={16} className="tw-inline tw-mr-2" />}
                  {editingMouvement ? "Mettre à jour" : "Ajouter Paiement"}
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        <div className="tw-text-center tw-p-4 tw-bg-green-100 tw-rounded-lg">
          <CheckCircle className="tw-mx-auto tw-text-green-600" size={32} />
          <p className="tw-mt-2 tw-font-semibold tw-text-green-800">Cette dépense est entièrement payée.</p>
        </div>
      )}
    </div>
  );
}

CreateSortie.propTypes = {
  depense: PropTypes.object,
  onSuccess: PropTypes.func,
  onClose: PropTypes.func,
};

export default CreateSortie;
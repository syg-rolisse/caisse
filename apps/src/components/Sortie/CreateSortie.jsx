import { useMutation } from "@tanstack/react-query";
import PropTypes from "prop-types";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import axiosInstance from "../../config/axiosConfig";
import { useHandleError } from "../../hook/useHandleError";
import { Loader2, CheckCircle, X, PlusCircle } from "lucide-react";
import InputField from "../InputField";

function CreateSortie({ depense, onSuccess, onClose }) {
  const { handleError } = useHandleError();
  const user = JSON.parse(localStorage.getItem("user"));

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: { montant: "", wording: "" } });

  const totalDejaPaye = depense?.Mouvements?.reduce((sum, mov) => sum + mov.montant, 0) || 0;
  const resteAPayer = (depense?.montant || 0) - totalDejaPaye;

  // Mutation pour AJOUTER un mouvement
  const { mutate: createMouvement, isLoading: isCreating } = useMutation({
    mutationFn: (data) =>
      axiosInstance.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/sortie`, // Votre endpoint de création de 'sortie' (mouvement)
        data
      ),
    onSuccess: (response) => {
      toast.success(response?.data?.message);
      onSuccess();
    },
    onError: handleError,
  });

  const onSubmit = (data) => {
    if (data.montant > resteAPayer) {
      toast.error(`Le montant ne peut pas dépasser le reste à payer (${resteAPayer.toLocaleString()} F).`);
      return;
    }
    createMouvement({
      ...data,
      depenseId: depense.id,
      userId: user.id,
      companieId: user.company.id,
    });
  };

  useEffect(() => {
    reset({ montant: "", wording: "" });
  }, [depense, reset]);

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
            <div key={mouvement.id} className="tw-flex tw-items-center tw-justify-between tw-p-2 tw-bg-green-50 tw-border tw-border-green-200 tw-rounded-md">
              <div>
                <p className="tw-font-semibold tw-text-green-800">{mouvement.montant.toLocaleString()} F</p>
                <p className="tw-text-xs tw-text-gray-500">par {mouvement.user?.fullName} le {new Date(mouvement.createdAt).toLocaleDateString('fr-FR')}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="tw-text-sm tw-text-gray-500 tw-italic">Aucun paiement enregistré.</p>
        )}
      </div>

      {resteAPayer > 0 ? (
        <form onSubmit={handleSubmit(onSubmit)} className="tw-space-y-4 tw-pt-4 tw-border-t">
          <h4 className="tw-text-md tw-font-semibold tw-text-gray-700">Ajouter un nouveau paiement</h4>
          <InputField
            id="montant"
            label="Montant à payer"
            type="number"
            placeholder={`Max: ${resteAPayer.toLocaleString()}`}
            {...register("montant", { 
              required: "Le montant est requis.",
              valueAsNumber: true,
              max: { value: resteAPayer, message: `Le montant ne peut pas dépasser ${resteAPayer.toLocaleString()} F.` }
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
            <button type="submit" className="btn btn-success tw-text-white" disabled={isCreating}>
              {isCreating ? <Loader2 className="tw-animate-spin" /> : <><PlusCircle size={16} className="tw-inline tw-mr-2" /> Ajouter Paiement</>}
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
  depense: PropTypes.object.isRequired,
  onSuccess: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default CreateSortie;
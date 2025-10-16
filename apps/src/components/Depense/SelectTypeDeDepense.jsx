import { useMemo } from "react";
import PropTypes from "prop-types";
import { useFetchTypeDepense } from "../../hook/api/useFetchTypeDepense"; // 👈 1. Importer le bon hook
import { ChevronDown, Loader2, AlertCircle, Tag } from "lucide-react";

export default function SelectTypeDeDepense({
  register,
  errors,
  name,
  label,
  validationRules,
  watch,
}) {
  // 2. Récupérer l'ID de l'entreprise
  const user = JSON.parse(localStorage.getItem("user"));
  const companyId = user?.company?.id;

  // 3. Appeler directement le hook useQuery pour récupérer les données.
  // On passe bien un objet en paramètre.
  const { data, isLoading: typeDepenseLoading, isError: typeDepenseError } = useFetchTypeDepense({
    companyId,
    page: 1,
    perpage: 9999, // On récupère tout
  });

  // 4. Extraire la liste des données. Votre logique existante fonctionne parfaitement avec ça.
  const allTypeDepense = data?.allTypeDepenses || [];

  const currentValue = watch(name);

  const selectedOption = useMemo(() => {
    if (!allTypeDepense || allTypeDepense.length === 0) return null;
    return allTypeDepense.find(opt => String(opt.id) === String(currentValue));
  }, [allTypeDepense, currentValue]);

  let displayLabel = "Choisir le type de dépense";
  if (typeDepenseLoading) displayLabel = "Chargement...";
  if (typeDepenseError) displayLabel = "Erreur de chargement";
  if (selectedOption) displayLabel = selectedOption.wording;

  const hasError = !!errors[name];

  return (
    <div>
      <label htmlFor={name} className="tw-block tw-text-sm tw-font-medium tw-text-gray-700">
        {label} <span className="tw-text-red-500">*</span>
      </label>
      <div className="tw-relative tw-mt-1">
        <div className={`tw-flex tw-items-center tw-w-full tw-rounded-md tw-shadow-sm tw-pl-3 tw-pr-10 tw-py-2 tw-text-left tw-bg-white tw-border ${hasError ? 'tw-border-red-500' : 'tw-border-gray-300'}`}>
          <div className="tw-flex tw-items-center tw-text-gray-500">
            {typeDepenseLoading ? (
              <Loader2 size={16} className="tw-animate-spin" />
            ) : typeDepenseError ? (
              <AlertCircle size={16} className="tw-text-red-500" />
            ) : (
              <Tag size={16} />
            )}
          </div>
          <span className={`tw-ml-2 tw-block tw-truncate ${selectedOption ? 'tw-text-gray-900' : 'tw-text-gray-400'}`}>
            {displayLabel}
          </span>
        </div>

        <div className="tw-pointer-events-none tw-absolute tw-inset-y-0 tw-right-0 tw-flex tw-items-center tw-pr-2">
          <ChevronDown className="tw-h-5 tw-w-5 tw-text-gray-400" />
        </div>

        <select
          id={name}
          className="tw-absolute tw-inset-0 tw-w-full tw-h-full tw-opacity-0 tw-cursor-pointer"
          {...register(name, validationRules)}
          disabled={typeDepenseLoading || typeDepenseError} // Important: désactiver si pas de données
        >
          {/* On ajoute une option vide pour la sélection initiale */}
          <option value="">-- Sélectionnez --</option>
          {allTypeDepense.map((type) => (
            <option key={type.id} value={type.id}>
              {type.wording}
            </option>
          ))}
        </select>
      </div>

      {errors[name] && (
        <p className="tw-mt-1 tw-text-sm tw-text-red-600">
          {errors[name].message}
        </p>
      )}
    </div>
  );
}

SelectTypeDeDepense.propTypes = {
  register: PropTypes.func.isRequired,
  errors: PropTypes.object.isRequired,
  watch: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  validationRules: PropTypes.object,
};
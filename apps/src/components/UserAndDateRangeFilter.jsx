import { useState } from "react";
import { useFetchUsers } from "../hook/api/useFetchUsers";
import { useFetchTypeDepense } from "../hook/api/useFetchTypeDepense";
import SearchableUserSelect from "./SearchableUserSelect";
import PropTypes from "prop-types";

export default function UserAndDateRangeFilter({ companyId, onSearch }) {
  const [userId, setUserId] = useState(null);
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [typeDeDepenseId, setTypeDeDepenseId] = useState(null);
  const [by, setBy] = useState(null);

  const { data: usersData, isLoading: isLoadingUsers } = useFetchUsers({
    page: 1,
    perpage: 1000,
    companyId,
  });

  const { data: typeDepenseData, isLoading: isLoadingTypeDepense } = useFetchTypeDepense({
    page: 1,
    perpage: 1000,
    companyId
  });

  const allTypeDeDepense = typeDepenseData?.allTypeDepenses || [];

  const handleSearchClick = () => {
    onSearch({
      userId,
      dateDebut: dateDebut || null,
      dateFin: dateFin || null,
      typeDeDepenseId: typeDeDepenseId || null,
      by: by || null,
    });
  };

  const FilterRadioGroup = ({ options, selectedValue, onChange, name }) => (
    <div className="tw-flex tw-flex-wrap tw-items-center tw-gap-4">
      {options.map(({ value, label }) => (
        <label key={value || "all"} className="tw-flex tw-items-center tw-cursor-pointer">
          <input
            type="radio"
            name={name}
            value={value}
            checked={selectedValue === value}
            onChange={() => onChange(value)}
            className="tw-form-radio tw-h-4 tw-w-4 tw-text-violet-600"
          />
          <span className="tw-ml-2 tw-text-sm tw-font-medium tw-text-gray-700 dark:tw-text-gray-300">
            {label}
          </span>
        </label>
      ))}
    </div>
  );

  const handleTypeDepenseChange = (e) => {
    const value = e.target.value;
    setTypeDeDepenseId(value === "all" || value === "" ? null : parseInt(value, 10));
  };

  return (
    <div className="tw-p-4 tw-border tw-rounded-lg tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 md:tw-grid-cols-3 lg:tw-grid-cols-8 tw-gap-4 tw-items-end">
      <div className="lg:tw-col-span-2">
        <SearchableUserSelect
          label="Filtrer par utilisateur"
          allUsers={usersData?.allUsers || []}
          value={userId}
          onUserSelect={setUserId}
          placeholder={isLoadingUsers ? "Chargement..." : "Rechercher un collaborateur..."}
        />
      </div>

      <div>
        <label
          htmlFor="typeDeDepenseId"
          className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 dark:tw-text-gray-300 tw-mb-1"
        >
          Type de Dépense
        </label>
        <select
          id="typeDeDepenseId"
          value={typeDeDepenseId || "all"}
          onChange={handleTypeDepenseChange}
          className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 dark:tw-border-gray-600 tw-rounded-lg tw-bg-white dark:tw-bg-gray-700 dark:tw-text-gray-200 focus:tw-outline-none focus:tw-ring-1 focus:tw-ring-orange-500"
          disabled={isLoadingTypeDepense}
        >
          <option value="all">Tous les types</option>
          {allTypeDeDepense.map((type) => (
            <option key={type.id} value={type.id}>
              {type.wording}
            </option>
          ))}
        </select>
        {isLoadingTypeDepense && (
          <small className="tw-text-gray-500">Chargement...</small>
        )}
      </div>

      <div>
        <label
          htmlFor="dateDebut"
          className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 dark:tw-text-gray-300 tw-mb-1"
        >
          Date de début
        </label>
        <input
          id="dateDebut"
          type="date"
          value={dateDebut}
          onChange={(e) => setDateDebut(e.target.value)}
          className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 dark:tw-border-gray-600 tw-rounded-lg tw-bg-white dark:tw-bg-gray-700 dark:tw-text-gray-200 focus:tw-outline-none focus:tw-ring-1 focus:tw-ring-orange-500"
        />
      </div>

      <div>
        <label
          htmlFor="dateFin"
          className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 dark:tw-text-gray-300 tw-mb-1"
        >
          Date de fin
        </label>
        <input
          id="dateFin"
          type="date"
          value={dateFin}
          onChange={(e) => setDateFin(e.target.value)}
          className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 dark:tw-border-gray-600 tw-rounded-lg tw-bg-white dark:tw-bg-gray-700 dark:tw-text-gray-200 focus:tw-outline-none focus:tw-ring-1 focus:tw-ring-orange-500"
        />
      </div>

      <div className="lg:tw-col-span-2 tw-bg-blue-50 tw-p-2 tw-rounded-lg">
        <label className="tw-text-sm tw-font-medium tw-mb-1 tw-block dark:text-gray-300">
          Filtres avancés
        </label>
        <FilterRadioGroup
          name="Depense"
          selectedValue={by}
          onChange={setBy}
          options={[
            { value: null, label: "Tous" },
            { value: "paye", label: "Payées" },
            { value: "impaye", label: "Impayées" },
            { value: "rejete", label: "Rejetées" },
          ]}
        />
      </div>

      <div>
        <button
          onClick={handleSearchClick}
          className="tw-w-full tw-px-4 tw-py-5 tw-bg-orange-600 tw-text-white tw-font-semibold tw-rounded-lg hover:tw-bg-orange-700 focus:tw-outline-none focus:tw-ring-1 focus:tw-ring-offset-2 focus:tw-ring-orange-500"
        >
          Rechercher
        </button>
      </div>
    </div>
  );
}

UserAndDateRangeFilter.propTypes = {
  companyId: PropTypes.number.isRequired,
  onSearch: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string,
      label: PropTypes.string,
    })
  ).isRequired,
  selectedValue: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
};
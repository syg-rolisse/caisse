import { useState } from "react";
import { useFetchUsers } from "../hook/api/useFetchUsers";
import { useFetchTypeDepense } from "../hook/api/useFetchTypeDepense";
import SearchableUserSelect from "./SearchableUserSelect";
import PropTypes from "prop-types";
import { Search, Filter } from 'lucide-react';

const FilterRadioGroup = ({ options, selectedValue, onChange, name }) => (
  <div className="tw-flex tw-flex-wrap tw-items-center tw-gap-2 tw-mt-1">
    {options.map(({ value, label }) => (
      <label
        key={value ?? "all"}
        className="tw-inline-flex tw-items-center tw-cursor-pointer"
      >
        <input
          type="radio"
          name={name}
          value={value ?? ""}
          checked={selectedValue === value}
          onChange={() => onChange(value)}
          className="tw-hidden peer"
        />
        <span
          className={`tw-px-3 tw-py-1.5 tw-text-xs tw-font-medium tw-rounded-full tw-border tw-transition-all
          ${
            selectedValue === value
              ? "tw-bg-orange-600 tw-text-white tw-border-orange-600"
              : "tw-bg-white tw-text-gray-600 tw-border-gray-300 hover:tw-bg-gray-50 peer-checked:tw-bg-orange-600 peer-checked:tw-text-white"
          }`}
        >
          {label}
        </span>
      </label>
    ))}
  </div>
);

FilterRadioGroup.propTypes = {
  options: PropTypes.array.isRequired,
  selectedValue: PropTypes.any,
  onChange: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
};

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

  const handleTypeDepenseChange = (e) => {
    const value = e.target.value;
    setTypeDeDepenseId(value === "all" || value === "" ? null : parseInt(value, 10));
  };

  return (
    <>

    <div className="tw-flex items-center tw-justify-between tw-mb-3">
        <div className="tw-flex items-center tw-gap-2 tw-text-gray-700 dark:tw-text-gray-300">
            <Filter size={16} className="tw-text-orange-600" />
            <h3 className="tw-font-bold tw-text-xs tw-uppercase tw-tracking-wider">Filtres avancés</h3>
        </div>
      </div>

    <div className="tw-bg-gray-50/50 dark:tw-bg-gray-800/50 tw-rounded-lg tw-border tw-border-gray-200 dark:tw-border-gray-700 p-3">
      
      {/* Header Compact */}
      

      {/* 
         CONFIGURATION DE LA GRILLE RESPONSIVE :
         - Mobile (base) : 1 colonne
         - Tablette (md) : 2 colonnes
         - Desktop (xl) : 12 colonnes pour alignement horizontal
      */}
      <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 xl:tw-grid-cols-12 tw-gap-4 tw-items-end">
        
        {/* 1. Utilisateur (3/12 sur desktop) */}
        <div className="xl:tw-col-span-3">
          <SearchableUserSelect
            label="Utilisateur"
            allUsers={usersData?.allUsers || []}
            value={userId}
            onUserSelect={setUserId}
            placeholder={isLoadingUsers ? "..." : "Collaborateur"}
            className="tw-text-sm"
          />
        </div>

        {/* 2. Type de Dépense (2/12 sur desktop) */}
        <div className="xl:tw-col-span-2">
          <label htmlFor="typeDeDepenseId" className="tw-block tw-text-[10px] tw-font-bold tw-text-gray-500 dark:tw-text-gray-400 tw-mb-1 tw-uppercase">
            Type
          </label>
          <div className="tw-relative">
            <select
              id="typeDeDepenseId"
              value={typeDeDepenseId || "all"}
              onChange={handleTypeDepenseChange}
              className="tw-w-full tw-pl-2 tw-pr-6 tw-py-1.5 tw-text-sm tw-border tw-border-gray-300 dark:tw-border-gray-600 tw-rounded-md tw-bg-white dark:tw-bg-gray-700 dark:tw-text-gray-200 focus:tw-outline-none focus:tw-ring-1 focus:tw-ring-orange-500 tw-transition-all tw-truncate"
              disabled={isLoadingTypeDepense}
            >
              <option value="all">Tous</option>
              {allTypeDeDepense.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.wording}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 3. Période (3/12 sur desktop) */}
        <div className="xl:tw-col-span-3">
            <label className="tw-block tw-text-[10px] tw-font-bold tw-text-gray-500 dark:tw-text-gray-400 tw-mb-1 tw-uppercase">
              Période
            </label>
            <div className="tw-flex tw-items-center tw-gap-2">
                <div className="tw-relative tw-flex-1">
                    <input
                      id="dateDebut"
                      type="date"
                      value={dateDebut}
                      onChange={(e) => setDateDebut(e.target.value)}
                      className="tw-w-full tw-px-2 tw-py-1.5 tw-text-sm tw-border tw-border-gray-300 dark:tw-border-gray-600 tw-rounded-md focus:tw-ring-1 focus:tw-ring-orange-500 dark:tw-bg-gray-700 dark:tw-text-white"
                    />
                </div>
                <span className="tw-text-gray-400 tw-text-xs">-</span>
                <div className="tw-relative tw-flex-1">
                    <input
                      id="dateFin"
                      type="date"
                      value={dateFin}
                      onChange={(e) => setDateFin(e.target.value)}
                      className="tw-w-full tw-px-2 tw-py-1.5 tw-text-sm tw-border tw-border-gray-300 dark:tw-border-gray-600 tw-rounded-md focus:tw-ring-1 focus:tw-ring-orange-500 dark:tw-bg-gray-700 dark:tw-text-white"
                    />
                </div>
            </div>
        </div>

        {/* 4. Statut (3/12 sur desktop) */}
        <div className="xl:tw-col-span-3">
          <label className="tw-block tw-text-[10px] tw-font-bold tw-text-gray-500 dark:tw-text-gray-400 tw-mb-1 tw-uppercase">
            Statut
          </label>
          <FilterRadioGroup
            name="Depense"
            selectedValue={by}
            onChange={setBy}
            options={[
              { value: null, label: "Tous" },
              { value: "paye", label: "Payés" },
              { value: "impaye", label: "Impayés" },
              { value: "rejete", label: "Rejetés" },
            ]}
          />
        </div>

        {/* 5. Bouton Rechercher (1/12 sur desktop) */}
        <div className="md:tw-col-span-2 xl:tw-col-span-1 tw-flex tw-justify-end">
          <button
            onClick={handleSearchClick}
            className="tw-flex tw-items-center tw-justify-center tw-w-full xl:tw-w-10 tw-h-[34px] tw-bg-orange-600 hover:tw-bg-orange-700 tw-text-white tw-rounded-md tw-shadow-sm tw-transition-all duration-200 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-offset-1 focus:tw-ring-orange-500"
            title="Lancer la recherche"
          >
            <Search size={18} strokeWidth={2.5} />
            <span className="tw-ml-2 xl:tw-hidden tw-text-sm tw-font-bold">Rechercher</span>
          </button>
        </div>

      </div>
    </div>

    </>
  );
}

UserAndDateRangeFilter.propTypes = {
  companyId: PropTypes.number,
  onSearch: PropTypes.func.isRequired,
};
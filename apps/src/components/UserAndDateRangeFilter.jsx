// src/components/UserAndDateRangeFilter.jsx

import { useState } from 'react';
import { useFetchUsers } from '../hook/api/useFetchUsers'; 
import SearchableUserSelect from './SearchableUserSelect';
import PropTypes from "prop-types";

export default function UserAndDateRangeFilter({ companyId, onSearch }) {
  const [userId, setUserId] = useState(null);
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');

  const { 
    data: usersData, 
    isLoading: isLoadingUsers 
  } = useFetchUsers({page: 1, perpage: 1000, companyId });

  const handleSearchClick = () => {
    onSearch({
      userId,
      dateDebut: dateDebut || null,
      dateFin: dateFin || null,
    });
  };
  
  return (
  <div className="tw-grid tw-grid-cols-1 max-sm:tw-grid-cols-1 max-md:tw-grid-cols-2 md:tw-grid-cols-2 lg:tw-grid-cols-5 tw-gap-4 tw-items-end">
  {/* Filtrer par utilisateur - Prend 2 colonnes sur les grands écrans */}
  <div className="lg:tw-col-span-2">
    <SearchableUserSelect
      label="Filtrer par utilisateur"
      allUsers={usersData?.allUsers || []}
      value={userId}
      onUserSelect={setUserId}
      placeholder={isLoadingUsers ? "Chargement..." : "Rechercher un collaborateur..."}
    />
  </div>

  {/* Date de début - Prend 1 colonne sur les grands écrans */}
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
      className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 dark:tw-border-gray-600 tw-rounded-lg tw-bg-white dark:tw-bg-gray-700 focus:tw-outline-none focus:tw-ring-1 focus:tw-ring-orange-500"
    />
  </div>

  {/* Date de fin - Prend 1 colonne sur les grands écrans */}
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
      className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 dark:tw-border-gray-600 tw-rounded-lg tw-bg-white dark:tw-bg-gray-700 focus:tw-outline-none focus:tw-ring-1 focus:tw-ring-orange-500"
    />
  </div>

  {/* Bouton rechercher - Prend 1 colonne sur les grands écrans */}
  <div>
    <button
      onClick={handleSearchClick}
      className="tw-w-full tw-px-4 tw-py-2 tw-bg-orange-600 tw-text-white tw-font-semibold tw-rounded-lg hover:tw-bg-orange-700 focus:tw-outline-none focus:tw-ring-1 focus:tw-ring-offset-2 focus:tw-ring-orange-500"
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
};
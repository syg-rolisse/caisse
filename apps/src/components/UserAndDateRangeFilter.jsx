import { useState } from 'react';
import { useFetchUsers } from '../hook/api/useFetchUsers'; 
// ⭐ Import du hook pour les types de dépense
import { useFetchTypeDepense } from '../hook/api/useFetchTypeDepense'; 
import SearchableUserSelect from './SearchableUserSelect';
import PropTypes from "prop-types";

export default function UserAndDateRangeFilter({ companyId, onSearch }) {
  const [userId, setUserId] = useState(null);
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  // ⭐ NOUVEAU STATE pour le Type de Dépense
  const [typeDeDepenseId, setTypeDeDepenseId] = useState(null); 

  // Récupération des utilisateurs
  const { 
    data: usersData, 
    isLoading: isLoadingUsers 
  } = useFetchUsers({page: 1, perpage: 1000, companyId });

  // ⭐ Récupération des types de dépense
  const { 
    data: typeDepenseData, 
    isLoading: isLoadingTypeDepense 
  } = useFetchTypeDepense({page: 1, perpage: 1000, companyId });
  
  const allTypeDeDepense = typeDepenseData?.allTypeDepenses || [];
  // Fin de la récupération des types de dépense

  const handleSearchClick = () => {
    // ⭐ AJOUT de typeDeDepenseId dans l'objet de recherche
    onSearch({
      userId,
      dateDebut: dateDebut || null,
      dateFin: dateFin || null,
      typeDeDepenseId: typeDeDepenseId || null, // Renvoie null si rien n'est sélectionné
    });
  };
  
  // Fonction pour gérer la sélection du type de dépense
  const handleTypeDepenseChange = (e) => {
    const value = e.target.value;
    // Conversion en nombre ou en null si 'all' est sélectionné
    setTypeDeDepenseId(value === 'all' || value === '' ? null : parseInt(value, 10));
  };
  
  return (
    <div className="tw-p-3 tw-border tw-rounded-lg tw-grid tw-grid-cols-1 tw-py-3 max-sm:tw-grid-cols-1 max-md:tw-grid-cols-2 md:tw-grid-cols-2 lg:tw-grid-cols-5 tw-gap-4 tw-items-end">
      
      {/* 1. Filtrer par utilisateur */}
      <div> {/* Remplacé lg:tw-col-span-2 par un div simple pour laisser de la place au nouveau filtre Type */}
        <SearchableUserSelect
          label="Filtrer par utilisateur"
          allUsers={usersData?.allUsers || []}
          value={userId}
          onUserSelect={setUserId}
          placeholder={isLoadingUsers ? "Chargement..." : "Rechercher un collaborateur..."}
        />
      </div>

      {/* ⭐ 2. Filtrer par Type de Dépense (Nouveau) */}
      <div>
        <label
          htmlFor="typeDeDepenseId"
          className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 dark:tw-text-gray-300 tw-mb-1"
        >
          Type de Dépense
        </label>
        <select
          id="typeDeDepenseId"
          value={typeDeDepenseId || 'all'}
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
        {isLoadingTypeDepense && <small className="tw-text-gray-500">Chargement...</small>}
      </div>
      
      {/* 3. Date de début */}
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

      {/* 4. Date de fin */}
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

      {/* 5. Bouton rechercher */}
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
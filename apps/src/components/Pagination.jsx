// src/components/common/Pagination.jsx
import  { useEffect } from 'react';
import PropTypes from 'prop-types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ meta, onPageChange }) => {
  // Debug log pour voir ce qui est reçu
  useEffect(() => {
  }, [meta]);

  // Si pas de meta ou aucun résultat, on ne montre rien
  if (!meta || meta.total === 0) {
    return null;
  }

  const { currentPage, lastPage, total, perPage, previousPageUrl, nextPageUrl } = meta;

  // Gestion du changement de page
  const handleLocalPageChange = (newPage) => {
    if (newPage >= 1 && newPage <= lastPage) {
      console.log(`[Pagination Child] Clicked! Calling parent with new page: ${newPage}`);
      onPageChange(newPage);
    }
  };

  // Calcul des éléments affichés
  const firstItem = (currentPage - 1) * perPage + 1;
  const lastItem = Math.min(currentPage * perPage, total);

  return (
    <div className="tw-flex tw-flex-col sm:tw-flex-row tw-items-center tw-justify-between tw-w-full tw-p-4 tw-bg-gray-50 tw-border-t tw-border-gray-200 tw-rounded-b-lg">
      <div className="tw-text-sm tw-text-gray-600 tw-mb-4 sm:tw-mb-0">
        Affichage de <span className="tw-font-semibold">{firstItem}</span> à{' '}
        <span className="tw-font-semibold">{lastItem}</span> sur{' '}
        <span className="tw-font-semibold">{total}</span> résultats
      </div>
      <nav>
        <ul className="tw-inline-flex tw-items-center -tw-space-x-px tw-shadow-sm">
          <li>
            <button
              onClick={() => handleLocalPageChange(currentPage - 1)}
              disabled={!previousPageUrl}
              className="tw-flex tw-items-center tw-justify-center tw-px-3 tw-h-8 tw-ml-0 tw-leading-tight tw-text-gray-500 tw-bg-white tw-border tw-border-gray-300 tw-rounded-l-lg hover:tw-bg-gray-100 hover:tw-text-gray-700 disabled:tw-opacity-50 disabled:tw-cursor-not-allowed"
            >
              <ChevronLeft size={16} />
              <span className="tw-sr-only">Précédent</span>
            </button>
          </li>

          {/* Boutons numérotés */}
          {[...Array(lastPage).keys()].map((num) => (
            <li key={num + 1}>
              <button
                onClick={() => handleLocalPageChange(num + 1)}
                className={`tw-flex tw-items-center tw-justify-center tw-px-3 tw-h-8 tw-leading-tight ${
                  currentPage === num + 1
                    ? 'tw-font-semibold tw-text-white tw-bg-violet-600 tw-border-violet-600'
                    : 'tw-text-gray-500 tw-bg-white tw-border tw-border-gray-300 hover:tw-bg-gray-100 hover:tw-text-gray-700'
                }`}
              >
                {num + 1}
              </button>
            </li>
          ))}

          <li>
            <button
              onClick={() => handleLocalPageChange(currentPage + 1)}
              disabled={!nextPageUrl}
              className="tw-flex tw-items-center tw-justify-center tw-px-3 tw-h-8 tw-leading-tight tw-text-gray-500 tw-bg-white tw-border tw-border-gray-300 tw-rounded-r-lg hover:tw-bg-gray-100 hover:tw-text-gray-700 disabled:tw-opacity-50 disabled:tw-cursor-not-allowed"
            >
              <span className="tw-sr-only">Suivant</span>
              <ChevronRight size={16} />
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

Pagination.propTypes = {
  meta: PropTypes.shape({
    currentPage: PropTypes.number.isRequired,
    lastPage: PropTypes.number.isRequired,
    total: PropTypes.number.isRequired,
    perPage: PropTypes.number.isRequired,
    previousPageUrl: PropTypes.string,
    nextPageUrl: PropTypes.string,
  }),
  onPageChange: PropTypes.func.isRequired,
};

export default Pagination;

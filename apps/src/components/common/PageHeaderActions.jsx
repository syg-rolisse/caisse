// src/components/common/PageHeaderActions.js
import PropTypes from 'prop-types';
import { PlusCircle, Star } from 'lucide-react';

const PageHeaderActions = ({ primaryActionLabel, onPrimaryActionClick }) => {
  return (
    <div className="tw-flex tw-items-center tw-justify-end tw-gap-3">
      
      {/* Bouton d'icône "Favoris" */}
      <button
        onClick={() => { /* Logique à ajouter plus tard */ }}
        className="
          tw-p-2.5 tw-rounded-lg tw-text-gray-500
          tw-bg-white tw-border tw-border-gray-300 tw-shadow-sm
          hover:tw-bg-gray-100 hover:tw-text-orange-500
          focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-offset-2 focus:tw-ring-orange-500
          
          {/* 👇 CE QUI A ÉTÉ AJOUTÉ POUR LA DOUCEUR 👇 */}
          tw-transition-colors tw-duration-200 tw-ease-in-out
        "
        aria-label="Ajouter aux favoris"
      >
        <Star size={20} />
      </button>

      {/* Bouton Principal */}
      <button
        onClick={onPrimaryActionClick}
        className="
          tw-inline-flex tw-items-center tw-justify-center tw-gap-2 tw-px-5 tw-py-2.5 
          tw-font-semibold tw-text-white 
          tw-bg-green-600 tw-rounded-lg tw-shadow-sm 
          hover:tw-bg-green-700 focus:tw-outline-none focus:tw-ring-2 
          focus:tw-ring-offset-2 focus:tw-ring-green-500
          
          {/* 👇 CE QUI A ÉTÉ AJOUTÉ POUR LA DOUCEUR 👇 */}
          tw-transform hover:tw-scale-105
          tw-transition-all tw-duration-200 tw-ease-in-out
        "
      >
        <PlusCircle size={20} />
        <span>{primaryActionLabel}</span>
      </button>
    </div>
  );
};

PageHeaderActions.propTypes = {
  primaryActionLabel: PropTypes.string.isRequired,
  onPrimaryActionClick: PropTypes.func.isRequired,
};

export default PageHeaderActions;
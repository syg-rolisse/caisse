// src/components/dashboard/TypeDepenseCard.js
import { memo } from 'react'; // 👈 1. Importer `memo`
import PropTypes from 'prop-types';
import { ReceiptText, ArrowRightLeft, MoreHorizontal, Tag } from 'lucide-react';

const TypeDepenseCard = ({ typeDepense }) => {
  console.log(`Rendu de la carte : ${typeDepense.wording}`); // Log pour voir quand la carte se redessine

  return (
    <div className="tw-bg-white tw-p-5 tw-rounded-xl tw-border tw-border-gray-200 tw-transition-all hover:tw-shadow-lg hover:tw-border-orange-500">
      <div className="tw-flex tw-items-center tw-justify-between tw-mb-4">
        <div className="tw-p-2 tw-bg-gray-100 tw-rounded-lg">
          <Tag className="tw-w-5 tw-h-5 tw-text-gray-600" />
        </div>
        <button className="tw-text-gray-400 hover:tw-text-gray-600">
          <MoreHorizontal size={20} />
        </button>
      </div>
      
      <h4 className="tw-font-bold tw-text-gray-800 tw-truncate" title={typeDepense.wording}>
        {typeDepense.wording}
      </h4>
      
      <div className="tw-mt-5 tw-space-y-4">
        <div className="tw-flex tw-items-start">
          <ReceiptText className="tw-w-5 tw-h-5 tw-text-red-500 tw-mr-3 tw-flex-shrink-0" />
          <div>
            <p className="tw-text-sm tw-text-gray-500">Total Dépensé</p>
            <p className="tw-text-lg tw-font-semibold tw-text-gray-800">
              {typeDepense.totalDepense?.toLocaleString() || 0} F
            </p>
          </div>
        </div>
        
        <div className="tw-flex tw-items-start">
          <ArrowRightLeft className="tw-w-5 tw-h-5 tw-text-blue-500 tw-mr-3 tw-flex-shrink-0" />
          <div>
            <p className="tw-text-sm tw-text-gray-500">Total Mouvements</p>
            <p className="tw-text-lg tw-font-semibold tw-text-gray-800">
              {typeDepense.totalMouvement?.toLocaleString() || 0} F
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

TypeDepenseCard.propTypes = {
  typeDepense: PropTypes.shape({
    id: PropTypes.number.isRequired,
    wording: PropTypes.string.isRequired,
    totalDepense: PropTypes.number,
    totalMouvement: PropTypes.number,
  }).isRequired,
};

// 👇 2. Exporter la version "mémoïsée" (optimisée) du composant
export default memo(TypeDepenseCard);
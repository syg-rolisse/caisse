import PropTypes from 'prop-types';
import { Package, CalendarDays, DollarSign, CheckCircle, XCircle } from 'lucide-react';
// import Paye from '../Paye';

export default function Renouvellement({ item }) {
  return (
    <div className="tw-bg-white tw-rounded-xl tw-shadow-md hover:tw-shadow-lg tw-transition-shadow tw-duration-300 tw-border tw-border-gray-200 tw-flex tw-flex-col">
      <div className="tw-p-4 tw-flex-grow">
        <div className="tw-flex tw-justify-between tw-items-start tw-gap-4">
          <div className="tw-flex-1">
            <h3 className="tw-font-bold tw-text-lg tw-text-gray-800 tw-break-words">{item.libelle}</h3>
            <p className="tw-text-xs tw-text-gray-500">Pack #{item.id}</p>
          </div>
          <div className="tw-flex-shrink-0 tw-bg-violet-100 tw-p-3 tw-rounded-lg">
            <Package className="tw-w-6 tw-h-6 tw-text-violet-600" />
          </div>
        </div>

        {item.description && <p className="tw-text-sm tw-text-gray-600 tw-mt-2">{item.description}</p>}

        <div className="tw-mt-4 tw-space-y-2 tw-text-sm">
          <div className="tw-flex tw-items-center tw-text-gray-700">
            <DollarSign size={14} className="tw-mr-2 tw-flex-shrink-0" />
            <span>Prix : <span className="tw-font-bold tw-text-lg">{item.montant?.toLocaleString()} F</span></span>
          </div>
          <div className="tw-flex tw-items-center tw-text-gray-700">
            <CalendarDays size={14} className="tw-mr-2 tw-flex-shrink-0" />
            <span>Durée : <span className="tw-font-medium">{item.duree} jours</span></span>
          </div>
          <div className="tw-flex tw-items-center">
            {item.statut ? <CheckCircle size={14} className="tw-mr-2 tw-text-green-500" /> : <XCircle size={14} className="tw-mr-2 tw-text-red-500" />}
            <span>Statut : <span className={`tw-font-semibold ${item.statut ? 'tw-text-green-600' : 'tw-text-red-600'}`}>{item.statut ? 'Actif' : 'Inactif'}</span></span>
          </div>
        </div>
      </div>

      {/* <div className="tw-p-3 tw-bg-gray-50 tw-border-t tw-border-gray-100">
        <Paye packId={item.id} montant={item.montant} />
      </div> */}
    </div>
  );
};

Renouvellement.propTypes = {
  item: PropTypes.object.isRequired,
};
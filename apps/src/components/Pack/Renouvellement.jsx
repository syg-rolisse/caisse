import PropTypes from 'prop-types';
import { Package, CalendarDays, CheckCircle, XCircle } from 'lucide-react';
import Paye from '../Paye';

export default function Renouvellement({ item }) {
  const isFree = item.montant === 0;
  const isInactive = !item.statut;
  
  // 👇 LA MODIFICATION EST ICI : on vérifie si c'est le pack Démo
  const isDemoPack = item.libelle === 'Démo' || item.id === 1;

  return (
    <div 
      className={`
        tw-bg-white tw-rounded-xl tw-shadow-md hover:tw-shadow-lg tw-transition-all tw-duration-300 
        tw-border ${isFree ? 'tw-border-slate-300' : 'tw-border-violet-300'} 
        tw-flex tw-flex-col
        ${isInactive ? 'tw-opacity-60 tw-grayscale-[50%] tw-pointer-events-none' : ''}
      `}
    >
      <div className="tw-p-6 tw-border-b tw-border-gray-100">
        <div className="tw-flex tw-justify-between tw-items-start tw-gap-4">
          <div>
            <h3 className="tw-font-bold tw-text-xl tw-text-gray-800">{item.libelle}</h3>
            {item.description && <p className="tw-text-sm tw-text-gray-500 tw-mt-1">{item.description}</p>}
          </div>
          <div className={`tw-flex-shrink-0 ${isFree ? 'tw-bg-slate-100' : 'tw-bg-violet-100'} tw-p-3 tw-rounded-lg`}>
            <Package className={`tw-w-6 tw-h-6 ${isFree ? 'tw-text-slate-600' : 'tw-text-violet-600'}`} />
          </div>
        </div>
      </div>

      <div className="tw-p-6 tw-flex-grow">
        <div className="tw-text-center">
          {isFree ? (
            <span className="tw-text-4xl tw-font-bold tw-text-gray-800">Gratuit</span>
          ) : (
            <div>
              <span className="tw-text-4xl tw-font-bold tw-text-gray-800">{item.montant?.toLocaleString()}</span>
              <span className="tw-ml-1 tw-text-gray-500">F / {item.duree} jours</span>
            </div>
          )}
        </div>

        <div className="tw-mt-6 tw-space-y-3 tw-text-sm">
          <div className="tw-flex tw-items-center tw-text-gray-700">
            <CalendarDays size={16} className="tw-mr-3 tw-flex-shrink-0 tw-text-gray-400" />
            <span>Durée de validité : <span className="tw-font-medium">{item.duree} jours</span></span>
          </div>
          <div className="tw-flex tw-items-center">
            {item.statut ? <CheckCircle size={16} className="tw-mr-3 tw-text-green-500" /> : <XCircle size={16} className="tw-mr-3 tw-text-red-500" />}
            <span>Statut : <span className={`tw-font-semibold ${item.statut ? 'tw-text-green-600' : 'tw-text-red-600'}`}>{item.statut ? 'Actif' : 'Inactif'}</span></span>
          </div>
        </div>
      </div>

      {/* 👇 ET ICI : le footer n'est affiché que si ce n'est PAS le pack Démo */}
      {!isDemoPack && (
        <div className="tw-p-4 tw-bg-gray-50/70 tw-border-t tw-border-gray-100 tw-mt-auto">
          <div className={isInactive ? 'tw-cursor-not-allowed' : ''}>
            <Paye packId={item.id} montant={item.montant} disabled={isInactive} />
          </div>
        </div>
      )}
    </div>
  );
};

Renouvellement.propTypes = {
  item: PropTypes.object.isRequired,
};
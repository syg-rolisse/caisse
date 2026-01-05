import PropTypes from 'prop-types';
import { Landmark, User, Calendar, Pencil, Trash2, Hash } from 'lucide-react';

export default function ApprovisionnementCard({ item, onEdit, onDelete, canEdit, canDelete }) {
  const formattedDate = new Date(item.createdAt).toLocaleDateString("fr-CA");

  return (
    <div className="tw-bg-white tw-rounded-xl tw-shadow-sm hover:tw-shadow-lg tw-transition-all tw-duration-300 tw-border tw-border-gray-100 tw-flex tw-flex-col tw-h-full tw-relative">
      
      {/* Partie Supérieure : Montant et Icône */}
      <div className="tw-p-5 tw-pb-2">
        <div className="tw-flex tw-items-center tw-justify-between tw-mb-4">
          <div className="tw-flex tw-items-center tw-gap-3">
            <div className="tw-h-10 tw-w-10 tw-rounded-full tw-bg-green-50 tw-flex tw-items-center tw-justify-center tw-border tw-border-green-100">
              <Landmark size={18} className="tw-text-green-600" />
            </div>
            <div>
              <p className="tw-text-xs tw-font-bold tw-text-green-600 tw-uppercase tw-tracking-wide">
                Crédit Caisse
              </p>
              <div className="tw-flex tw-items-center tw-text-gray-400 tw-text-xs">
                <Hash size={10} className="tw-mr-0.5" />
                <span>{item.id}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="tw-mt-2">
          <h3 className="tw-text-3xl tw-font-bold tw-text-gray-800 tw-tracking-tight">
            {item.montant?.toLocaleString()} <span className="tw-text-base tw-font-medium tw-text-gray-400">F</span>
          </h3>
        </div>
      </div>

      {/* Partie Centrale : Description */}
      <div className="tw-px-5 tw-py-2 tw-flex-grow">
        {item.wording ? (
          <p className="tw-text-sm tw-text-gray-600 tw-italic tw-leading-relaxed">
            {item.wording}
          </p>
        ) : (
          <p className="tw-text-sm tw-text-gray-300 tw-italic">Aucune description</p>
        )}
      </div>

      {/* Partie Inférieure : Méta & Actions */}
      <div className="tw-p-4 tw-mt-2 tw-bg-gray-50/50 tw-border-t tw-border-gray-100 tw-rounded-b-xl tw-flex tw-items-center tw-justify-between">
        
        {/* Infos Gauche */}
        <div className="tw-flex tw-flex-col tw-gap-1">
          <div className="tw-flex tw-items-center tw-text-xs tw-text-gray-500" title="Auteur">
            <User size={12} className="tw-mr-1.5 tw-text-gray-400" />
            <span className="tw-font-medium tw-truncate tw-max-w-[100px]">{item.user?.fullName || 'Inconnu'}</span>
          </div>
          <div className="tw-flex tw-items-center tw-text-xs tw-text-gray-400" title="Date de création">
            <Calendar size={12} className="tw-mr-1.5" />
            <span>{formattedDate}</span>
          </div>
        </div>

        {/* Boutons Droite */}
        {(canEdit || canDelete) && (
          <div className="tw-flex tw-items-center tw-gap-2">
            {canEdit && (
              <button 
                onClick={onEdit} 
                className="tw-h-8 tw-w-8 tw-rounded-lg tw-flex tw-items-center tw-justify-center tw-text-blue-600 tw-bg-white tw-border tw-border-gray-200 hover:tw-border-blue-300 hover:tw-bg-blue-50 tw-transition-all tw-shadow-sm"
                title="Modifier"
              >
                <Pencil size={14} />
              </button>
            )}
            {canDelete && (
              <button 
                onClick={onDelete} 
                className="tw-h-8 tw-w-8 tw-rounded-lg tw-flex tw-items-center tw-justify-center tw-text-red-600 tw-bg-white tw-border tw-border-gray-200 hover:tw-border-red-300 hover:tw-bg-red-50 tw-transition-all tw-shadow-sm"
                title="Supprimer"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

ApprovisionnementCard.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    montant: PropTypes.number,
    wording: PropTypes.string,
    createdAt: PropTypes.string,
    user: PropTypes.shape({
      fullName: PropTypes.string
    })
  }).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  canEdit: PropTypes.bool,
  canDelete: PropTypes.bool,
};
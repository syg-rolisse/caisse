import PropTypes from 'prop-types';
import { Landmark, User, Calendar, Pencil, Trash2, MessageSquare } from 'lucide-react';

export default function ApprovisionnementCard({ item, onEdit, onDelete, canEdit, canDelete }) {
  const formattedDate = new Date(item.createdAt).toLocaleDateString("fr-CA");

  return (
    <div className="tw-bg-white tw-rounded-xl tw-shadow-md hover:tw-shadow-lg tw-transition-shadow tw-duration-300 tw-border tw-border-gray-200 tw-flex tw-flex-col tw-h-full">
      <div className="tw-p-4 tw-flex tw-justify-between tw-items-start tw-border-b tw-border-gray-100">
        <div className="tw-flex-shrink-0 tw-bg-green-100 tw-p-3 tw-rounded-lg">
          <Landmark className="tw-w-6 tw-h-6 tw-text-green-600" />
        </div>
        <div className="tw-text-right">
          <p className="tw-text-2xl tw-font-bold tw-text-green-700">
            {item.montant?.toLocaleString()} F
          </p>
          <p className="tw-text-xs tw-text-gray-500">Appro. #{item.id}</p>
        </div>
      </div>

      <div className="tw-p-4 tw-flex-grow">
        
        {/* CORRECTION 1: Affichage du message après la date, de manière claire */}
        <div className="tw-space-y-2 tw-text-sm tw-mb-4">
          <div className="tw-flex tw-items-center tw-text-gray-600">
            <User size={14} className="tw-mr-2 tw-flex-shrink-0" />
            <span>Saisi par : <span className="tw-font-medium">{item.user?.fullName}</span></span>
          </div>
          <div className="tw-flex tw-items-center tw-text-gray-600">
            <Calendar size={14} className="tw-mr-2 tw-flex-shrink-0" />
            <span>Le : <span className="tw-font-medium">{formattedDate}</span></span>
          </div>
        </div>

        {item.wording && (
          <div className="tw-border tw-border-gray-200 tw-p-3 tw-rounded-lg tw-bg-gray-50">
            <div className="tw-flex tw-items-start tw-text-gray-700">
              <MessageSquare size={16} className="tw-flex-shrink-0 tw-mr-2 tw-mt-0.5 tw-text-gray-500" />
              <p className="tw-text-sm tw-text-gray-700">{item.wording}</p>
            </div>
          </div>
        )}
      </div>

      {(canEdit || canDelete) && (
        <div className="tw-p-3 tw-bg-gray-50 tw-border-t tw-border-gray-100 tw-flex tw-justify-end tw-gap-2">
          {canEdit && (
            // CORRECTION 2: Ajouter 'tw-flex tw-items-center tw-justify-center' au bouton
            <button 
              onClick={onEdit} 
              className="btn btn-primary-transparent rounded-pill tw-flex tw-items-center tw-justify-center" 
              title="Modifier"
            >
              <Pencil size={16} />
            </button>
          )}
          {canDelete && (
            // CORRECTION 2: Ajouter 'tw-flex tw-items-center tw-justify-center' au bouton
            <button 
              onClick={onDelete} 
              className="btn btn-danger-transparent rounded-pill tw-flex tw-items-center tw-justify-center" 
              title="Supprimer"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

ApprovisionnementCard.propTypes = {
  item: PropTypes.object.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  canEdit: PropTypes.bool,
  canDelete: PropTypes.bool,
};
import PropTypes from 'prop-types';
import { Tag, User, Calendar, Pencil, Trash2 } from 'lucide-react';

export default function TypeDepenseCard({ item, onEdit, onDelete, canEdit, canDelete }) {
  const formattedDate = new Date(item.createdAt).toLocaleDateString("fr-CA");

  return (
    <div className="tw-bg-white tw-rounded-xl tw-shadow-md hover:tw-shadow-lg tw-transition-shadow tw-duration-300 tw-border tw-border-gray-200 tw-flex tw-flex-col">
      <div className="tw-p-4 tw-flex-grow">
        <div className="tw-flex tw-items-start tw-gap-4">
          <div className="tw-flex-shrink-0 tw-bg-blue-100 tw-p-3 tw-rounded-lg">
            <Tag className="tw-w-6 tw-h-6 tw-text-blue-600" />
          </div>
          <div className="tw-flex-1">
            <h3 className="tw-font-bold tw-text-lg tw-text-gray-800 tw-break-words">{item.wording}</h3>
            <p className="tw-text-xs tw-text-gray-500">Catégorie #{item.id}</p>
          </div>
        </div>

        <div className="tw-mt-4 tw-space-y-2 tw-text-sm">
          <div className="tw-flex tw-items-center tw-text-gray-600">
            <User size={14} className="tw-mr-2 tw-flex-shrink-0" />
            <span>Saisi par : <span className="tw-font-medium">{item.user?.fullName}</span></span>
          </div>
          <div className="tw-flex tw-items-center tw-text-gray-600">
            <Calendar size={14} className="tw-mr-2 tw-flex-shrink-0" />
            <span>Le : <span className="tw-font-medium">{formattedDate}</span></span>
          </div>
        </div>
      </div>

      {(canEdit || canDelete) && (
        <div className="tw-p-3 tw-bg-gray-50 tw-border-t tw-border-gray-100 tw-flex tw-justify-end tw-gap-2">
          {canEdit && (
            <button onClick={onEdit} className="btn btn-icon btn-sm btn-primary-transparent rounded-pill tw-flex tw-items-center tw-justify-center" title="Modifier">
              <Pencil size={16} />
            </button>
          )}
          {canDelete && (
            <button onClick={onDelete} className="btn btn-icon btn-sm btn-danger-transparent rounded-pill tw-flex tw-items-center tw-justify-center" title="Supprimer">
              <Trash2 size={16} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

TypeDepenseCard.propTypes = {
  item: PropTypes.object.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  canEdit: PropTypes.bool,
  canDelete: PropTypes.bool,
};
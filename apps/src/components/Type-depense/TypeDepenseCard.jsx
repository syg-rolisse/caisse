import PropTypes from 'prop-types';
import { Tag, User, Calendar, Pencil, Trash2 } from 'lucide-react';

export default function TypeDepenseCard({ item, onEdit, onDelete, canEdit, canDelete }) {
  const formattedDate = new Date(item.createdAt).toLocaleDateString("fr-CA");

  return (
    <div className="tw-bg-white tw-rounded-lg tw-shadow-sm hover:tw-shadow-md tw-transition-all tw-duration-300 tw-border tw-border-gray-200 tw-flex tw-flex-col">
      
      <div className="tw-p-5 tw-flex-grow">
        <div className="tw-flex tw-items-center tw-justify-between">
            <div className="tw-flex tw-items-center tw-gap-3">
                <div className="tw-bg-blue-50 tw-rounded-full tw-p-2.5">
                    <Tag className="tw-w-5 tw-h-5 tw-text-blue-600" />
                </div>
                <div>
                    <h3 className="tw-font-bold tw-text-lg tw-text-gray-800 tw-leading-none mb-1">{item.wording}</h3>
                    <span className="tw-inline-block tw-px-2 tw-py-0.5 tw-rounded-md tw-bg-gray-100 tw-text-gray-500 tw-text-[10px] tw-font-bold tw-uppercase">
                        Ref #{item.id}
                    </span>
                </div>
            </div>
        </div>
      </div>

      <div className="tw-bg-gray-50 tw-px-5 tw-py-3 tw-flex tw-justify-between tw-items-center tw-border-t tw-border-gray-100">
        <div className="tw-flex tw-flex-col tw-gap-0.5">
            <div className="tw-flex tw-items-center tw-text-xs tw-text-gray-500" title="Auteur">
                <User size={12} className="tw-mr-1.5" />
                <span>{item.user?.fullName}</span>
            </div>
            <div className="tw-flex tw-items-center tw-text-xs tw-text-gray-400" title="Date de création">
                <Calendar size={12} className="tw-mr-1.5" />
                <span>{formattedDate}</span>
            </div>
        </div>

        {(canEdit || canDelete) && (
          <div className="tw-flex tw-gap-2">
            {canEdit && (
              <button 
                onClick={onEdit} 
                className="tw-flex tw-items-center tw-justify-center tw-w-8 tw-h-8 tw-rounded-full tw-border tw-border-blue-200 tw-text-blue-600 hover:tw-bg-blue-100 tw-transition-all"
                title="Modifier"
              >
                <Pencil size={14} />
              </button>
            )}
            {canDelete && (
              <button 
                onClick={onDelete} 
                className="tw-flex tw-items-center tw-justify-center tw-w-8 tw-h-8 tw-rounded-full tw-border tw-border-red-200 tw-text-red-600 hover:tw-bg-red-100 tw-transition-all"
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
};

TypeDepenseCard.propTypes = {
  item: PropTypes.object.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  canEdit: PropTypes.bool,
  canDelete: PropTypes.bool,
};
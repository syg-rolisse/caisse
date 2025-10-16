import PropTypes from 'prop-types';
import { Mail, Shield, UserCheck, UserX, Calendar, Pencil, Trash2 } from 'lucide-react';

export default function UserCard({ user, onEdit, onDelete, canEdit, canDelete }) {
  const formattedDate = new Date(user.createdAt).toLocaleDateString("fr-CA");

  const getDefaultAvatar = () => {
    const defaultAvatarNumber = (user.id % 5) + 1;
    return `uploads/avatars/default/${defaultAvatarNumber}.png`;
  };

  const avatarSrc = `${import.meta.env.VITE_BACKEND_URL}/${user?.avatarUrl || getDefaultAvatar()}`;

  return (
    <div className="tw-bg-white tw-rounded-xl tw-shadow-md hover:tw-shadow-lg tw-transition-shadow tw-duration-300 tw-border tw-border-gray-200 tw-flex tw-flex-col">
      <div className="tw-p-4 tw-flex-grow">
        <div className="tw-flex tw-items-start tw-gap-4">
          <img
            src={avatarSrc}
            alt={`Avatar de ${user.fullName}`}
            className="tw-w-16 tw-h-16 tw-object-cover tw-rounded-full tw-border-2 tw-border-gray-200"
          />
          <div className="tw-flex-1">
            <h3 className="tw-font-bold tw-text-lg tw-text-gray-800">{user.fullName}</h3>
            <div className="tw-flex tw-items-center tw-text-sm tw-text-gray-500">
              <Mail size={14} className="tw-mr-2" />
              <span>{user.email}</span>
            </div>
          </div>
        </div>

        <div className="tw-mt-4 tw-space-y-2 tw-text-sm">
          <div className="tw-flex tw-items-center">
            <Shield size={14} className="tw-mr-2 tw-text-gray-400" />
            <span>Profil : <span className={`tw-font-semibold ${user.Profil?.wording === 'Superadmin' ? 'tw-text-red-600' : 'tw-text-violet-600'}`}>{user.Profil?.wording}</span></span>
          </div>
          <div className="tw-flex tw-items-center">
            {user.status ? (
              <UserCheck size={14} className="tw-mr-2 tw-text-green-500" />
            ) : (
              <UserX size={14} className="tw-mr-2 tw-text-red-500" />
            )}
            <span>Statut : <span className={`tw-font-semibold ${user.status ? 'tw-text-green-600' : 'tw-text-red-600'}`}>{user.status ? 'Actif' : 'Inactif'}</span></span>
          </div>
          <div className="tw-flex tw-items-center">
            <Calendar size={14} className="tw-mr-2 tw-text-gray-400" />
            <span>Inscrit le : <span className="tw-font-medium tw-text-gray-600">{formattedDate}</span></span>
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

UserCard.propTypes = {
  user: PropTypes.object.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  canEdit: PropTypes.bool,
  canDelete: PropTypes.bool,
};
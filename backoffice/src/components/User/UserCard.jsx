import PropTypes from 'prop-types';
import { Mail, Shield, UserCheck, UserX, Calendar, Pencil, Trash2, MailCheck, MailX, User } from 'lucide-react';

export default function UserCard({ user, onEdit, onDelete }) {
  const formattedDate = new Date(user.createdAt).toLocaleDateString("fr-CA");
  
  const getDefaultAvatar = () => {
    const defaultAvatarNumber = (user.id % 5) + 1;
    return `uploads/avatars/default/${defaultAvatarNumber}.png`;
  };

  const avatarSrc = `${import.meta.env.VITE_BACKEND_URL}/${user?.avatarUrl || getDefaultAvatar()}`;

  // Helper pour déterminer les couleurs de statut
  const isSuperAdmin = user.Profil?.wording === 'Superadmin';
  const isActive = user.status;
  const isValidEmail = user.validEmail;

  return (
    <div className="tw-bg-white tw-rounded-xl tw-border tw-border-gray-200 tw-shadow-sm hover:tw-shadow-md tw-transition-all tw-duration-300 tw-flex tw-flex-col tw-overflow-hidden">
      
      <div className="tw-p-5 tw-flex-grow">
        {/* Header : Avatar + Nom + Email */}
        <div className="tw-flex tw-items-center tw-gap-3 tw-mb-5">
          <img
            src={avatarSrc}
            alt={`Avatar de ${user.fullName}`}
            className="tw-w-10 tw-h-10 tw-object-cover tw-rounded-full tw-border tw-border-gray-100 tw-shadow-sm"
          />
          <div className="tw-min-w-0 tw-flex tw-flex-col tw-gap-0.5">
            {/* Nom avec icône User */}
            <div className="tw-flex tw-items-center tw-gap-1.5 tw-text-gray-900">
                <User size={14} className="tw-text-gray-400 tw-flex-shrink-0" />
                <h3 className="tw-font-bold tw-text-sm tw-truncate" title={user.fullName}>
                {user.fullName}
                </h3>
            </div>
            
            {/* Email avec icône Mail */}
            <div className="tw-flex tw-items-center tw-gap-1.5 tw-text-xs tw-text-gray-500">
              <Mail size={14} className="tw-text-gray-400 tw-flex-shrink-0" />
              <span className="tw-truncate" title={user.email}>{user.email}</span>
            </div>
          </div>
        </div>

        {/* Corps : Grille d'informations */}
        <div className="tw-grid tw-grid-cols-2 tw-gap-3">
          
          {/* Rôle */}
          <div className={`tw-col-span-2 tw-flex tw-items-center tw-p-2 tw-rounded-lg tw-border ${isSuperAdmin ? 'tw-bg-red-50 tw-border-red-100' : 'tw-bg-violet-50 tw-border-violet-100'}`}>
            <div className={`tw-p-1.5 tw-rounded-md tw-mr-2 ${isSuperAdmin ? 'tw-bg-white tw-text-red-600' : 'tw-bg-white tw-text-violet-600'}`}>
              <Shield size={14} />
            </div>
            <div>
              <p className="tw-text-[10px] tw-text-gray-500 tw-uppercase tw-font-bold">Profil</p>
              <p className={`tw-text-xs tw-font-bold ${isSuperAdmin ? 'tw-text-red-700' : 'tw-text-violet-700'}`}>
                {user.Profil?.wording || 'N/A'}
              </p>
            </div>
          </div>

          {/* Statut Compte */}
          <div className="tw-flex tw-items-center tw-gap-2">
            <div className={`tw-p-1.5 tw-rounded-full ${isActive ? 'tw-bg-green-100 tw-text-green-600' : 'tw-bg-red-100 tw-text-red-600'}`}>
              {isActive ? <UserCheck size={14} /> : <UserX size={14} />}
            </div>
            <div className="tw-flex tw-flex-col">
              <span className="tw-text-[10px] tw-text-gray-400">Compte</span>
              <span className={`tw-text-xs tw-font-medium ${isActive ? 'tw-text-green-700' : 'tw-text-red-700'}`}>
                {isActive ? 'Actif' : 'Inactif'}
              </span>
            </div>
          </div>

          {/* Statut Email */}
          <div className="tw-flex tw-items-center tw-gap-2">
            <div className={`tw-p-1.5 tw-rounded-full ${isValidEmail ? 'tw-bg-blue-100 tw-text-blue-600' : 'tw-bg-orange-100 tw-text-orange-600'}`}>
              {isValidEmail ? <MailCheck size={14} /> : <MailX size={14} />}
            </div>
            <div className="tw-flex tw-flex-col">
              <span className="tw-text-[10px] tw-text-gray-400">Email</span>
              <span className={`tw-text-xs tw-font-medium ${isValidEmail ? 'tw-text-blue-700' : 'tw-text-orange-700'}`}>
                {isValidEmail ? 'Vérifié' : 'En attente'}
              </span>
            </div>
          </div>

          {/* Date */}
          <div className="tw-col-span-2 tw-mt-2 tw-pt-3 tw-border-t tw-border-gray-50 tw-flex tw-items-center tw-justify-end tw-text-xs tw-text-gray-400">
            <Calendar size={12} className="tw-mr-1.5" />
            <span>Inscrit le {formattedDate}</span>
          </div>
        </div>
      </div>

      {/* Footer : Actions */}
    
        <div className="tw-px-4 tw-py-3 tw-bg-gray-50 tw-border-t tw-border-gray-100 tw-flex tw-justify-end tw-items-center">
         
            <button 
              onClick={onEdit} 
              className=" tw-mr-2 tw-flex tw-items-center tw-justify-center tw-gap-2 tw-py-1.5 tw-px-3 tw-rounded-lg tw-bg-blue tw-border tw-border-blue-200 tw-text-xs tw-font-semibold tw-text-blue-700 hover:tw-border-violet-300 hover:tw-text-violet-600 tw-transition-colors"
            >
              <Pencil size={14} />
              {/* <span>Gérer</span> */}
            </button>
         
          
         
            <button 
              onClick={onDelete} 
              className="tw-flex tw-items-center tw-justify-center tw-p-1.5 tw-rounded-lg tw-bg-red tw-border tw-border-red-200 tw-text-red-400 hover:tw-bg-red-50 hover:tw-border-red-200 hover:tw-text-red-500 tw-transition-colors"
              title="Supprimer"
            >
              <Trash2 size={16} />
            </button>
         
        </div>
    
    </div>
  );
}

UserCard.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.number.isRequired,
    fullName: PropTypes.string,
    email: PropTypes.string,
    avatarUrl: PropTypes.string,
    createdAt: PropTypes.string,
    status: PropTypes.bool,
    validEmail: PropTypes.bool,
    Profil: PropTypes.shape({
      wording: PropTypes.string
    })
  }).isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
};
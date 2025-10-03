// src/components/dashboard/UserStatsCard.js
import PropTypes from 'prop-types';
import { Users, UserCheck, UserX, ShieldCheck, UserCog, Briefcase } from 'lucide-react';

const UserStatsCard = ({ stats, allUsers }) => {
  return (
    <div className="tw-col-span-1 md:tw-col-span-2 tw-bg-white tw-p-6 tw-rounded-xl tw-shadow-md tw-border tw-border-gray-100">
      <div className="tw-flex tw-items-center tw-justify-between tw-mb-4">
        <h3 className="tw-text-lg tw-font-semibold tw-text-gray-700">Utilisateurs</h3>
        <div className="tw-p-2 tw-bg-violet-100 tw-rounded-lg">
          <Users className="tw-w-6 tw-h-6 tw-text-violet-600" />
        </div>
      </div>
      <p className="tw-text-4xl tw-font-bold tw-text-gray-800">{allUsers?.length || 0}</p>
      <div className="tw-flex tw-items-center tw-gap-4 tw-mt-2 tw-text-sm">
        <span className="tw-flex tw-items-center tw-text-green-600">
          <UserCheck className="tw-w-4 tw-h-4 tw-mr-1" /> {stats?.activeUsers || 0} Actifs
        </span>
        <span className="tw-flex tw-items-center tw-text-red-600">
          <UserX className="tw-w-4 tw-h-4 tw-mr-1" /> {stats?.inactiveUsers || 0} Inactifs
        </span>
      </div>
      <div className="tw-mt-4 tw-pt-4 tw-border-t tw-border-gray-200 tw-flex tw-flex-wrap tw-gap-2">
        <span className="tw-inline-flex tw-items-center tw-px-2.5 tw-py-0.5 tw-rounded-full tw-text-xs tw-font-medium tw-bg-red-100 tw-text-red-800">
          <ShieldCheck size={14} className="tw-mr-1" /> S. Admin: {stats?.Superadmin || 0}
        </span>
        <span className="tw-inline-flex tw-items-center tw-px-2.5 tw-py-0.5 tw-rounded-full tw-text-xs tw-font-medium tw-bg-sky-100 tw-text-sky-800">
          <UserCog size={14} className="tw-mr-1" /> Admin: {stats?.Admin || 0}
        </span>
        <span className="tw-inline-flex tw-items-center tw-px-2.5 tw-py-0.5 tw-rounded-full tw-text-xs tw-font-medium tw-bg-amber-100 tw-text-amber-800">
          <Briefcase size={14} className="tw-mr-1" /> Employé: {stats?.Employe || 0}
        </span>
      </div>
    </div>
  );
};

UserStatsCard.propTypes = {
  stats: PropTypes.object.isRequired,
  allUsers: PropTypes.array.isRequired,
};

export default UserStatsCard;
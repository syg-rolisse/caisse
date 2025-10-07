import { memo } from "react";
import PropTypes from "prop-types";
import { motion } from "framer-motion";
import {
  Users,
  UserCheck,
  UserX,
  ShieldCheck,
  UserCog,
  Briefcase,
} from "lucide-react";

/**
 * Un composant interne et réutilisable pour animer un nombre de manière fluide.
 * Framer Motion va automatiquement interpoler la valeur lorsque la prop `value` change,
 * créant un effet de comptage.
 */
const AnimatedStat = ({ value }) => {
  // Le composant motion.span recevra une nouvelle valeur et l'animera.
  // Math.round est utilisé car Framer Motion peut passer des nombres à virgule pendant l'animation.
  return <motion.span>{Math.round(value)}</motion.span>;
};

AnimatedStat.propTypes = {
  value: PropTypes.number.isRequired,
};

const UserStatsCard = ({ stats }) => {
  // On déstructure les stats avec des valeurs par défaut pour éviter les erreurs
  const {
    totalUsers = 0,
    activeUsers = 0,
    inactiveUsers = 0,
    Superadmin = 0,
    Admin = 0,
    Employé = 0,
    Sécrétaire = 0,
  } = stats;

  return (
    <div className="tw-col-span-1 md:tw-col-span-2 tw-bg-white tw-p-6 tw-rounded-xl tw-shadow-md tw-border tw-border-gray-100">
      <div className="tw-flex tw-items-center tw-justify-between tw-mb-4">
        <h3 className="tw-text-lg tw-font-semibold tw-text-gray-700">
          Utilisateurs
        </h3>
        <div className="tw-p-2 tw-bg-violet-100 tw-rounded-lg">
          <Users className="tw-w-6 tw-h-6 tw-text-violet-600" />
        </div>
      </div>

      {/* Le total des utilisateurs est maintenant animé */}
      <motion.p
        key={totalUsers} // La key aide React à identifier le changement
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="tw-text-4xl tw-font-bold tw-text-gray-800"
      >
        <AnimatedStat value={totalUsers} />
      </motion.p>

      <div className="tw-flex tw-items-center tw-gap-4 tw-mt-2 tw-text-sm">
        <span className="tw-flex tw-items-center tw-text-green-600">
          <UserCheck className="tw-w-4 tw-h-4 tw-mr-1" />
          <AnimatedStat value={activeUsers} />
          &nbsp;Actifs
        </span>
        <span className="tw-flex tw-items-center tw-text-red-600">
          <UserX className="tw-w-4 tw-h-4 tw-mr-1" />
          <AnimatedStat value={inactiveUsers} />
          &nbsp;Inactifs
        </span>
      </div>

      <div className="tw-mt-4 tw-pt-4 tw-border-t tw-border-gray-200 tw-flex tw-flex-wrap tw-gap-2">
        <span className="tw-inline-flex tw-items-center tw-px-2.5 tw-py-0.5 tw-rounded-full tw-text-xs tw-font-medium tw-bg-red-100 tw-text-red-800">
          <ShieldCheck size={14} className="tw-mr-1" /> S. Admin :{" "}
          <AnimatedStat value={Superadmin} />
        </span>
        <span className="tw-inline-flex tw-items-center tw-px-2.5 tw-py-0.5 tw-rounded-full tw-text-xs tw-font-medium tw-bg-sky-100 tw-text-sky-800">
          <UserCog size={14} className="tw-mr-1" /> Admin :{" "}
          <AnimatedStat value={Admin} />
        </span>
        <span className="tw-inline-flex tw-items-center tw-px-2.5 tw-py-0.5 tw-rounded-full tw-text-xs tw-font-medium tw-bg-amber-100 tw-text-amber-800">
          <Briefcase size={14} className="tw-mr-1" /> Employé :{" "}
          <AnimatedStat value={Employé} />
        </span>
        <span className="tw-inline-flex tw-items-center tw-px-2.5 tw-py-0.5 tw-rounded-full tw-text-xs tw-font-medium tw-bg-amber-100 tw-text-amber-800">
          <Briefcase size={14} className="tw-mr-1" /> Sécrétaire : {"  "}
          <AnimatedStat value={"  " + Sécrétaire} />
        </span>
      </div>
    </div>
  );
};

UserStatsCard.propTypes = {
  stats: PropTypes.shape({
    totalUsers: PropTypes.number,
    activeUsers: PropTypes.number,
    inactiveUsers: PropTypes.number,
    Superadmin: PropTypes.number,
    Admin: PropTypes.number,
    Employé: PropTypes.number,
    Sécrétaire: PropTypes.number,
  }).isRequired,
};

// On exporte la version mémoïsée pour des raisons de performance
export default memo(UserStatsCard);

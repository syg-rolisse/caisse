import { useState } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { 
  Pencil, Trash2, Lock, Unlock, Tag, Calendar, User, Info, MoreVertical, FileText 
} from 'lucide-react';
import WelcomeModal from "../../components/WelcomeModal";

const DepenseCard = ({ depense, onEdit, onDelete }) => {
  const [showRejetModal, setShowRejetModal] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  };

  const isPaid = depense.status;
  const unpaidAmount = Math.max(0, depense.montant - (depense.Mouvements?.reduce((total, m) => total + m.montant, 0) || 0));

  const cardVariants = {
    initial: { opacity: 0, y: 20, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  };

  const ActionMenu = () => (
    <div className="tw-relative">
      <button 
        onClick={() => setIsMenuOpen(!isMenuOpen)} 
        onBlur={() => setTimeout(() => setIsMenuOpen(false), 150)}
        className="tw-p-2 tw-rounded-full hover:tw-bg-gray-200"
      >
        <MoreVertical size={20} />
      </button>
      {isMenuOpen && (
        <div className="tw-absolute tw-right-0 tw-mt-2 tw-w-48 tw-bg-white tw-rounded-md tw-shadow-xl tw-z-10 tw-border tw-border-gray-100">
          <div className="tw-py-1">
            <button onClick={onEdit} className="tw-w-full tw-text-left tw-flex tw-items-center tw-px-4 tw-py-2 tw-text-sm tw-text-gray-700 hover:tw-bg-gray-100">
              <Pencil size={16} className="tw-mr-3" /> Modifier
            </button>
            {depense?.factureUrl && (
              <a
                href={`${import.meta.env.VITE_BACKEND_URL}/uploads/${depense?.factureUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="tw-flex tw-items-center tw-px-4 tw-py-2 tw-text-sm tw-text-gray-700 hover:tw-bg-gray-100"
              >
                <FileText size={16} className="tw-mr-3" /> Voir le document
              </a>
            )}
            <div className="tw-my-1 tw-border-t tw-border-gray-100"></div>
            <button onClick={onDelete} className="tw-w-full tw-text-left tw-flex tw-items-center tw-px-4 tw-py-2 tw-text-sm tw-text-red-600 hover:tw-bg-red-50">
              <Trash2 size={16} className="tw-mr-3" /> Supprimer
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const StatusBadge = ({ color, text, hasInfo, onInfoClick }) => {
    const colorClasses = {
      green: "tw-bg-green-100 tw-text-green-800",
      red: "tw-bg-red-100 tw-text-red-800",
      orange: "tw-bg-orange-100 tw-text-orange-800",
      blue: "tw-bg-blue-100 tw-text-blue-800",
    };
    return (
      <div className={`tw-inline-flex tw-items-center tw-px-2.5 tw-py-0.5 tw-rounded-full tw-text-xs tw-font-semibold ${colorClasses[color]}`}>
        {text}
        {hasInfo && (
          <button onClick={onInfoClick} className="tw-ml-1.5 tw-rounded-full hover:tw-bg-white/50">
            <Info size={14} />
          </button>
        )}
      </div>
    );
  };

  return (
    <>
      <motion.div
        layout
        variants={cardVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="tw-bg-white tw-rounded-xl tw-shadow-md hover:tw-shadow-lg tw-transition-shadow tw-duration-300 tw-border tw-border-gray-200 tw-flex tw-flex-col"
      >
        <div className="tw-p-4 tw-flex tw-justify-between tw-items-center tw-border-b tw-border-gray-200">
          <div className="tw-flex tw-items-center tw-gap-3 tw-min-w-0">
            <div className="tw-p-2 tw-bg-blue-100 tw-rounded-lg tw-flex-shrink-0">
              <Tag className="tw-w-5 tw-h-5 tw-text-blue-600" />
            </div>
            <h3 className="tw-font-bold tw-text-gray-800 tw-truncate">{depense?.typeDeDepense?.wording}</h3>
          </div>
          <ActionMenu />
        </div>

        <div className="tw-p-4 tw-flex-grow">
          <p className="tw-text-3xl tw-font-bold tw-text-gray-800">{depense.montant.toLocaleString('fr-FR')} CFA</p>
          <p className="tw-text-gray-600 tw-mt-1 tw-min-h-[20px]">{depense?.wording}</p>
          
          <div className="tw-mt-4 tw-flex tw-flex-wrap tw-gap-2">
            {depense.rejeter ? (
              <StatusBadge color="red" text="Rejeté" hasInfo={!!depense.rejetMessage} onInfoClick={() => setShowRejetModal(true)} />
            ) : (
              <StatusBadge color="green" text="Approuvé" />
            )}
            
            {isPaid ? (
              <StatusBadge color="green" text="Payé" />
            ) : (
              <StatusBadge color="orange" text={`${unpaidAmount.toLocaleString('fr-FR')} Impayé`} />
            )}

            {depense.decharger && <StatusBadge color="blue" text="Déchargé" />}
          </div>
        </div>

        <div className="tw-p-3 tw-bg-gray-50 tw-border-t tw-border-gray-100 tw-flex tw-justify-between tw-items-center tw-text-xs tw-text-gray-500">
          <div className="tw-flex tw-flex-wrap tw-items-center tw-gap-x-3 tw-gap-y-1 tw-min-w-0">
            <div className="tw-flex tw-items-center tw-gap-1.5">
              <User size={14} />
              <span className="tw-truncate">{depense?.user?.fullName}</span>
            </div>
            <div className="tw-flex tw-items-center tw-gap-1.5 tw-flex-shrink-0">
              <Calendar size={14} />
              <span>{formatDate(depense.dateOperation)}</span>
            </div>
          </div>
          {depense.bloquer ? <Lock size={16} title="Bloqué" /> : <Unlock size={16} className="tw-text-gray-600" title="Débloqué" />}
        </div>
      </motion.div>

      {depense.rejeter && depense.rejetMessage && (
        <WelcomeModal isActive={showRejetModal} onClose={() => setShowRejetModal(false)}>
          <div className="tw-p-4">
            <h3 className="tw-text-lg tw-font-bold tw-text-red-700 tw-mb-3">Motif du rejet</h3>
            <p className="tw-text-gray-600">{depense.rejetMessage}</p>
          </div>
        </WelcomeModal>
      )}
    </>
  );
};

DepenseCard.propTypes = {
  depense: PropTypes.object.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  color: PropTypes.string,
  text: PropTypes.string,
  hasInfo: PropTypes.bool,
  onInfoClick: PropTypes.func,

};

export default DepenseCard;
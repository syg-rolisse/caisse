// src/components/dashboard/DepenseCard.js
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { Pencil, Trash2, Download, FileX2, Lock, Unlock, Tag, Calendar, User } from 'lucide-react';

const DepenseCard = ({ depense, onEdit, onDelete }) => {

  const formatDate = (dateString) => {
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

  return (
    <motion.div
      layout
      variants={cardVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="tw-bg-white tw-rounded-xl tw-shadow-md tw-border tw-border-gray-100 tw-flex tw-flex-col"
    >
      {/* Header */}
      <div className="tw-p-4 tw-flex tw-justify-between tw-items-center tw-border-b tw-border-gray-200">
        <div className="tw-flex tw-items-center tw-gap-3">
          <div className="tw-p-2 tw-bg-green-100 tw-rounded-lg">
            <Tag className="tw-w-5 tw-h-5 tw-text-green-600" />
          </div>
          <span className="tw-font-semibold tw-text-gray-700 tw-truncate" title={depense?.typeDeDepense?.wording}>
            {depense?.typeDeDepense?.wording}
          </span>
        </div>
        <div className="tw-flex tw-items-center tw-gap-1 sm:tw-gap-2">
          {depense?.factureUrl ? (
            <a
              href={`${import.meta.env.VITE_BACKEND_URL}/uploads/${depense?.factureUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="tw-p-2 tw-rounded-full hover:tw-bg-gray-100 tw-text-gray-500 hover:tw-text-gray-700"
              aria-label="Télécharger la facture"
            >
              <Download size={18} />
            </a>
          ) : (
             <div className="tw-p-2 tw-rounded-full tw-text-gray-400" aria-label="Aucune facture">
              <FileX2 size={18} />
            </div>
          )}
          <button onClick={onEdit} className="tw-p-2 tw-rounded-full hover:tw-bg-orange-100 tw-text-orange-600" aria-label="Modifier">
            <Pencil size={18} />
          </button>
          <button onClick={onDelete} className="tw-p-2 tw-rounded-full hover:tw-bg-red-100 tw-text-red-600" aria-label="Supprimer">
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="tw-p-4 tw-flex-grow">
        <p className="tw-text-3xl tw-font-bold tw-text-gray-800">
          {depense.montant.toLocaleString('fr-FR')} CFA
        </p>
        <p className="tw-text-gray-600 tw-mt-2 tw-min-h-[40px]">{depense?.wording}</p>
        
        <div className="tw-mt-4 tw-pt-4 tw-border-t tw-border-gray-200 tw-space-y-2 tw-text-sm">
           <div className="tw-flex tw-items-center tw-text-gray-500">
             <User size={14} className="tw-mr-2" />
             <span>{depense?.user?.fullName}</span>
           </div>
           <div className="tw-flex tw-items-center tw-text-gray-500">
             <Calendar size={14} className="tw-mr-2" />
             <span>{formatDate(depense.createdAt)}</span>
           </div>
        </div>
      </div>

      {/* Footer */}
      <div className="tw-p-4 tw-bg-gray-50 tw-rounded-b-xl tw-flex tw-justify-between tw-items-center">
        <div className="tw-flex tw-items-center tw-gap-2">
           <span className={`tw-inline-flex tw-items-center tw-px-2.5 tw-py-0.5 tw-rounded-full tw-text-xs tw-font-medium ${
              depense.rejeter 
                ? "tw-bg-red-100 tw-text-red-800" 
                : "tw-bg-green-100 tw-text-green-800"
            }`}>
            {depense.rejeter ? "Rejeté" : "Approuvé"}
          </span>
          {depense.decharger && (
            <span className="tw-inline-flex tw-items-center tw-px-2.5 tw-py-0.5 tw-rounded-full tw-text-xs tw-font-medium tw-bg-orange-100 tw-text-orange-800">
              Déchargé
            </span>
          )}
        </div>
        <div className="tw-flex tw-items-center tw-gap-2">
            {isPaid ? (
                <span className="tw-font-semibold tw-text-green-600">Payé</span>
            ) : (
                <span className="tw-font-semibold tw-text-orange-600">{unpaidAmount.toLocaleString('fr-FR')} Impayé</span>
            )}
            {depense.bloquer ? <Lock size={16} className="tw-text-gray-400"/> : <Unlock size={16} className="tw-text-gray-500"/>}
        </div>
      </div>
    </motion.div>
  );
};

DepenseCard.propTypes = {
  depense: PropTypes.object.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default DepenseCard;
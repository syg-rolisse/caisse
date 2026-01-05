import { useState } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import {
  Pencil, Trash2, Lock, Unlock, Tag, Calendar, User, FileText, Download, AlertTriangle, CheckCircle2, Clock, Banknote
} from 'lucide-react';
import WelcomeModal from "../../components/WelcomeModal";
import { downloadSingleDepense, simpleFormatDate } from '../../utils/downloadDepense'; 

// --- COMPOSANT INTERNE : BADGE DE STATUT ---
const StatusBadge = ({ color, icon: Icon, label, onClick, className = "" }) => {
  const colors = {
    green: "tw-bg-emerald-100 tw-text-emerald-700 tw-border-emerald-200",
    red: "tw-bg-rose-100 tw-text-rose-700 tw-border-rose-200",
    orange: "tw-bg-amber-100 tw-text-amber-700 tw-border-amber-200",
    blue: "tw-bg-blue-100 tw-text-blue-700 tw-border-blue-200",
    gray: "tw-bg-gray-100 tw-text-gray-600 tw-border-gray-200",
  };

  return (
    <span 
      onClick={onClick}
      className={`tw-inline-flex tw-items-center tw-gap-1.5 tw-px-3 tw-py-1 tw-rounded-full tw-text-[11px] tw-font-bold tw-uppercase tw-tracking-wide tw-border ${colors[color]} ${onClick ? 'tw-cursor-pointer hover:tw-opacity-80 tw-transition-opacity' : ''} ${className}`}
    >
      {Icon && <Icon size={12} strokeWidth={3} />}
      {label}
    </span>
  );
};

StatusBadge.propTypes = {
  color: PropTypes.oneOf(['green', 'red', 'orange', 'blue', 'gray']).isRequired,
  icon: PropTypes.elementType,
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  className: PropTypes.string,
};

// --- COMPOSANT PRINCIPAL ---
const DepenseCard = ({ depense, onEdit, onDelete, canEdit, canDelete }) => {
  const [showRejetModal, setShowRejetModal] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));
  const companyInfo = {
    name: user?.company?.companyName || "Mon Entreprise",
    address: user?.company?.address || "Adresse non spécifiée",
    phone: user?.company?.phoneNumber || "Contact non spécifié",
    userFullName: user?.fullName || "Utilisateur inconnu",
  };

  const formatDate = simpleFormatDate;
  const isPaid = depense.status;
  const unpaidAmount = Math.max(0, depense.montant - (depense.Mouvements?.reduce((total, m) => total + m.montant, 0) || 0));

  const handleDownloadPdf = () => {
    downloadSingleDepense(depense, companyInfo, formatDate);
  };

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="tw-bg-white tw-rounded-2xl tw-shadow-sm hover:tw-shadow-xl tw-transition-all tw-duration-300 tw-border tw-border-gray-100 tw-flex tw-flex-col tw-h-full tw-relative tw-overflow-hidden group"
      >
        
        {/* CORPS DE LA CARTE */}
        <div className="tw-p-6 tw-flex tw-flex-col tw-h-full">
          
          {/* Ligne 1 : Type + Statut principal */}
          <div className="tw-flex tw-justify-between tw-items-start tw-mb-4">
            <div className="tw-inline-flex tw-items-center tw-gap-2 tw-text-gray-500">
               <div className="tw-p-1.5 tw-bg-gray-100 tw-rounded-md">
                 <Tag size={14} className="tw-text-gray-600"/>
               </div>
               <span className="tw-text-xs tw-font-bold tw-text-gray-600 tw-uppercase tw-tracking-wider">
                 {depense?.typeDeDepense?.wording || "Dépense"}
               </span>
            </div>

            {depense.rejeter ? (
              <StatusBadge color="red" icon={AlertTriangle} label="Rejeté" onClick={() => setShowRejetModal(true)} />
            ) : (
              <StatusBadge color="green" icon={CheckCircle2} label="Approuvé" />
            )}
          </div>

          {/* Ligne 2 : Montant */}
          <div className="tw-mb-4">
             <div className="tw-flex tw-items-baseline tw-gap-1.5">
                <h3 className="tw-text-3xl tw-font-extrabold tw-text-slate-800 tw-tracking-tight">
                  {depense.montant.toLocaleString('fr-FR')}
                </h3>
                <span className="tw-text-sm tw-font-semibold tw-text-gray-400">CFA</span>
             </div>

             {/* Statut Paiement (Sous le montant) */}
             <div className="tw-mt-2 tw-flex tw-flex-wrap tw-gap-2">
                {isPaid ? (
                   <span className="tw-inline-flex tw-items-center tw-gap-1 tw-text-xs tw-font-bold tw-text-emerald-600">
                     <CheckCircle2 size={12} strokeWidth={3}/> Payé
                   </span>
                ) : !depense.rejeter ? (
                   <span className="tw-inline-flex tw-items-center tw-gap-1 tw-text-xs tw-font-bold tw-text-amber-600">
                     <Clock size={12} strokeWidth={3}/> Reste: {unpaidAmount.toLocaleString('fr-FR')}
                   </span>
                ) : null}
                
                {depense.decharger && (
                   <span className="tw-inline-flex tw-items-center tw-gap-1 tw-text-xs tw-font-bold tw-text-blue-600">
                     <Banknote size={12} strokeWidth={3}/> Déchargé
                   </span>
                )}
             </div>
          </div>
          
          {/* Ligne 3 : Description */}
          <div className="tw-mb-5 tw-flex-grow">
            <p className="tw-text-sm tw-text-gray-600 tw-leading-relaxed tw-line-clamp-2">
              {depense?.wording || <span className="tw-italic tw-text-gray-400">Aucun détail supplémentaire.</span>}
            </p>
          </div>

          {/* Ligne 4 : Info Utilisateur & Date (Séparateur) */}
          <div className="tw-pt-4 tw-border-t tw-border-gray-100 tw-flex tw-items-center tw-justify-between tw-text-xs tw-text-gray-500">
             <div className="tw-flex tw-items-center tw-gap-3">
                <div className="tw-flex tw-items-center tw-gap-1.5" title="Auteur">
                  <User size={14} className="tw-text-gray-400"/>
                  <span className="tw-font-medium tw-text-gray-700 tw-truncate tw-max-w-[100px]">{depense?.user?.fullName}</span>
                </div>
                <div className="tw-w-1 tw-h-1 tw-rounded-full tw-bg-gray-300"></div>
                <div className="tw-flex tw-items-center tw-gap-1.5" title="Date d'opération">
                  <Calendar size={14} className="tw-text-gray-400"/>
                  <span>{formatDate(depense.dateOperation)}</span>
                </div>
             </div>
             <div>
                {depense.bloquer 
                  ? <Lock size={14} className="tw-text-gray-300" title="Verrouillé" /> 
                  : <Unlock size={14} className="tw-text-emerald-400" title="Modifiable" />
                }
             </div>
          </div>
        </div>

        {/* --- FOOTER ACTIONS (FLEX) --- */}
        <div className="tw-px-6 tw-py-3 tw-bg-gray-50/80 tw-backdrop-blur-sm tw-border-t tw-border-gray-100 tw-flex tw-items-center tw-justify-end tw-gap-3">
            
            {/* PDF */}
            <button 
                onClick={handleDownloadPdf}
                className="tw-h-8 tw-w-8 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-text-gray-500 hover:tw-text-blue-600 hover:tw-bg-blue-100 tw-transition-all"
                title="Télécharger PDF"
            >
                <Download size={16} />
            </button>

            {/* Facture */}
            {depense?.factureUrl && (
              <a
                href={`${import.meta.env.VITE_BACKEND_URL}/uploads/${depense?.factureUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="tw-h-8 tw-w-8 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-text-gray-500 hover:tw-text-purple-600 hover:tw-bg-purple-100 tw-transition-all"
                title="Voir la facture"
              >
                <FileText size={16} />
              </a>
            )}

            <div className="tw-h-4 tw-w-px tw-bg-gray-300 tw-mx-1"></div>

            {/* Modifier (Bouton Pilule) */}
            {canEdit && (
              <button 
                onClick={onEdit} 
                className="tw-flex tw-items-center tw-justify-center tw-gap-1.5 tw-px-3 tw-py-1.5 tw-rounded-full tw-bg-indigo-50 tw-text-indigo-600 hover:tw-bg-indigo-100 hover:tw-text-indigo-700 tw-transition-all tw-text-xs tw-font-bold"
              >
                <Pencil size={14} /> <span></span>
              </button>
            )}

            {/* Supprimer (Bouton Pilule) */}
            {canDelete && (
              <button 
                onClick={onDelete} 
                className="tw-flex tw-items-center tw-gap-1.5 tw-px-3 tw-py-1.5 tw-rounded-full tw-bg-rose-50 tw-text-rose-600 hover:tw-bg-rose-100 hover:tw-text-rose-700 tw-transition-all tw-text-xs tw-font-bold"
              >
                <Trash2 size={14} /> <span></span>
              </button>
            )}
        </div>
      </motion.div>

      {/* MODALE REJET */}
      {depense.rejeter && depense.rejetMessage && (
        <WelcomeModal isActive={showRejetModal} onClose={() => setShowRejetModal(false)}>
          <div className="tw-p-8 tw-text-center">
            <div className="tw-w-16 tw-h-16 tw-bg-red-50 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-mx-auto tw-mb-6">
                <AlertTriangle className="tw-text-red-500" size={32}/>
            </div>
            <h3 className="tw-text-xl tw-font-extrabold tw-text-gray-900 tw-mb-3">Dépense Rejetée</h3>
            <div className="tw-bg-gray-50 tw-p-4 tw-rounded-lg tw-mb-6 tw-text-left">
                <p className="tw-text-xs tw-font-bold tw-text-gray-400 tw-uppercase tw-mb-2">Motif du rejet</p>
                <p className="tw-text-gray-700 tw-text-sm tw-leading-relaxed">{depense.rejetMessage}</p>
            </div>
            <button 
                onClick={() => setShowRejetModal(false)}
                className="tw-w-full tw-py-3 tw-bg-gray-900 hover:tw-bg-gray-800 tw-text-white tw-font-semibold tw-rounded-xl tw-transition-colors tw-shadow-lg tw-shadow-gray-200"
            >
                Fermer
            </button>
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
  canEdit: PropTypes.bool.isRequired,
  canDelete: PropTypes.bool.isRequired,
};

export default DepenseCard;
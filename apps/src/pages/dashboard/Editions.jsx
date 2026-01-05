import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { 
  ServerCrash, Loader2, FileText, Lock, Unlock, 
  CheckCircle2, XCircle, Clock, Eye, ChevronDown
} from "lucide-react";

import PageHeaderActions from "../../components/common/PageHeaderActions";
import ExportToExcelButton from "../../components/ExportToExcelButton";
import ExportToPDFButton from "../../components/ExportToPDFButton";
import UserAndDateRangeFilter from "../../components/UserAndDateRangeFilter";
import EmptyState from "../../components/EmptyState";
import { useFetchUsers } from "../../hook/api/useFetchUsers";
import { useFetchEditions } from "../../hook/api/useFetchEditions";
import { useSocket } from "../../context/socket.jsx";
import "../../fade.css";

// --- COMPOSANT INTERNE : BADGE STATUT ---
const StatusBadge = ({ status, rejeter, type = "status" }) => {
  if (type === "status") {
     if (rejeter) return <span className="tw-inline-flex tw-items-center tw-gap-1 tw-px-2.5 tw-py-0.5 tw-rounded-full tw-text-xs tw-font-bold tw-bg-red-100 tw-text-red-700 tw-border tw-border-red-200"><XCircle size={12}/> Rejeté</span>;
     if (status) return <span className="tw-inline-flex tw-items-center tw-gap-1 tw-px-2.5 tw-py-0.5 tw-rounded-full tw-text-xs tw-font-bold tw-bg-emerald-100 tw-text-emerald-700 tw-border tw-border-emerald-200"><CheckCircle2 size={12}/> Payé</span>;
     return <span className="tw-inline-flex tw-items-center tw-gap-1 tw-px-2.5 tw-py-0.5 tw-rounded-full tw-text-xs tw-font-bold tw-bg-amber-100 tw-text-amber-700 tw-border tw-border-amber-200"><Clock size={12}/> Impayé</span>;
  }
  if (type === "approbation") {
      return !rejeter 
        ? <span className="tw-inline-flex tw-items-center tw-gap-1 tw-px-2.5 tw-py-0.5 tw-rounded-full tw-text-xs tw-font-bold tw-bg-green-100 tw-text-green-700 tw-border tw-border-green-200"><CheckCircle2 size={12}/> Approuvé</span>
        : <span className="tw-inline-flex tw-items-center tw-gap-1 tw-px-2.5 tw-py-0.5 tw-rounded-full tw-text-xs tw-font-bold tw-bg-red-100 tw-text-red-700 tw-border tw-border-red-200"><XCircle size={12}/> Rejeté</span>;
  }
  if (type === "decharge") {
      return status 
        ? <span className="tw-inline-flex tw-items-center tw-gap-1 tw-px-2.5 tw-py-0.5 tw-rounded-full tw-text-xs tw-font-bold tw-bg-blue-100 tw-text-blue-700 tw-border tw-border-blue-200"><CheckCircle2 size={12}/> Oui</span>
        : <span className="tw-inline-flex tw-items-center tw-gap-1 tw-px-2.5 tw-py-0.5 tw-rounded-full tw-text-xs tw-font-bold tw-bg-gray-100 tw-text-gray-500 tw-border tw-border-gray-200"><XCircle size={12}/> Non</span>;
  }
  return null;
};

import PropTypes from "prop-types";
// Validation des props
StatusBadge.propTypes = {
  status: PropTypes.bool,
  rejeter: PropTypes.bool,
  bloquer: PropTypes.bool,
  type: PropTypes.oneOf(['status', 'approbation', 'decharge']),
};

export default function Editions() {
  //const currentYear = new Date().getFullYear();

  const initialFilters = {
    dateDebut: '',
    dateFin: '',
    userId: null,
    typeDeDepenseId: null,
    by: null,
  };

  const [filters, setFilters] = useState(initialFilters);
  const [showColumnMenu, setShowColumnMenu] = useState(false); // État pour le menu colonnes
  const columnMenuRef = useRef(null); // Ref pour fermer au clic dehors

  const queryClient = useQueryClient();
  const socket = useSocket();
  const user = JSON.parse(localStorage.getItem("user"));
  const companyId = user?.company?.id;

  const { isLoading: isLoadingUsers } = useFetchUsers({
    page: 1,
    perpage: 9999,
    companyId,
  });

  const {
    data: depenses = [],
    isLoading: isLoadingEditions,
    isError,
  } = useFetchEditions({
    companyId,
    userId: filters.userId,
    dateDebut: filters.dateDebut,
    dateFin: filters.dateFin,
    typeDeDepenseId: filters.typeDeDepenseId,
    by: filters.by,
  });

  const handleSearch = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  // Gestion fermeture menu au clic extérieur
  useEffect(() => {
    function handleClickOutside(event) {
      if (columnMenuRef.current && !columnMenuRef.current.contains(event.target)) {
        setShowColumnMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [columnMenuRef]);

  useEffect(() => {
    if (!socket || !companyId) return;
    socket.emit("join_company_room", companyId);

    const handleDataUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["editions"] });
    };

    const events = [
      "user_created", "user_updated", "user_deleted",
      "depense_created", "depense_updated", "depense_deleted",
      "type_depense_created", "type_depense_updated", "type_depense_deleted",
    ];
    events.forEach((event) => socket.on(event, handleDataUpdate));

    return () => {
      events.forEach((event) => socket.off(event, handleDataUpdate));
    };
  }, [socket, companyId, queryClient]);

  // Gestion des colonnes (Ordre important pour le tableau)
  const [columnVisibility, setColumnVisibility] = useState({
    typeDepense: true,
    id: true,
    user: true,
    dateOperation: true,
    wording: true,
    montant: true,       // Index clé pour le total
    totalDecaisse: true,
    resteAPayer: true,
    status: true,
    approbation: true,
    bloquer: true,
    facture: true,
    decharger: true,
    createdAt: true,
  });

  // Labels pour le menu
  const columnLabels = {
    typeDepense: "Type de dépense",
    id: "N°",
    user: "Auteur",
    dateOperation: "Date Op.",
    wording: "Libellé",
    montant: "Impayé",
    totalDecaisse: "Décaissé",
    resteAPayer: "Reste",
    status: "Paiement",
    approbation: "Approbation",
    bloquer: "Verr.",
    facture: "Facture",
    decharger: "Décharge",
    createdAt: "Création",
  };

  const toggleColumnVisibility = (column) => {
    setColumnVisibility((prev) => ({ ...prev, [column]: !prev[column] }));
  };

  const isLoading = isLoadingUsers || isLoadingEditions;
  // Calcul du nombre total de colonnes visibles pour le colspan des messages d'erreur/chargement
  const visibleColumnCount = Object.values(columnVisibility).filter(Boolean).length;

  // Calcul du colspan pour la cellule "Total Général" (toutes les colonnes visibles AVANT 'montant')
  const colspanBeforeMontant = useMemo(() => {
    const columnsOrder = ['typeDepense', 'id', 'user', 'dateOperation', 'wording']; // Colonnes avant 'montant'
    return columnsOrder.reduce((acc, colKey) => acc + (columnVisibility[colKey] ? 1 : 0), 0);
  }, [columnVisibility]);

  // Calcul du colspan APRES les colonnes financières (pour fermer la ligne)
  const colspanAfterFinancials = useMemo(() => {
    const columnsOrder = ['status', 'approbation', 'bloquer', 'facture', 'decharger', 'createdAt'];
    return columnsOrder.reduce((acc, colKey) => acc + (columnVisibility[colKey] ? 1 : 0), 0);
  }, [columnVisibility]);


  // Calcul des totaux
  const totals = useMemo(() => {
    if (isLoading || isError) return { totalMontant: 0, totalDecaisse: 0, totalResteAPayer: 0 };
    return depenses.reduce((acc, depense) => {
      const decaisse = depense.Mouvements.reduce((sum, m) => sum + m.montant, 0);
      return {
        totalMontant: acc.totalMontant + depense.montant,
        totalDecaisse: acc.totalDecaisse + decaisse,
        totalResteAPayer: acc.totalResteAPayer + (depense.montant - decaisse)
      };
    }, { totalMontant: 0, totalDecaisse: 0, totalResteAPayer: 0 });
  }, [depenses, isLoading, isError]);

  return (
    <div>
      <div className="container-fluid tw-pb-20">
        <PageHeaderActions indexTitle="Éditions & Rapports" />
        
        {/* Filtres */}
        <div className="tw-my-4 tw-bg-white dark:tw-bg-gray-800 tw-rounded-xl tw-shadow-sm tw-p-4 tw-border tw-border-gray-100">
          <UserAndDateRangeFilter
            companyId={companyId}
            onSearch={handleSearch}
          />
        </div>

        <div className="col-xl-12">
          <div className="card custom-card tw-shadow-sm tw-rounded-xl tw-border-0 tw-overflow-visible"> 
            
            {/* Header de la carte */}
            <div className="card-header tw-bg-white tw-py-4 tw-border-b tw-border-gray-100 tw-flex tw-justify-between tw-items-center tw-flex-wrap tw-gap-3">
              <div className="card-title tw-text-lg tw-font-bold tw-text-gray-800">Rapport Détaillé</div>
              
              <div className="tw-flex tw-items-center tw-gap-2">
                 <ExportToExcelButton tableId="editionsTable" />
                 <ExportToPDFButton tableId="editionsTable" />
                 
                 {/* Menu déroulant Colonnes (React Pur) */}
                 <div className="tw-relative" ref={columnMenuRef}>
                    <button 
                        onClick={() => setShowColumnMenu(!showColumnMenu)}
                        className="btn btn-light btn-sm tw-flex tw-items-center tw-gap-2 tw-bg-white tw-border tw-border-gray-300 hover:tw-bg-gray-50"
                    >
                        <Eye size={14} /> Colonnes <ChevronDown size={12}/>
                    </button>
                    
                    {showColumnMenu && (
                        <div className="tw-absolute tw-right-0 tw-mt-2 tw-w-56 tw-bg-white tw-rounded-lg tw-shadow-xl tw-border tw-border-gray-100 tw-z-50 tw-p-2">
                            <h6 className="tw-px-2 tw-pb-2 tw-mb-2 tw-text-xs tw-font-bold tw-text-gray-500 tw-uppercase tw-border-b tw-border-gray-100">Afficher / Masquer</h6>
                            <div className="tw-max-h-60 tw-overflow-y-auto">
                                {Object.keys(columnVisibility).map((column) => (
                                    <label key={column} className="tw-flex tw-items-center tw-gap-3 tw-px-2 tw-py-1.5 tw-cursor-pointer hover:tw-bg-gray-50 tw-rounded">
                                        <input
                                            type="checkbox"
                                            className="tw-form-checkbox tw-h-4 tw-w-4 tw-text-violet-600 tw-rounded tw-border-gray-300 focus:tw-ring-violet-500"
                                            checked={columnVisibility[column]}
                                            onChange={() => toggleColumnVisibility(column)}
                                        />
                                        <span className="tw-text-sm tw-text-gray-700">{columnLabels[column]}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}
                 </div>
              </div>
            </div>

            <div className="card-body tw-p-0">
              <div className="table-responsive">
                <table className="table tw-w-full tw-text-left tw-border-collapse" id="editionsTable">
                  <thead className="tw-bg-gray-50">
                    <tr>
                      {columnVisibility.typeDepense && <th className="tw-py-1 tw-px-4 tw-text-xs tw-font-semibold tw-text-gray-500 tw-uppercase">Type de depense</th>}
                      {columnVisibility.id && <th className="tw-py-1 tw-px-4 tw-text-xs tw-font-semibold tw-text-gray-500 tw-uppercase">N°</th>}
                      {columnVisibility.user && <th className="tw-py-1 tw-px-4 tw-text-xs tw-font-semibold tw-text-gray-500 tw-uppercase">Auteur</th>}
                      {columnVisibility.dateOperation && <th className="tw-py-1 tw-px-4 tw-text-xs tw-font-semibold tw-text-gray-500 tw-uppercase">Date Op.</th>}
                      {columnVisibility.wording && <th className="tw-py-1 tw-px-4 tw-text-xs tw-font-semibold tw-text-gray-500 tw-uppercase">Libellé</th>}
                      {columnVisibility.montant && <th className="tw-py-1 tw-px-4 tw-text-xs tw-font-semibold tw-text-gray-500 tw-uppercase tw-text-right">Impayé</th>}
                      {columnVisibility.totalDecaisse && <th className="tw-py-1 tw-px-4 tw-text-xs tw-font-semibold tw-text-gray-500 tw-uppercase tw-text-right">Décaissé</th>}
                      {columnVisibility.resteAPayer && <th className="tw-py-1 tw-px-4 tw-text-xs tw-font-semibold tw-text-gray-500 tw-uppercase tw-text-right">Reste</th>}
                      {columnVisibility.status && <th className="tw-py-1 tw-px-4 tw-text-xs tw-font-semibold tw-text-gray-500 tw-uppercase tw-text-center">Statut</th>}
                      {columnVisibility.approbation && <th className="tw-py-1 tw-px-4 tw-text-xs tw-font-semibold tw-text-gray-500 tw-uppercase tw-text-center">Valid.</th>}
                      {columnVisibility.bloquer && <th className="tw-py-1 tw-px-4 tw-text-xs tw-font-semibold tw-text-gray-500 tw-uppercase tw-text-center">Verr.</th>}
                      {columnVisibility.facture && <th className="tw-py-1 tw-px-4 tw-text-xs tw-font-semibold tw-text-gray-500 tw-uppercase tw-text-center">Doc.</th>}
                      {columnVisibility.decharger && <th className="tw-py-1 tw-px-4 tw-text-xs tw-font-semibold tw-text-gray-500 tw-uppercase tw-text-center">Décharge</th>}
                      {columnVisibility.createdAt && <th className="tw-py-1 tw-px-4 tw-text-xs tw-font-semibold tw-text-gray-500 tw-uppercase tw-text-center">Créé le</th>}
                    </tr>
                  </thead>
                  <tbody className="tw-divide-y tw-divide-gray-100">
                    {isLoading && (
                      <tr><td colSpan={visibleColumnCount} className="tw-py-12 tw-text-center"><Loader2 className="tw-w-8 tw-h-8 tw-animate-spin tw-text-violet-600 tw-mx-auto" /></td></tr>
                    )}
                    {isError && (
                      <tr><td colSpan={visibleColumnCount} className="tw-py-12 tw-text-center tw-text-red-500"><ServerCrash className="tw-mx-auto tw-mb-2"/> Erreur de chargement.</td></tr>
                    )}
                    {!isLoading && !isError && depenses.length === 0 && (
                      <tr><td colSpan={visibleColumnCount} className="tw-py-12"><EmptyState message="Aucune donnée trouvée." /></td></tr>
                    )}

                    {!isLoading && !isError && depenses.map((depense, index, arr) => {
                      // Logique de regroupement
                      const isFirstRowOfGroup = index === 0 || arr[index - 1].typeDeDepense.wording !== depense.typeDeDepense.wording;
                      const showGroupedCell = columnVisibility.typeDepense && isFirstRowOfGroup;
                      const rowSpanCount = arr.filter(d => d.typeDeDepense.wording === depense.typeDeDepense.wording).length;
                      
                      const totalDecaisse = depense.Mouvements.reduce((sum, m) => sum + m.montant, 0);
                      const resteAPayer = depense.montant - totalDecaisse;

                      return (
                        <tr key={depense.id} className="hover:tw-bg-gray-50 tw-transition-colors">
                          {showGroupedCell && (
                            <td rowSpan={rowSpanCount} className="tw-py-3 tw-px-4 tw-align-middle tw-text-center tw-bg-gray-50/50 tw-border-r tw-border-gray-100">
                               <span className="tw-text-xs tw-font-bold tw-text-gray-600 tw-uppercase">{depense.typeDeDepense.wording}</span>
                            </td>
                          )}
                          
                          {columnVisibility.typeDepense && !isFirstRowOfGroup ? null : null}

                          {columnVisibility.id && <td className="tw-py-3 tw-px-4 tw-text-sm tw-text-gray-600">#{depense.id}</td>}
                          {columnVisibility.user && <td className="tw-py-3 tw-px-4 tw-text-sm tw-text-gray-700">{depense.user?.fullName}</td>}
                          {columnVisibility.dateOperation && <td className="tw-py-3 tw-px-4 tw-text-sm tw-text-gray-600">{new Date(depense.dateOperation).toLocaleDateString("fr-CA")}</td>}
                          {columnVisibility.wording && <td className="tw-py-3 tw-px-4 tw-text-sm tw-text-gray-800 tw-font-medium">{depense.wording}</td>}
                          {columnVisibility.montant && <td className="tw-py-3 tw-px-4 tw-text-right tw-font-bold tw-text-gray-900">{depense.montant?.toLocaleString()} F</td>}
                          {columnVisibility.totalDecaisse && <td className="tw-py-3 tw-px-4 tw-text-right tw-text-sm tw-text-blue-600 tw-font-semibold">{totalDecaisse.toLocaleString()} F</td>}
                          {columnVisibility.resteAPayer && (
                            <td className={`tw-py-3 tw-px-4 tw-text-right tw-font-bold ${resteAPayer > 0 ? "tw-text-red-600" : "tw-text-green-600"}`}>
                                {resteAPayer.toLocaleString()} F
                            </td>
                          )}
                          {columnVisibility.status && <td className="tw-py-3 tw-px-4 tw-text-center"><StatusBadge status={depense.status} rejeter={depense.rejeter} bloquer={depense.bloquer} type="status"/></td>}
                          {columnVisibility.approbation && <td className="tw-py-3 tw-px-4 tw-text-center"><StatusBadge rejeter={depense.rejeter} type="approbation"/></td>}
                          {columnVisibility.bloquer && (
                            <td className="tw-py-3 tw-px-4 tw-text-center">
                                {depense.bloquer ? <Lock size={14} className="tw-text-gray-400 tw-mx-auto"/> : <Unlock size={14} className="tw-text-green-400 tw-mx-auto"/>}
                            </td>
                          )}
                          {columnVisibility.facture && (
                            <td className="tw-py-3 tw-px-4 tw-text-center">
                              {depense.factureUrl ? (
                                <a href={`${import.meta.env.VITE_BACKEND_URL}/uploads/${depense.factureUrl}`} target="_blank" rel="noopener noreferrer" className="tw-inline-flex tw-p-1.5 tw-rounded-full tw-bg-blue-50 tw-text-blue-600 hover:tw-bg-blue-100">
                                  <FileText size={14} />
                                </a>
                              ) : <span className="tw-text-gray-300">-</span>}
                            </td>
                          )}
                          {columnVisibility.decharger && <td className="tw-py-3 tw-px-4 tw-text-center"><StatusBadge status={depense.decharger} type="decharge"/></td>}
                          {columnVisibility.createdAt && <td className="tw-py-3 tw-px-4 tw-text-center tw-text-xs tw-text-gray-500">{new Date(depense.createdAt).toLocaleDateString("fr-CA")}</td>}
                        </tr>
                      );
                    })}
                  </tbody>
                  
                  {/* PIED DE PAGE : TOTAUX CORRIGÉS */}
                  {!isLoading && !isError && depenses.length > 0 && (
                    <tfoot className="tw-bg-gray-100 tw-border-t-2 tw-border-gray-300">
                        <tr>
                            {/* Colspan calculé dynamiquement pour coller au début */}
                            <td colSpan={colspanBeforeMontant} className="tw-py-3 tw-px-4 tw-text-right tw-font-bold tw-text-gray-700 tw-uppercase tw-text-sm tw-whitespace-nowrap">
                                Total Général :
                            </td>
                            {columnVisibility.montant && <td className="tw-py-3 tw-px-4 tw-text-right tw-font-extrabold tw-text-orange-700 tw-text-base tw-whitespace-nowrap">{totals.totalMontant.toLocaleString()} F</td>}
                            {columnVisibility.totalDecaisse && <td className="tw-py-3 tw-px-4 tw-text-right tw-font-extrabold tw-text-blue-700 tw-text-base tw-whitespace-nowrap">{totals.totalDecaisse.toLocaleString()} F</td>}
                            {columnVisibility.resteAPayer && <td className={`tw-py-3 tw-px-4 tw-text-right tw-font-extrabold tw-text-base tw-whitespace-nowrap ${totals.totalResteAPayer > 0 ? "tw-text-red-700" : "tw-text-green-700"}`}>{totals.totalResteAPayer.toLocaleString()} F</td>}
                            {/* Colspan restant pour remplir la ligne */}
                            <td colSpan={colspanAfterFinancials}></td>
                        </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
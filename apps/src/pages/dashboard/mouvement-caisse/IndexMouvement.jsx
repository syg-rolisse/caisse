import { useState, useCallback, useEffect, Fragment } from "react";
import PropTypes from "prop-types"; // Import pour corriger l'erreur ESLint
import { useQueryClient } from "@tanstack/react-query";
import Spinner from "../../../components/Spinner";
import Pagination from "../../../components/Pagination";
import WelcomeModal from "../../../components/WelcomeModal";
import PageHeaderActions from "../../../components/common/PageHeaderActions";
import CreateSortie from "../../../components/Sortie/CreateSortie";
import DeleteSortie from "../../../components/Sortie/DeleteSortie";
import RejeteDepense from "../../../components/Sortie/RejeteDepense";
import BloquerDepense from "../../../components/Sortie/BloquerDepense";
import { useFetchDepenses } from "../../../hook/api/useFetchDepense";
import { useSocket } from "../../../context/socket.jsx";
import { usePermissions } from "../../../hook/usePermissions";
import EmptyState from "../../../components/EmptyState";
import UserAndDateRangeFilter from "../../../components/UserAndDateRangeFilter";
import {
  ChevronDown,
  ChevronRight,
  ServerCrash,
  CircleDollarSign,
  CheckCircle2,
  XCircle,
  Clock,
  Lock,
  Unlock,
  Banknote,
  Search,
  Edit2,
  Trash2,
  Ban,
  CheckCheck
} from "lucide-react";
import "../../../fade.css";

// Hook de debounce
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// --- COMPOSANT INTERNE : BADGE STATUT (Sorti pour ESLint) ---
const StatusBadge = ({ status, rejeter, bloquer }) => {
  if (rejeter)
    return (
      <span className="tw-inline-flex tw-items-center tw-gap-1 tw-px-2.5 tw-py-0.5 tw-rounded-full tw-text-xs tw-font-semibold tw-bg-red-100 tw-text-red-700 tw-border tw-border-red-200 tw-whitespace-nowrap">
        <XCircle size={12}/> Rejeté
      </span>
    );

  if (bloquer)
    return (
      <span className="tw-inline-flex tw-items-center tw-gap-1 tw-px-2.5 tw-py-0.5 tw-rounded-full tw-text-xs tw-font-semibold tw-bg-gray-100 tw-text-gray-700 tw-border tw-border-gray-200 tw-whitespace-nowrap">
        <Lock size={12}/> Bloqué
      </span>
    );

  if (status)
    return (
      <span className="tw-inline-flex tw-items-center tw-gap-1 tw-px-2.5 tw-py-0.5 tw-rounded-full tw-text-xs tw-font-semibold tw-bg-emerald-100 tw-text-emerald-700 tw-border tw-border-emerald-200 tw-whitespace-nowrap">
        <CheckCircle2 size={12}/> Payé
      </span>
    );

  return (
    <span className="tw-inline-flex tw-items-center tw-gap-1 tw-px-2.5 tw-py-0.5 tw-rounded-full tw-text-xs tw-font-semibold tw-bg-amber-100 tw-text-amber-700 tw-border tw-border-amber-200 tw-whitespace-nowrap">
      <Clock size={12}/> En attente
    </span>
  );
};


// Validation des props pour éviter l'erreur ESLint
StatusBadge.propTypes = {
  status: PropTypes.bool,
  rejeter: PropTypes.bool,
  bloquer: PropTypes.bool,
};

export default function IndexMouvement() {
  const [page, setPage] = useState(1);
  const [perpage, setPerPage] = useState(100);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const [currentDepense, setCurrentDepense] = useState(null);
  const [currentMouvement, setCurrentMouvement] = useState(null);
  const [showCreateSortieModal, setShowCreateSortieModal] = useState(false);
  const [showDeleteSortieModal, setShowDeleteSortieModal] = useState(false);
  const [showRejeteModal, setShowRejeteModal] = useState(false);
  const [showBloquerModal, setShowBloquerModal] = useState(false);
  const [expandedRows, setExpandedRows] = useState({});

  const socket = useSocket();
  const { can } = usePermissions();
  const queryClient = useQueryClient();
  const user = JSON.parse(localStorage.getItem("user"));
  const companyId = user?.company?.id;

  const initialFilters = {
    dateDebut: '',
    dateFin: '',
    userId: null,
    typeDeDepenseId: null,
    by: null,
  };

  const [filters, setFilters] = useState(initialFilters);

  const { data, isLoading, isError, error } = useFetchDepenses({
    page,
    perpage,
    companyId,
    userId: filters.userId,
    dateDebut: filters.dateDebut,
    dateFin: filters.dateFin,
    typeDeDepenseId: filters.typeDeDepenseId,
    by: filters.by,
    keyword: debouncedSearchTerm,
  });

  const handleSearch = useCallback((newFilters) => {
    setFilters(newFilters);
    setPage(1);
  }, []);

  const depenses = data?.depenses?.data || [];
  const meta = data?.depenses?.meta || { total: 0, currentPage: 1, lastPage: 1 };

  const handleSuccess = useCallback(() => {
    setShowCreateSortieModal(false);
    setShowDeleteSortieModal(false);
    setShowRejeteModal(false);
    setShowBloquerModal(false);
    setCurrentDepense(null);
    setCurrentMouvement(null);
    queryClient.invalidateQueries(["depenses"]);
  }, [queryClient]);

  useEffect(() => {
    if (!socket || !companyId) return;
    socket.emit("join_company_room", companyId);
    const handleDataUpdate = () => queryClient.invalidateQueries(["depenses"]);
    socket.on("depense_created", handleDataUpdate);
    socket.on("depense_updated", handleDataUpdate);
    socket.on("depense_deleted", handleDataUpdate);
    return () => {
      socket.off("depense_created", handleDataUpdate);
      socket.off("depense_updated", handleDataUpdate);
      socket.off("depense_deleted", handleDataUpdate);
    };
  }, [socket, companyId, queryClient]);

  const handlePerPageChange = (e) => {
    setPerPage(Number(e.target.value));
    setPage(1);
  };

  const toggleRow = (depenseId) => {
    setExpandedRows((prev) => ({ ...prev, [depenseId]: !prev[depenseId] }));
  };

  const hasAnyActionPermission = can("payeDepense") || can("rejectDepense") || can("bloqueDepense");

  return (
    <div>
      {/* Modales */}
      <WelcomeModal isActive={showCreateSortieModal} onClose={handleSuccess}>
        <CreateSortie depense={currentDepense} mouvement={currentMouvement} onSuccess={handleSuccess} onClose={handleSuccess} />
      </WelcomeModal>
      <WelcomeModal isActive={showDeleteSortieModal} onClose={handleSuccess}>
        <DeleteSortie sortie={currentMouvement} onSuccess={handleSuccess} onClose={handleSuccess} />
      </WelcomeModal>
      <WelcomeModal isActive={showRejeteModal} onClose={handleSuccess}>
        <RejeteDepense depense={currentDepense} onSuccess={handleSuccess} onClose={handleSuccess} />
      </WelcomeModal>
      <WelcomeModal isActive={showBloquerModal} onClose={handleSuccess}>
        <BloquerDepense depense={currentDepense} onSuccess={handleSuccess} onClose={handleSuccess} />
      </WelcomeModal>

      <div className="container-fluid tw-pb-20">
        <PageHeaderActions indexTitle="Gestion des Mouvements / Dépenses" />
        
        <div className="tw-my-4 tw-bg-white dark:tw-bg-gray-800 tw-rounded-xl tw-shadow-sm tw-p-4 tw-border tw-border-gray-100">
          <UserAndDateRangeFilter companyId={companyId} onSearch={handleSearch} />
        </div>

        <div className="col-xl-12">
          <div className="card custom-card tw-shadow-sm tw-rounded-xl tw-border-0 tw-overflow-hidden">
            <div className="card-header justify-content-between tw-bg-white tw-py-4 tw-border-b tw-border-gray-100">
              <div className="card-title tw-text-lg tw-font-bold tw-text-gray-800">Liste des Dépenses</div>
            </div>
            
            <div className="card-body tw-p-0">
              <div className="d-sm-flex tw-p-4 tw-bg-gray-50/50 justify-content-between tw-border-b tw-border-gray-100">
                <div className="tw-flex tw-items-center tw-gap-2">
                  <span className="tw-text-sm tw-font-medium tw-text-gray-600">Afficher</span>
                  <select
                    className="form-select form-select-sm tw-h-9 tw-text-sm tw-border-gray-300 tw-rounded-lg"
                    onChange={handlePerPageChange}
                    value={perpage}
                  >
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                  </select>
                </div>
                <div className="tw-relative tw-w-full md:tw-w-72 mt-2 mt-sm-0">
                  <Search className="tw-absolute tw-left-3 tw-top-1/2 -tw-translate-y-1/2 tw-text-gray-400" size={16} />
                  <input
                    className="form-control form-control-sm tw-pl-9 tw-rounded-lg tw-border-gray-300"
                    type="text"
                    placeholder="Rechercher..."
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setPage(1);
                    }}
                  />
                </div>
              </div>

              <div className="table-responsive">
                <table className="table tw-w-full tw-text-left tw-border-collapse">
                  <thead className="tw-bg-gray-50">
                    <tr>
                      <th className="tw-py-3 tw-px-4 tw-text-xs tw-font-semibold tw-text-gray-500 tw-uppercase tw-tracking-wider tw-w-10"></th>
                      <th className="tw-py-3 tw-px-4 tw-text-xs tw-font-semibold tw-text-gray-500 tw-uppercase tw-tracking-wider">Détails Dépense</th>
                      <th className="tw-py-3 tw-px-4 tw-text-xs tw-font-semibold tw-text-gray-500 tw-uppercase tw-tracking-wider tw-text-right">Montant</th>
                      <th className="tw-py-3 tw-px-4 tw-text-xs tw-font-semibold tw-text-gray-500 tw-uppercase tw-tracking-wider">Auteur</th>
                      <th className="tw-py-3 tw-px-4 tw-text-xs tw-font-semibold tw-text-gray-500 tw-uppercase tw-tracking-wider tw-text-center">Statut</th>
                      <th className="tw-py-3 tw-px-4 tw-text-xs tw-font-semibold tw-text-gray-500 tw-uppercase tw-tracking-wider tw-text-center">Mouvements</th>
                      {hasAnyActionPermission && (
                        <th className="tw-py-3 tw-px-4 tw-text-xs tw-font-semibold tw-text-gray-500 tw-uppercase tw-tracking-wider tw-text-right">Actions</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="tw-divide-y tw-divide-gray-100">
                    {isLoading && (
                      <tr><td colSpan="7" className="tw-py-12 tw-text-center"><Spinner /></td></tr>
                    )}
                    {isError && (
                      <tr>
                        <td colSpan="7" className="tw-py-12 tw-text-center tw-text-red-500">
                          <div className="tw-flex tw-flex-col tw-items-center tw-gap-2">
                            <ServerCrash size={24} />
                            <span>{error?.message || "Erreur de chargement."}</span>
                          </div>
                        </td>
                      </tr>
                    )}
                    {!isLoading && !isError && depenses.length === 0 && (
                      <tr><td colSpan="7" className="tw-py-12"><EmptyState message="Aucune dépense trouvée" /></td></tr>
                    )}

                    {!isLoading && !isError && depenses.map((depense) => (
                      <Fragment key={depense.id}>
                        <tr className={`tw-transition-colors hover:tw-bg-gray-50 ${expandedRows[depense.id] ? 'tw-bg-gray-50/80' : ''}`}>
                          <td className="tw-py-3 tw-px-4">
                            <div className="tw-w-8 tw-h-8 tw-rounded-full tw-bg-indigo-50 tw-flex tw-items-center tw-justify-center">
                              <CircleDollarSign size={16} className="tw-text-indigo-600" />
                            </div>
                          </td>
                          <td className="tw-py-3 tw-px-4">
                            <div className="tw-flex tw-flex-col">
                              <span className="tw-font-medium tw-text-gray-900 tw-text-sm">{depense.wording}</span>
                              <div className="tw-flex tw-items-center tw-gap-2 tw-mt-1">
                                <span className="tw-text-[10px] tw-tracking-wide tw-text-gray-500 tw-bg-gray-100 tw-px-2 tw-py-0.5 tw-rounded-full">
                                  {depense.typeDeDepense?.wording}
                                </span>
                                {depense.decharger && (
                                  <span className="tw-text-[10px] tw-tracking-wide tw-text-blue-600 tw-bg-blue-50 tw-px-2 tw-py-0.5 tw-rounded-full">
                                    Déchargé
                                  </span>
                                )}
                                {depense.rejeter ? (
                                  <span className="tw-text-[10px] tw-tracking-wide tw-text-red-600 tw-bg-red-50 tw-px-2 tw-py-0.5 tw-rounded-full">
                                    Rejeté
                                  </span>
                                ) : 
                                <span className="tw-text-[10px] tw-tracking-wide tw-text-green-600 tw-bg-green-50 tw-px-2 tw-py-0.5 tw-rounded-full">
                                  <CheckCheck size={14} />
                                </span>}
                              </div>
                            </div>
                          </td>
                          <td className="tw-py-3 tw-px-4 tw-text-right">
                             <span className="tw-font-bold tw-text-gray-900">{depense.montant.toLocaleString()} F</span>
                          </td>
                          <td className="tw-py-3 tw-px-4">
                            <div className="tw-flex tw-items-center tw-gap-2 tw-text-xs tw-text-gray-500">
                                {/* <User size={14} /> */} {depense.user?.fullName}
                            </div>
                          </td>
                          <td className="tw-py-3 tw-px-4 tw-text-center">
                            <StatusBadge status={depense.status} rejeter={depense.rejeter} bloquer={depense.bloquer} />
                          </td>
                          <td className="tw-py-3 tw-px-4 tw-text-center">
                             {depense.Mouvements.length > 0 ? (
                                <button onClick={() => toggleRow(depense.id)} className="tw-inline-flex tw-items-center tw-gap-1 tw-text-xs tw-font-medium tw-text-indigo-600 hover:tw-text-indigo-800 tw-transition-colors">
                                    {expandedRows[depense.id] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                    {depense.Mouvements.length} Paiement(s)
                                </button>
                             ) : (
                                <span className="tw-text-xs tw-text-gray-400 tw-italic">Aucun</span>
                             )}
                          </td>
                          {hasAnyActionPermission && (
                            <td className="tw-py-3 tw-px-4 tw-text-right">
                              <div className="tw-flex tw-justify-end tw-gap-2">
                                
                                {/* BOUTON PAYER */}
                                {can("payeDepense") && !depense.status && !depense.bloquer && !depense.rejeter && (
                                  <button 
                                    onClick={() => { setCurrentDepense(depense); setCurrentMouvement(null); setShowCreateSortieModal(true); }} 
                                    className="tw-flex tw-items-center tw-gap-1.5 tw-px-2.5 tw-py-1.5 tw-rounded-md tw-bg-emerald-50 tw-text-emerald-700 hover:tw-bg-emerald-100 tw-border tw-border-emerald-200 tw-transition-colors tw-text-xs tw-font-semibold"
                                    title="Effectuer un paiement"
                                  >
                                    <Banknote size={14} />
                                    <span>Payer</span>
                                  </button>
                                )}

                                {/* BOUTON REJETER / ANNULER */}
                                {can("rejectDepense") && !depense.status && (
                                  <button 
                                    onClick={() => { setCurrentDepense(depense); setShowRejeteModal(true); }} 
                                    className={`tw-flex tw-items-center tw-gap-1.5 tw-px-2.5 tw-py-1.5 tw-rounded-md tw-transition-colors tw-text-xs tw-font-semibold tw-border
                                        ${depense.rejeter 
                                            ? "tw-bg-amber-50 tw-text-amber-700 tw-border-amber-200 hover:tw-bg-amber-100" 
                                            : "tw-bg-rose-50 tw-text-rose-700 tw-border-rose-200 hover:tw-bg-rose-100"
                                        }`}
                                    title={depense.rejeter ? "Annuler le rejet" : "Rejeter la dépense"}
                                  >
                                     {depense.rejeter ? <CheckCircle2 size={14} /> : <Ban size={14} />}
                                     <span>{depense.rejeter ? "Rétablir" : "Rejeter"}</span>
                                  </button>
                                )}

                                {/* BOUTON BLOQUER / DÉBLOQUER */}
                                {can("bloqueDepense") && (
                                  <button 
                                    onClick={() => { setCurrentDepense(depense); setShowBloquerModal(true); }} 
                                    className={`tw-flex tw-items-center tw-gap-1.5 tw-px-2.5 tw-py-1.5 tw-rounded-md tw-transition-colors tw-text-xs tw-font-semibold tw-border
                                        ${depense.bloquer 
                                            ? "tw-bg-indigo-50 tw-text-indigo-700 tw-border-indigo-200 hover:tw-bg-indigo-100" 
                                            : "tw-bg-slate-50 tw-text-slate-700 tw-border-slate-200 hover:tw-bg-slate-100"
                                        }`}
                                    title={depense.bloquer ? "Débloquer" : "Bloquer pour modification"}
                                  >
                                     {depense.bloquer ? <Unlock size={14} /> : <Lock size={14} />}
                                     {/* <span>{depense.bloquer ? "Débloquer" : "Bloquer"}</span> */}
                                  </button>
                                )}
                              </div>
                            </td>
                          )}
                        </tr>

                        {/* ROW DETAILS EXPANSION (Mouvements) */}
                        {expandedRows[depense.id] && (
                            <tr className="tw-bg-gray-50/50">
                                <td colSpan={7} className="tw-p-0 tw-border-b tw-border-gray-200">
                                    <div className="tw-p-4 tw-pl-14">
                                        <div className="tw-bg-white tw-rounded-lg tw-border tw-border-gray-100 tw-shadow-sm tw-overflow-hidden">
                                            <table className="tw-w-full tw-text-xs">
                                                <thead className="tw-bg-gray-50 tw-text-gray-500">
                                                    <tr>
                                                        <th className="tw-py-2 tw-px-4 tw-font-medium">Date</th>
                                                        <th className="tw-py-2 tw-px-4 tw-font-medium">Auteur</th>
                                                        <th className="tw-py-2 tw-px-4 tw-font-medium tw-text-right">Montant</th>
                                                        <th className="tw-py-2 tw-px-4 tw-font-medium tw-text-right">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="tw-divide-y tw-divide-gray-50">
                                                    {depense.Mouvements.map((mvt) => (
                                                        <tr key={mvt.id} className="hover:tw-bg-gray-50">
                                                            <td className="tw-py-2 tw-px-4 tw-text-gray-600">
                                                                <div className="tw-flex tw-items-center tw-gap-1.5">
                                                                    <Clock size={12} className="tw-text-gray-400"/>
                                                                    {new Date(mvt.createdAt).toLocaleDateString('fr-FR')}
                                                                </div>
                                                            </td>
                                                            <td className="tw-py-2 tw-px-4 tw-text-gray-600">{mvt.user?.fullName}</td>
                                                            <td className="tw-py-2 tw-px-4 tw-text-right tw-font-bold tw-text-gray-800">
                                                                {mvt.montant.toLocaleString()} F
                                                            </td>
                                                            <td className="tw-py-2 tw-px-4 tw-text-right">
                                                                {can("payeDepense") && !depense.bloquer && !depense.rejeter && (
                                                                    <div className="tw-flex tw-justify-end tw-gap-2">
                                                                        <button onClick={() => { setCurrentDepense(depense); setCurrentMouvement(mvt); setShowCreateSortieModal(true); }} className="tw-p-1 hover:tw-bg-indigo-50 tw-rounded tw-text-indigo-600 tw-transition-colors" title="Modifier le montant"><Edit2 size={14}/></button>
                                                                        <button onClick={() => { setCurrentMouvement(mvt); setShowDeleteSortieModal(true); }} className="tw-p-1 hover:tw-bg-red-50 tw-rounded tw-text-red-600 tw-transition-colors" title="Supprimer le paiement"><Trash2 size={14}/></button>
                                                                    </div>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        )}
                      </Fragment>
                    ))}
                  </tbody>
                </table>
              </div>

              {meta && (
                <div className="card-footer tw-border-t tw-border-gray-100 tw-p-4">
                  <Pagination meta={meta} onPageChange={setPage} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
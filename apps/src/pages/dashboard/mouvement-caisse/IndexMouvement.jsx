import { useEffect, useState, useContext, Fragment } from "react";
import Spinner from "../../../components/Spinner";
import Pagination from "../../../components/Pagination";
import WelcomeModal from "../../../components/WelcomeModal";
import PageHeaderActions from "../../../components/common/PageHeaderActions";
import { useFetchMouvement } from "../../../hook/api/useFetchMouvement";
import { SocketContext } from "../../../context/socket";
import CreateSortie from "../../../components/Sortie/CreateSortie";
import DeleteSortie from "../../../components/Sortie/DeleteSortie";
import RejeteDepense from "../../../components/Sortie/RejeteDepense";
import BloquerDepense from "../../../components/Sortie/BloquerDepense";
import "../../../fade.css";
import { ChevronDown, ChevronRight } from "lucide-react";

function IndexMouvement() {
  const [depenses, setDepenses] = useState([]);
  const [allDepenses, setAllDepenses] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [perpage, setPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");

  const [currentDepense, setCurrentDepense] = useState(null);
  const [currentMouvement, setCurrentMouvement] = useState(null); // Pour modifier/supprimer un mouvement spécifique
  const [showCreateSortieModal, setShowCreateSortieModal] = useState(false);
  const [showDeleteSortieModal, setShowDeleteSortieModal] = useState(false);
  const [showRejeteModal, setShowRejeteModal] = useState(false);
  const [showBloquerModal, setShowBloquerModal] = useState(false);

  const [expandedRows, setExpandedRows] = useState({});

  const user = JSON.parse(localStorage.getItem("user"));
  const socket = useContext(SocketContext);

  const { fetchMouvement, isLoading, isError, error, data } = useFetchMouvement();

  useEffect(() => {
    fetchMouvement({ page, perpage });
  }, [fetchMouvement, page, perpage]);

  useEffect(() => {
    if (data && data.depenses) {
      setDepenses(data.depenses.data);
      setAllDepenses(data.allDepenses || []);
      setMeta(data.depenses.meta);
    }
  }, [data]);

  useEffect(() => {
    if (!socket || !user?.company?.id) return;
    socket.emit("join_company_room", user.company.id);

    const handleDataUpdate = (socketData, action) => {
      if (socketData.companyId !== user.company.id) return;
      const newDepensesPaginated = socketData.depenses;
      const newAllDepenses = socketData.allDepenses;
      if (!newDepensesPaginated?.data) return;

      if (action !== "deleted" && newDepensesPaginated.data[0]) {
        newDepensesPaginated.data[0].isNew = true;
      }
      setDepenses(newDepensesPaginated.data);
      setAllDepenses(newAllDepenses);
      setMeta(newDepensesPaginated.meta);

      if (action !== "deleted") {
        setTimeout(() => {
          setDepenses((list) => list.map((item, i) => (i === 0 ? { ...item, isNew: false } : item)));
        }, 700);
      }
    };

    socket.on("depense_created", (d) => handleDataUpdate(d, "created"));
    socket.on("depense_updated", (d) => handleDataUpdate(d, "updated"));
    socket.on("depense_deleted", (d) => handleDataUpdate(d, "deleted"));

    return () => {
      socket.off("depense_created");
      socket.off("depense_updated");
      socket.off("depense_deleted");
    };
  }, [socket, user?.company.id, page, perpage]);

  const handleSuccess = () => {
    setShowCreateSortieModal(false);
    setShowDeleteSortieModal(false);
    setShowRejeteModal(false);
    setShowBloquerModal(false);
    setCurrentDepense(null);
    setCurrentMouvement(null);
  };

  const handlePerPageChange = (e) => {
    setPerPage(Number(e.target.value));
    setPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const toggleRow = (depenseId) => {
    setExpandedRows(prev => ({ ...prev, [depenseId]: !prev[depenseId] }));
  };

  const filteredDepenses =
    searchTerm.trim() === ""
      ? depenses
      : allDepenses.filter((item) => {
          const term = searchTerm.toLowerCase();
          return (
            item.wording?.toLowerCase().includes(term) ||
            item.typeDeDepense?.wording?.toLowerCase().includes(term) ||
            item.user?.fullName?.toLowerCase().includes(term)
          );
        });

  return (
    <div>
      {/* Modals */}
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

      <div className="container-fluid">
        <PageHeaderActions indexTitle="Gestion des Sorties / Dépenses" />

        <div className="col-xl-12">
          <div className="card custom-card">
            <div className="card-header justify-content-between">
              <div className="card-title">Liste des Dépenses</div>
            </div>
            <div className="card-body card-border tw-rounded-md tw-m-5">
              <div className="d-sm-flex mb-4 justify-content-between">
                <div className="tw-flex tw-items-center tw-gap-2">
                  <span>Voir</span>
                  <select className="form-select form-select-sm tw-h-10" onChange={handlePerPageChange} value={perpage}>
                    <option value="5">5</option><option value="10">10</option><option value="25">25</option><option value="50">50</option>
                  </select>
                </div>
                <div className="d-flex gap-2 mt-sm-0 tw-w-full">
                  <div className="tw-w-full max-sm:tw-mt-2 tw-ml-3">
                    <input className="form-control form-control-xl" type="text" placeholder="Rechercher ici..." value={searchTerm} onChange={handleSearchChange} />
                  </div>
                </div>
              </div>
              <div className="table-responsive">
                <table className="customTable table table-bordered text-nowrap mb-0">
                  <thead>
                    <tr>
                      <th className="fw-bold">Intitulé</th>
                      <th className="fw-bold tw-text-center">Montant Total</th>
                      <th className="fw-bold">Saisi par</th>
                      <th className="fw-bold tw-text-center">Statut</th>
                      <th className="fw-bold tw-text-center">Mouvements</th>
                      <th className="fw-bold tw-text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading && (<tr><td colSpan="6" className="text-center py-5"><Spinner /></td></tr>)}
                    {isError && (<tr><td colSpan="6" className="text-center"><span className="tw-text-red-500">Erreur: {error?.message}</span></td></tr>)}
                    {!isLoading && !isError && filteredDepenses.length === 0 && (<tr><td colSpan="6" className="text-center"><span className="tw-text-gray-500">Aucune dépense trouvée</span></td></tr>)}
                    {!isLoading && !isError && filteredDepenses.map((depense) => (
                      <Fragment key={depense.id}>
                        <tr className={`${depense.isNew ? "fade-in-row" : ""} ${depense.bloquer ? 'tw-bg-gray-100' : ''} ${depense.rejeter ? 'tw-bg-red-50' : ''}`}>
                          <td>
                            <div>{depense.wording}</div>
                            <div className="tw-text-xs tw-text-gray-500">{depense.typeDeDepense?.wording}</div>
                          </td>
                          <td className="tw-text-center tw-font-semibold">{depense.montant.toLocaleString()} F</td>
                          <td>{depense.user?.fullName}</td>
                          <td className="tw-text-center">
                            <span className={`badge ${depense.status ? "bg-success-transparent" : "bg-warning-transparent"}`}>{depense.status ? "Payé" : "En attente"}</span>
                            {depense.rejeter && <span className="badge bg-danger-transparent ms-1">Rejeté</span>}
                            {depense.bloquer && <span className="badge bg-dark-transparent ms-1">Bloqué</span>}
                          </td>
                          <td className="tw-text-center">
                            {depense.Mouvements.length > 0 ? (
                              <button onClick={() => toggleRow(depense.id)} className="btn btn-sm btn-light d-flex align-items-center mx-auto">
                                {expandedRows[depense.id] ? <ChevronDown size={16} className="me-1" /> : <ChevronRight size={16} className="me-1" />}
                                {depense.Mouvements.length} Paiement(s)
                              </button>
                            ) : (
                              <span className="badge bg-gray-200 text-gray-600">Aucun</span>
                            )}
                          </td>
                          <td>
                            <div className="d-flex justify-content-center align-items-center">
                              <button onClick={() => { setCurrentDepense(depense); setCurrentMouvement(null); setShowCreateSortieModal(true); }} className="btn btn-sm btn-primary-transparent d-flex align-items-center" title="Payer / Gérer les paiements" disabled={depense.status || depense.bloquer || depense.rejeter}>
                                <i className="ri-hand-coin-line tw-mr-1"></i>Payer
                              </button>
                              <button onClick={() => { setCurrentDepense(depense); setShowRejeteModal(true); }} className="btn btn-sm tw-ml-2 btn-warning-transparent d-flex align-items-center" title={depense.rejeter ? "Annuler le rejet" : "Rejeter la dépense"} disabled={depense.status}>
                                <i className="ri-close-circle-line tw-mr-1"></i>{depense.rejeter ? "Annuler" : "Rejeter"}
                              </button>
                              <button onClick={() => { setCurrentDepense(depense); setShowBloquerModal(true); }} className="btn btn-sm tw-ml-2 btn-dark-transparent d-flex align-items-center" title={depense.bloquer ? "Débloquer la dépense" : "Bloquer la dépense"}>
                                <i className={`ri-${depense.bloquer ? 'lock-unlock' : 'lock'}-line tw-mr-1`}></i>{depense.bloquer ? "Débloquer" : "Bloquer"}
                              </button>
                            </div>
                          </td>
                        </tr>
                        {expandedRows[depense.id] && (
                           <tr>
                            <td colSpan="6" className="p-0" style={{ backgroundColor: '#fafafa', borderBottom: '2px solid #dee2e6' }}>
                              <div className="tw-p-4">
                                <h6 className="tw-font-semibold tw-mb-3">Détails des Paiements</h6>
                                <table className="table table-sm mb-0">
                                  <tbody>
                                    {depense.Mouvements.map(mouvement => (
                                      <tr key={mouvement.id}>
                                        <td className="tw-font-medium">{mouvement.montant.toLocaleString()} F</td>
                                        <td><p className="tw-text-xs tw-text-gray-500 mb-0">Payé par {mouvement.user?.fullName}</p></td>
                                        <td><p className="tw-text-xs tw-text-gray-500 mb-0">Le {new Date(mouvement.createdAt).toLocaleString('fr-FR')}</p></td>
                                        <td className="text-end">
                                          <button onClick={() => { setCurrentDepense(depense); setCurrentMouvement(mouvement); setShowCreateSortieModal(true); }} className="btn btn-icon btn-sm btn-primary-transparent" title="Modifier ce paiement">
                                            <i className="ri-edit-line"></i>
                                          </button>
                                          <button onClick={() => { setCurrentMouvement(mouvement); setShowDeleteSortieModal(true); }} className="btn btn-icon btn-sm btn-danger-transparent ms-2" title="Supprimer ce paiement">
                                            <i className="ri-delete-bin-line"></i>
                                          </button>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
              {meta && meta.total > perpage && searchTerm.trim() === "" && (
                <div className="card-footer"><Pagination meta={meta} onPageChange={setPage} /></div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default IndexMouvement;
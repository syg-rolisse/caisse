import { useEffect, useState, useContext } from "react";
import Spinner from "../../../components/Spinner";
import Pagination from "../../../components/Pagination";
import WelcomeModal from "../../../components/WelcomeModal";
import PageHeaderActions from "../../../components/common/PageHeaderActions";
import { useFetchDepense } from "../../../hook/api/useFetchDepense";
import { SocketContext } from "../../../context/socket";
import CreateSortie from "../../../components/Sortie/CreateSortie";
import DeleteSortie from "../../../components/Sortie/DeleteSortie";
import RejeteDepense from "../../../components/Sortie/RejeteDepense";
import BloquerDepense from "../../../components/Sortie/BloquerDepense";
import "../../../fade.css";

function IndexMouvement() {
  const [depenses, setDepenses] = useState([]);
  const [allDepenses, setAllDepenses] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [perpage, setPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");

  const [currentSortie, setCurrentSortie] = useState(null);
  const [showCreateSortieModal, setShowCreateSortieModal] = useState(false);
  const [showDeleteSortieModal, setShowDeleteSortieModal] = useState(false);
  const [showRejeteModal, setShowRejeteModal] = useState(false);
  const [showBloquerModal, setShowBloquerModal] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));
  const socket = useContext(SocketContext);

  const { fetchDepense, isLoading, isError, error, data } = useFetchDepense();

  useEffect(() => {
    fetchDepense({ page, perpage });
  }, [fetchDepense, page, perpage]);

  useEffect(() => {
    console.log(data);
    
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
      const newSortiesPaginated = socketData.depenses;
      const newAllSorties = socketData.allDepenses;
      if (!newSortiesPaginated?.data) return;

      if (action !== "deleted" && newSortiesPaginated.data[0]) {
        newSortiesPaginated.data[0].isNew = true;
      }
      setDepenses(newSortiesPaginated.data);
      setAllDepenses(newAllSorties);
      setMeta(newSortiesPaginated.meta);

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
    setCurrentSortie(null);
  };

  const handlePerPageChange = (e) => {
    setPerPage(Number(e.target.value));
    setPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
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
      <WelcomeModal isActive={showCreateSortieModal} onClose={handleSuccess}>
        <CreateSortie sortie={currentSortie} onSuccess={handleSuccess} onClose={handleSuccess} />
      </WelcomeModal>
      <WelcomeModal isActive={showDeleteSortieModal} onClose={handleSuccess}>
        <DeleteSortie sortie={currentSortie} onSuccess={handleSuccess} onClose={handleSuccess} />
      </WelcomeModal>
      <WelcomeModal isActive={showRejeteModal} onClose={handleSuccess}>
        <RejeteDepense depense={currentSortie} onSuccess={handleSuccess} onClose={handleSuccess} />
      </WelcomeModal>
      <WelcomeModal isActive={showBloquerModal} onClose={handleSuccess}>
        <BloquerDepense depense={currentSortie} onSuccess={handleSuccess} onClose={handleSuccess} />
      </WelcomeModal>

      <div className="container-fluid">
        <PageHeaderActions
          indexTitle="Gestion des Sorties / Dépenses"
          primaryActionLabel="Créer une sortie de caisse"
          onPrimaryActionClick={() => { setCurrentSortie(null); setShowCreateSortieModal(true); }}
        />

        <div className="col-xl-12">
          <div className="card custom-card">
            <div className="card-header justify-content-between">
              <div className="card-title">Liste des sorties de caisse</div>
            </div>
            <div className="card-body card-border tw-rounded-md tw-m-5">
              <div className="d-sm-flex mb-4 justify-content-between">
                <div className="tw-flex tw-items-center tw-gap-2">
                  <span>Voir</span>
                  <select
                    className="form-select form-select-sm tw-h-10"
                    onChange={handlePerPageChange}
                    value={perpage}
                  >
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                  </select>
                </div>
                <div className="d-flex gap-2 mt-sm-0 tw-w-full">
                  <div className="tw-w-full max-sm:tw-mt-2 tw-ml-3">
                    <input
                      className="form-control form-control-xl"
                      type="text"
                      placeholder="Rechercher ici..."
                      value={searchTerm}
                      onChange={handleSearchChange}
                    />
                  </div>
                </div>
              </div>
              <div className="table-responsive">
                <table className="customTable table table-bordered text-nowrap mb-0">
                  <thead>
                    <tr>
                      <th className="wd-5p tx-center fw-bold"></th>
                      <th className="wd-5p tw-text-center fw-bold">N°</th>
                      <th className="fw-bold">Intitulé</th>
                      <th className="fw-bold">Type</th>
                      <th className="fw-bold tw-text-center">Montant</th>
                      <th className="fw-bold tw-text-center">Mouvements</th>
                      <th className="fw-bold">Saisi par</th>
                      <th className="fw-bold tw-text-center">Statut</th>
                      <th className="fw-bold tw-text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading && (
                      <tr><td colSpan="9" className="text-center py-5"><Spinner /></td></tr>
                    )}
                    {isError && (
                      <tr><td colSpan="9" className="text-center"><span className="tw-text-red-500">Erreur: {error?.message}</span></td></tr>
                    )}
                    {!isLoading && !isError && filteredDepenses.length === 0 && (
                      <tr><td colSpan="9" className="text-center"><span className="tw-text-gray-500">Aucune donnée disponible</span></td></tr>
                    )}
                    {!isLoading && !isError && filteredDepenses.map((depense) => (
                      <tr key={depense.id} className={depense.isNew ? "fade-in-row" : ""}>
                        <td align="center">
                          <span className="avatar avatar-sm rounded-full shadow-lg">
                            <img src={`/assets/images/users/male/${(depense.id % 9) + 1}.jpg`} alt="img" />
                          </span>
                        </td>
                        <td align="center"><span className="tag tag-orange">{depense.id}</span></td>
                        <td>{depense.wording}</td>
                        <td><span className="badge bg-primary-transparent">{depense.typeDeDepense?.wording}</span></td>
                        <td className="tw-text-center tw-font-semibold">{depense.montant.toLocaleString()} F</td>
                        <td align="center">
                          {depense.Mouvements.length > 0 ? (
                            <span className="badge bg-success-transparent">{depense.Mouvements.length}</span>
                          ) : (
                            <span className="badge bg-warning-transparent">En attente</span>
                          )}
                        </td>
                        <td>{depense.user?.fullName}</td>
                        <td className="tw-text-center">
                          <span className={`badge ${depense.status ? "bg-success-transparent" : "bg-danger-transparent"}`}>
                            {depense.status ? "Payé" : "Impayé"}
                          </span>
                          {depense.rejeter && <span className="badge bg-danger-transparent ms-1">Rejeté</span>}
                          {depense.bloquer && <span className="badge bg-dark-transparent ms-1">Bloqué</span>}
                        </td>
                        <td>
                          <div className="d-flex justify-content-center align-items-center">
                            <button onClick={() => { setCurrentSortie(depense); setShowCreateSortieModal(true); }} className="btn btn-icon btn-sm btn-info-transparent" title="Gérer les mouvements (paiements)">
                              <i className="ri-hand-coin-line"></i>
                            </button>
                            <button onClick={() => { setCurrentSortie(depense); setShowRejeteModal(true); }} className="btn btn-icon btn-sm btn-warning-transparent ms-2" title={depense.rejeter ? "Annuler le rejet" : "Rejeter la dépense"}>
                              <i className="ri-close-circle-line"></i>
                            </button>
                            <button onClick={() => { setCurrentSortie(depense); setShowBloquerModal(true); }} className="btn btn-icon btn-sm btn-dark-transparent ms-2" title={depense.bloquer ? "Débloquer" : "Bloquer la dépense"}>
                              <i className={`ri-${depense.bloquer ? 'lock-unlock' : 'lock'}-line`}></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {meta && meta.total > perpage && searchTerm.trim() === "" && (
                <div className="card-footer">
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

export default IndexMouvement;
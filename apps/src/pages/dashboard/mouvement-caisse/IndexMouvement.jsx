import { useState, useMemo, useCallback, useEffect, Fragment } from "react";
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
import {
  ChevronDown,
  ChevronRight,
  ServerCrash,
  CircleDollarSign,
  CheckCheck,
  X,
} from "lucide-react";
import "../../../fade.css";

export default function IndexMouvement() {
  const [page, setPage] = useState(1);
  const [perpage, setPerPage] = useState(100);
  const [searchTerm, setSearchTerm] = useState("");
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

  const { data, isLoading, isError, error } = useFetchDepenses({
    page,
    perpage,
    companyId,
  });

  const depenses = data?.depenses?.data || [];
  const allDepenses = data?.allDepenses || [];
  const meta = data?.depenses?.meta || {
    total: 0,
    currentPage: 1,
    lastPage: 1,
  };

  const filteredDepenses = useMemo(() => {
    if (searchTerm.trim() === "") {
      return depenses;
    }
    return allDepenses.filter((item) => {
      const term = searchTerm.toLowerCase();
      return (
        item.wording?.toLowerCase().includes(term) ||
        item.typeDeDepense?.wording?.toLowerCase().includes(term) ||
        item.user?.fullName?.toLowerCase().includes(term)
      );
    });
  }, [depenses, allDepenses, searchTerm]);

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

    const handleDataUpdate = () => {
      queryClient.invalidateQueries(["depenses"]);
    };

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

  const hasAnyActionPermission =
    can("payeDepense") || can("rejectDepense") || can("bloqueDepense");

  return (
    <div>
      <WelcomeModal isActive={showCreateSortieModal} onClose={handleSuccess}>
        <CreateSortie
          depense={currentDepense}
          mouvement={currentMouvement}
          onSuccess={handleSuccess}
          onClose={handleSuccess}
        />
      </WelcomeModal>
      <WelcomeModal isActive={showDeleteSortieModal} onClose={handleSuccess}>
        <DeleteSortie
          sortie={currentMouvement}
          onSuccess={handleSuccess}
          onClose={handleSuccess}
        />
      </WelcomeModal>
      <WelcomeModal isActive={showRejeteModal} onClose={handleSuccess}>
        <RejeteDepense
          depense={currentDepense}
          onSuccess={handleSuccess}
          onClose={handleSuccess}
        />
      </WelcomeModal>
      <WelcomeModal isActive={showBloquerModal} onClose={handleSuccess}>
        <BloquerDepense
          depense={currentDepense}
          onSuccess={handleSuccess}
          onClose={handleSuccess}
        />
      </WelcomeModal>

      <div className="container-fluid">
        <PageHeaderActions indexTitle="Gestion des Mouvements / Dépenses" />

        <div className="col-xl-12">
          <div className="card custom-card">
            <div className="card-header justify-content-between">
              <div className="card-title">Liste des Dépenses | Mouvements</div>
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
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="table-responsive">
                <table className="customTable table table-bordered text-nowrap mb-0 tw-text-xs table-sm">
                  {" "}
                  {/* table-sm pour le padding natif Bootstrap + tw-text-xs */}
                  <thead>
                    <tr>
                      <th className="fw-bold tw-py-1"></th>
                      <th className="fw-bold tw-py-1">Intitulé</th>
                      <th className="fw-bold tw-text-center tw-py-1">
                        Montant Total
                      </th>
                      <th className="fw-bold tw-py-1">Effectué par</th>
                      <th className="fw-bold tw-text-center tw-py-1">Statut</th>
                      <th className="fw-bold tw-text-center tw-py-1">
                        Mouvements
                      </th>
                      {hasAnyActionPermission && (
                        <th className="fw-bold tw-text-center tw-py-1">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {/* Lignes de chargement, erreur, et vide (padding minimal) */}
                    {isLoading && (
                      <tr>
                        <td
                          colSpan={hasAnyActionPermission ? "7" : "6"}
                          className="text-center tw-py-2"
                        >
                          <Spinner />
                        </td>
                      </tr>
                    )}
                    {isError && (
                      <tr>
                        <td
                          colSpan={hasAnyActionPermission ? "7" : "6"}
                          className="text-center tw-py-2"
                        >
                          <div className="flex flex-col items-center gap-1 text-red-500">
                            <ServerCrash className="w-5 h-5" />
                            <span className="tw-text-xs">
                              {error?.message ||
                                "Impossible de charger les données."}
                            </span>
                          </div>
                        </td>
                      </tr>
                    )}
                    {!isLoading &&
                      !isError &&
                      filteredDepenses.length === 0 && (
                        <tr>
                          <td
                            colSpan={hasAnyActionPermission ? "7" : "6"}
                            className="text-center tw-py-2"
                          >
                            <EmptyState message="Aucune dépense trouvée" />
                          </td>
                        </tr>
                      )}
                    {/* Lignes de données (padding minimal) */}
                    {!isLoading &&
                      !isError &&
                      filteredDepenses.map((depense) => (
                        <Fragment key={depense.id}>
                          <tr
                            className={`${
                              depense.bloquer ? "tw-bg-gray-100" : ""
                            } ${
                              depense.rejeter ? "tw-bg-red-50" : ""
                            } hover:tw-bg-gray-50`}
                          >
                            {/* TD 1 (Icône) - Padding minimal */}
                            <td align="center" className="tw-p-1">
                              <div
                                className="
                                    tw-w-6 tw-h-6 
                                    tw-rounded-full
                                    tw-bg-blue-100 dark:tw-bg-blue-500/20 
                                    tw-flex tw-items-center tw-justify-center 
                                    "
                              >
                                <CircleDollarSign
                                  className="tw-text-blue-600 dark:tw-text-blue-400"
                                  size={14}
                                />
                              </div>
                            </td>
                            <td className="tw-p-1 align-middle">
                              <div className="tw-flex tw-flex-col tw-items-start tw-gap-0">
                                {" "}
                                {/* Gap minimal */}
                                <div className="tw-font-medium tw-text-gray-900 tw-text-xs tw-mb-1">
                                  {depense.wording}
                                </div>
                                <div className="tw-flex tw-items-center tw-gap-1">
                                  <h6 className="tw-text-2xs tw-font-semibold tw-text-blue-800 tw-bg-blue-100 tw-rounded tw-p-1">
                                    {depense.typeDeDepense?.wording}
                                  </h6>

                                  {depense?.rejeter ? (
                                    <span className="tw-flex tw-items-center tw-gap-0.5 tw-text-xs tw-font-semibold tw-text-red-600">
                                      <X size={12} />
                                      Rejeté
                                    </span>
                                  ) : (
                                    <span className="tw-flex tw-items-center tw-gap-0.5 tw-text-xs tw-font-semibold tw-text-green-600">
                                      <CheckCheck size={12} />
                                      Approuvé
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                            {/* TD 3 (Montant) - Padding minimal */}
                            <td className="tw-p-1 tw-text-center tw-font-semibold align-middle">
                              {depense.montant.toLocaleString()} F
                            </td>
                            {/* TD 4 (Saisi par) - Padding minimal */}
                            <td className="tw-p-1 align-middle tw-text-xs">
                              {depense.user?.fullName}
                            </td>
                            {/* TD 5 (Statut) - Padding minimal */}
                            <td className="tw-p-1 tw-text-center align-middle">
                              <span
                                className={`badge ${
                                  depense.status
                                    ? "bg-success-transparent"
                                    : "bg-warning-transparent"
                                } tw-text-2xs`}
                              >
                                {depense.status ? "Payé" : "En attente"}
                              </span>
                              {depense.rejeter && (
                                <span className="badge bg-danger-transparent tw-ms-0.5 tw-text-2xs">
                                  Rejeté
                                </span>
                              )}
                              {depense.bloquer && (
                                <span className="badge bg-dark-transparent tw-ms-0.5 tw-text-2xs">
                                  Bloqué
                                </span>
                              )}
                            </td>
                            {/* TD 6 (Mouvements) - Padding minimal */}
                            <td className="tw-p-1 tw-text-center align-middle">
                              {depense.Mouvements.length > 0 ? (
                                <button
                                  onClick={() => toggleRow(depense.id)}
                                  className="btn btn-xs btn-light d-flex align-items-center mx-auto tw-py-0 tw-px-1 tw-text-xs"
                                >
                                  {expandedRows[depense.id] ? (
                                    <ChevronDown size={12} className="me-1" />
                                  ) : (
                                    <ChevronRight size={12} className="me-1" />
                                  )}
                                  {depense.Mouvements.length} Paiement(s)
                                </button>
                              ) : (
                                <span className="badge tw-bg-red-200 tw-text-red-600 tw-text-2xs">
                                  Aucun
                                </span>
                              )}
                            </td>
                            {/* TD 7 (Actions) - Padding minimal et densité maximale */}
                            {hasAnyActionPermission && (
                              <td className="tw-p-1 align-middle">
                                <div className="d-flex justify-content-center align-items-center tw-gap-1 tw-text-2xs">
                                  {can("payeDepense") && (
                                    <button
                                      onClick={() => {
                                        setCurrentDepense(depense);
                                        setCurrentMouvement(null);
                                        setShowCreateSortieModal(true);
                                      }}
                                      className="btn btn-sm btn-primary-transparent d-flex align-items-center tw-py-0 tw-px-1.5"
                                      title="Payer / Gérer les paiements"
                                      disabled={
                                        depense.status ||
                                        depense.bloquer ||
                                        depense.rejeter
                                      }
                                    >
                                      <i className="ri-hand-coin-line tw-mr-1"></i>
                                      Payer
                                    </button>
                                  )}
                                  {can("rejectDepense") && (
                                    <button
                                      onClick={() => {
                                        setCurrentDepense(depense);
                                        setShowRejeteModal(true);
                                      }}
                                      className="btn btn-sm tw-ml-0 btn-warning-transparent d-flex align-items-center tw-py-0 tw-px-1.5"
                                      title={
                                        depense.rejeter
                                          ? "Annuler le rejet"
                                          : "Rejeter la dépense"
                                      }
                                      disabled={depense.status}
                                    >
                                      <i className="ri-close-circle-line tw-mr-1"></i>
                                      {depense.rejeter ? "Annuler" : "Rejeter"}
                                    </button>
                                  )}
                                  {can("bloqueDepense") && (
                                    <button
                                      onClick={() => {
                                        setCurrentDepense(depense);
                                        setShowBloquerModal(true);
                                      }}
                                      className="btn btn-sm tw-ml-0 btn-danger-transparent d-flex align-items-center tw-py-0 tw-px-1.5"
                                      title={
                                        depense.bloquer
                                          ? "Débloquer la dépense"
                                          : "Bloquer la dépense"
                                      }
                                    >
                                      <i
                                        className={`ri-${
                                          depense.bloquer
                                            ? "lock-unlock"
                                            : "lock"
                                        }-line tw-mr-1`}
                                      ></i>
                                      {depense.bloquer
                                        ? "Débloquer"
                                        : "Bloquer"}
                                    </button>
                                  )}
                                </div>
                              </td>
                            )}
                          </tr>
                          {/* Ligne d'expansion (Mouvements) */}
                          {expandedRows[depense.id] && (
                            <tr>
                              <td
                                colSpan={hasAnyActionPermission ? "7" : "6"}
                                className="p-0"
                                style={{
                                  backgroundColor: "#fafafa",
                                  borderBottom: "1px solid #dee2e6",
                                }}
                              >
                                <div className="tw-p-2">
                                  {" "}
                                  {/* Padding réduit */}
                                  <h6 className="tw-font-semibold tw-mb-1 tw-text-xs">
                                    Détails des Paiements
                                  </h6>
                                  <table className="table table-sm mb-0">
                                    <tbody>
                                      {depense.Mouvements.map((mouvement) => (
                                        <tr
                                          key={mouvement.id}
                                          className="tw-text-xs"
                                        >
                                          <td className="tw-font-medium tw-py-1">
                                            {mouvement.montant.toLocaleString()}{" "}
                                            F
                                          </td>
                                          <td className="tw-py-1">
                                            <p className="tw-text-2xs tw-text-gray-500 mb-0">
                                              Payé par{" "}
                                              {mouvement.user?.fullName}
                                            </p>
                                          </td>
                                          <td className="tw-py-1">
                                            <p className="tw-text-2xs tw-text-gray-500 mb-0">
                                              Le{" "}
                                              {new Date(
                                                mouvement.createdAt
                                              ).toLocaleDateString(
                                                "fr-FR"
                                              )}{" "}
                                              {/* date courte */}
                                            </p>
                                          </td>
                                          {can("payeDepense") && (
                                            <td className="text-end tw-py-1">
                                              <button
                                                onClick={() => {
                                                  setCurrentDepense(depense);
                                                  setCurrentMouvement(
                                                    mouvement
                                                  );
                                                  setShowCreateSortieModal(
                                                    true
                                                  );
                                                }}
                                                className="btn btn-icon btn-sm btn-primary-transparent tw-w-5 tw-h-5"
                                                title="Modifier ce paiement"
                                                disabled={
                                                  depense.bloquer ||
                                                  depense.rejeter
                                                }
                                              >
                                                <i className="ri-edit-line"></i>
                                              </button>
                                              <button
                                                onClick={() => {
                                                  setCurrentMouvement(
                                                    mouvement
                                                  );
                                                  setShowDeleteSortieModal(
                                                    true
                                                  );
                                                }}
                                                className="btn btn-icon btn-sm btn-danger-transparent ms-1 tw-w-5 tw-h-5"
                                                title="Supprimer ce paiement"
                                                disabled={
                                                  depense.bloquer ||
                                                  depense.rejeter
                                                }
                                              >
                                                <i className="ri-delete-bin-line"></i>
                                              </button>
                                            </td>
                                          )}
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

// src/pages/dashboard/Editions.jsx

import { useEffect, useState, useCallback } from "react"; // useCallback ajouté
import { useQueryClient } from "@tanstack/react-query";
import ExportToExcelButton from "../../components/ExportToExcelButton";
import PageHeaderActions from "../../components/common/PageHeaderActions";
import Spinner from "../../components/Spinner";
import { useFetchUsers } from "../../hook/api/useFetchUsers";
import { useFetchEditions } from "../../hook/api/useFetchEditions";
import { useSocket } from "../../context/socket.jsx";
import { ServerCrash } from "lucide-react";
import UserAndDateRangeFilter from "../../components/UserAndDateRangeFilter";

export default function Editions() {
  const currentYear = new Date().getFullYear();

  // Les clés correspondent maintenant au hook et au composant de filtre
  const initialFilters = {
    dateDebut: `${currentYear}-01-01`,
    dateFin: `${currentYear}-12-31`,
    userId: null,
  };

  const [filters, setFilters] = useState(initialFilters);
  const queryClient = useQueryClient();
  const socket = useSocket();
  const user = JSON.parse(localStorage.getItem("user"));
  const companyId = user?.company?.id;

  // Le hook pour récupérer les utilisateurs reste nécessaire pour le filtre
  // data: usersData,
  const { isLoading: isLoadingUsers } = useFetchUsers({
    page: 1,
    perpage: 9999,
    companyId,
  });

  // Le hook des éditions utilise directement l'état des filtres
  const {
    data: depenses = [],
    isLoading: isLoadingEditions,
    isError,
    error,
  } = useFetchEditions({
    companyId,
    userId: filters.userId,
    dateDebut: filters.dateDebut,
    dateFin: filters.dateFin,
  });

  // Le seul gestionnaire de filtre nécessaire
  const handleSearch = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  useEffect(() => {
    if (!socket || !companyId) return;
    socket.emit("join_company_room", companyId);

    const handleDataUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["editions"] });
    };

    const events = [
      "user_created",
      "user_updated",
      "user_deleted",
      "depense_created",
      "depense_updated",
      "depense_deleted",
      "type_depense_created",
      "type_depense_updated",
      "type_depense_deleted",
    ];
    events.forEach((event) => socket.on(event, handleDataUpdate));

    return () => {
      events.forEach((event) => socket.off(event, handleDataUpdate));
    };
  }, [socket, companyId, queryClient]);

  const [columnVisibility, setColumnVisibility] = useState({
    typeDepense: true,
    id: true,
    montant: true,
    wording: true,
    facture: true,
    decharger: true,
    user: true,
    status: true,
    decaissement: true,
    approbation: true,
    bloquer: true,
    createdAt: true,
  });

  const toggleColumnVisibility = (column) => {
    setColumnVisibility((prevState) => ({
      ...prevState,
      [column]: !prevState[column],
    }));
  };

  const isLoading = isLoadingUsers || isLoadingEditions;
  const visibleColumnCount =
    Object.values(columnVisibility).filter(Boolean).length;

  return (
    <div className="">
      <div className="container-fluid">
        <PageHeaderActions indexTitle="Editions" />

        {/* Le nouveau composant de filtre, propre et réutilisable */}
        <div className="tw-my-4 tw-p-4 tw-bg-gray-50 dark:tw-bg-gray-800 tw-rounded-lg">
          <UserAndDateRangeFilter
            companyId={companyId}
            onSearch={handleSearch}
          />
        </div>

        <div className="table-responsive tw-my-5 tw-mb-20">
          <div className="tw-border tw-p-3 tw-rounded-md">
            <div className="tw-mb-4 tw-space-x-3">
              <ExportToExcelButton tableId="editionsTable" />
            </div>
            <div className="d-flex flex-wrap mb-3 w-100">
              {Object.keys(columnVisibility).map((column) => (
                <div key={column} className="me-3 form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={`col-${column}`}
                    checked={columnVisibility[column]}
                    onChange={() => toggleColumnVisibility(column)}
                  />
                  <label
                    className="form-check-label ms-2"
                    htmlFor={`col-${column}`}
                  >
                    {column
                      .replace(/([A-Z])/g, " $1")
                      .replace(/^./, (str) => str.toUpperCase())}
                  </label>
                </div>
              ))}
            </div>
            <table
              className="customTable table table-bordered text-nowrap mb-0"
              id="editionsTable"
            >
              <thead>
                <tr>
                  {columnVisibility.typeDepense && (
                    <th className="fw-bold">Type</th>
                  )}
                  {columnVisibility.id && <th className="fw-bold">N°</th>}
                  {columnVisibility.montant && (
                    <th className="fw-bold">Montant</th>
                  )}
                  {columnVisibility.wording && (
                    <th className="fw-bold">Dépense</th>
                  )}
                  {columnVisibility.facture && (
                    <th className="fw-bold">Facture</th>
                  )}
                  {columnVisibility.decharger && (
                    <th className="fw-bold">Décharge</th>
                  )}
                  {columnVisibility.user && (
                    <th className="fw-bold">Saisi par</th>
                  )}
                  {columnVisibility.status && (
                    <th className="fw-bold">Status</th>
                  )}
                  {columnVisibility.decaissement && (
                    <th className="fw-bold">Décaissement</th>
                  )}
                  {columnVisibility.approbation && (
                    <th className="fw-bold">Approbation</th>
                  )}
                  {columnVisibility.bloquer && (
                    <th className="fw-bold">Bloqué</th>
                  )}
                  {columnVisibility.createdAt && (
                    <th className="fw-bold">Ajouté le</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr>
                    <td
                      colSpan={visibleColumnCount}
                      className="text-center py-5"
                    >
                      <Spinner />
                    </td>
                  </tr>
                )}
                {isError && (
                  <tr>
                    <td
                      colSpan={visibleColumnCount}
                      className="text-center py-5"
                    >
                      <div className="flex flex-col items-center gap-2 text-red-500">
                        <ServerCrash className="w-8 h-8" />
                        <span>
                          {error?.message ||
                            "Erreur de chargement des données."}
                        </span>
                      </div>
                    </td>
                  </tr>
                )}
                {!isLoading && !isError && depenses.length === 0 && (
                  <tr>
                    <td
                      colSpan={visibleColumnCount}
                      className="text-center py-4"
                    >
                      <span className="tw-text-gray-500">
                        Aucun résultat trouvé pour ces critères.
                      </span>
                    </td>
                  </tr>
                )}
                {!isLoading &&
                  !isError &&
                  depenses.map((depense, index, arr) => {
                    const isFirstRowOfGroup =
                      index === 0 ||
                      arr[index - 1].typeDeDepense.wording !==
                        depense.typeDeDepense.wording;
                    const showGroupedCell =
                      columnVisibility.typeDepense && isFirstRowOfGroup;

                    return (
                      <tr key={depense.id}>
                        {showGroupedCell && (
                          <td
                            rowSpan={
                              arr.filter(
                                (d) =>
                                  d.typeDeDepense.wording ===
                                  depense.typeDeDepense.wording
                              ).length
                            }
                            className="align-middle text-center"
                          >
                            {depense.typeDeDepense.wording}
                          </td>
                        )}
                        {columnVisibility.id && (
                          <td className="text-center">
                            <span className="tag tag-orange">{depense.id}</span>
                          </td>
                        )}
                        {columnVisibility.montant && (
                          <td className="tw-font-bold">
                            {depense.montant?.toLocaleString()} F
                          </td>
                        )}
                        {columnVisibility.wording && <td>{depense.wording}</td>}
                        {columnVisibility.facture && (
                          <td className="text-center">
                            {depense.factureUrl ? (
                              <a
                                className="btn btn-icon btn-sm btn-success-transparent rounded-pill"
                                href={`${
                                  import.meta.env.VITE_BACKEND_URL
                                }/uploads/${depense.factureUrl}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <i className="bx bx-download"></i>
                              </a>
                            ) : (
                              <span
                                className="btn btn-icon btn-sm btn-danger-transparent rounded-pill"
                                style={{ cursor: "not-allowed" }}
                              >
                                <i className="bx bx-x-circle"></i>
                              </span>
                            )}
                          </td>
                        )}
                        {columnVisibility.decharger && (
                          <td className="text-center">
                            <span
                              className={`badge ${
                                depense.decharger
                                  ? "bg-success-transparent"
                                  : "bg-danger-transparent"
                              }`}
                            >
                              {depense.decharger ? "Oui" : "Non"}
                            </span>
                          </td>
                        )}
                        {columnVisibility.user && (
                          <td>{depense.user?.fullName}</td>
                        )}
                        {columnVisibility.status && (
                          <td className="text-center">
                            <span
                              className={`badge ${
                                depense.status
                                  ? "bg-success-transparent"
                                  : "bg-danger-transparent"
                              }`}
                            >
                              {depense.status ? "Payé" : "Impayé"}
                            </span>
                          </td>
                        )}
                        {columnVisibility.decaissement && (
                          <td className="text-center">
                            {depense.Mouvements.length > 0 ? (
                              depense.Mouvements.map((m) => (
                                <div
                                  key={m.id}
                                  className="badge bg-light text-dark mb-1"
                                >
                                  {m.montant.toLocaleString()} F
                                </div>
                              ))
                            ) : (
                              <span className="badge bg-warning-transparent">
                                En attente
                              </span>
                            )}
                          </td>
                        )}
                        {columnVisibility.approbation && (
                          <td className="text-center">
                            <span
                              className={`badge ${
                                !depense.rejeter
                                  ? "bg-success-transparent"
                                  : "bg-danger-transparent"
                              }`}
                            >
                              {!depense.rejeter ? "Approuvé" : "Rejeté"}
                            </span>
                          </td>
                        )}
                        {columnVisibility.bloquer && (
                          <td className="text-center">
                            <span
                              className={`badge ${
                                depense.bloquer
                                  ? "bg-dark-transparent"
                                  : "bg-light-transparent"
                              }`}
                            >
                              {depense.bloquer ? "Bloqué" : "Débloqué"}
                            </span>
                          </td>
                        )}
                        {columnVisibility.createdAt && (
                          <td className="text-center">
                            {new Date(depense.createdAt).toLocaleDateString(
                              "fr-CA"
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

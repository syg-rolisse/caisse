import { useEffect, useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import ExportToExcelButton from "../../components/ExportToExcelButton";
import ExportToPDFButton from "../../components/ExportToPDFButton";
import PageHeaderActions from "../../components/common/PageHeaderActions";
import Spinner from "../../components/Spinner";
import { useFetchUsers } from "../../hook/api/useFetchUsers";
import { useFetchEditions } from "../../hook/api/useFetchEditions";
import { useSocket } from "../../context/socket.jsx";
import { ServerCrash, Lock, Unlock } from "lucide-react";
import UserAndDateRangeFilter from "../../components/UserAndDateRangeFilter";
import EmptyState from "../../components/EmptyState";

export default function Editions() {
  const currentYear = new Date().getFullYear();

  const initialFilters = {
    dateDebut: `${currentYear}-01-01`,
    dateFin: `${currentYear}-12-31`,
    userId: null,
    typeDeDepenseId: null,
    by: null,
  };

  const [filters, setFilters] = useState(initialFilters);
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
    error,
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
    user: true,
    dateOperation: true,
    wording: true,
    montant: true,
    totalDecaisse: true,
    resteAPayer: true,
    status: true,
    approbation: true,
    bloquer: true,
    facture: true,
    decharger: true,
    createdAt: true,
  });

  const columnLabels = {
    typeDepense: "Type",
    id: "N°",
    user: "Effectuée par",
    dateOperation: "Date Opération",
    wording: "Libellé",
    montant: "Montant Dû",
    totalDecaisse: "Total Décaissé",
    resteAPayer: "Reste à Payer",
    status: "Statut",
    approbation: "Approbation",
    bloquer: "Bloqué",
    facture: "Facture",
    decharger: "Décharge",
    createdAt: "Créé le",
  };

  const toggleColumnVisibility = (column) => {
    setColumnVisibility((prevState) => ({
      ...prevState,
      [column]: !prevState[column],
    }));
  };

  const isLoading = isLoadingUsers || isLoadingEditions;
  const visibleColumnCount =
    Object.values(columnVisibility).filter(Boolean).length;

  // Calcul des totaux
  const calculateTotals = () => {
    if (isLoading || isError) {
      return { totalMontant: 0, totalDecaisse: 0, totalResteAPayer: 0 };
    }

    const totals = depenses.reduce(
      (acc, depense) => {
        const decaisse = depense.Mouvements.reduce(
          (sum, m) => sum + m.montant,
          0
        );
        const reste = depense.montant - decaisse;

        acc.totalMontant += depense.montant;
        acc.totalDecaisse += decaisse;
        acc.totalResteAPayer += reste;
        return acc;
      },
      { totalMontant: 0, totalDecaisse: 0, totalResteAPayer: 0 }
    );
    return totals;
  };

  const totals = calculateTotals();
  // Fin du calcul des totaux

  // Nombre de colonnes avant "Montant Dû"
  // const colsBeforeMontant = [
  //   "typeDepense",
  //   "id",
  //   "user",
  //   "dateOperation",
  //   "wording",
  // ].filter((col) => columnVisibility[col]).length;

  return (
    <div>
      <div className="tw-border tw-p-3 tw-rounded-md container-fluid table-responsive tw-my-5 tw-mb-20">
        <PageHeaderActions indexTitle="Editions" />
        <div className="tw-my-4 tw-bg-gray-50 dark:tw-bg-gray-800 tw-rounded-lg">
          <UserAndDateRangeFilter
            companyId={companyId}
            onSearch={handleSearch}
          />
        </div>
        <div className="">
          <div className="">
            <div className="tw-mb-4 tw-flex tw-items-center tw-justify-start tw-gap-2">
              <ExportToExcelButton tableId="editionsTable" />
              <ExportToPDFButton tableId="editionsTable" />
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
                    {columnLabels[column]}
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
                  {columnVisibility.user && (
                    <th className="fw-bold">Effectué par</th>
                  )}
                  {columnVisibility.dateOperation && (
                    <th className="fw-bold">Date Opération</th>
                  )}
                  {columnVisibility.wording && (
                    <th className="fw-bold">Libellé</th>
                  )}
                  {columnVisibility.montant && (
                    <th className="fw-bold">Montant Dû</th>
                  )}
                  {columnVisibility.totalDecaisse && (
                    <th className="fw-bold">Total Décaissé</th>
                  )}
                  {columnVisibility.resteAPayer && (
                    <th className="fw-bold">Reste à Payer</th>
                  )}
                  {columnVisibility.status && (
                    <th className="fw-bold">Statut</th>
                  )}
                  {columnVisibility.approbation && (
                    <th className="fw-bold">Approbation</th>
                  )}
                  {columnVisibility.bloquer && (
                    <th className="fw-bold">Bloqué</th>
                  )}
                  {columnVisibility.facture && (
                    <th className="fw-bold">Facture</th>
                  )}
                  {columnVisibility.decharger && (
                    <th className="fw-bold">Décharge</th>
                  )}

                  {columnVisibility.createdAt && (
                    <th className="fw-bold">Créé le</th>
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
                      <span className="tw-bg-gray-100 tw-text-gray-600 tw-rounded-md tw-flex tw-mb-3 tw-items-center tw-justify-center">
                        <EmptyState message="Aucune dépense trouvée pour les filtres sélectionnés." />
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
                    const totalDecaisse = depense.Mouvements.reduce(
                      (sum, m) => sum + m.montant,
                      0
                    );
                    const resteAPayer = depense.montant - totalDecaisse;

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
                        {columnVisibility.user && (
                          <td>{depense.user?.fullName}</td>
                        )}
                        {columnVisibility.dateOperation && (
                          <td className="text-center">
                            {new Date(depense.dateOperation).toLocaleDateString(
                              "fr-CA"
                            )}
                          </td>
                        )}
                        {columnVisibility.wording && <td>{depense.wording}</td>}
                        {columnVisibility.montant && (
                          <td className="tw-font-bold tw-text-center">
                            {depense.montant?.toLocaleString()} F
                          </td>
                        )}
                        {columnVisibility.totalDecaisse && (
                          <td className="tw-font-semibold tw-text-center">
                            {totalDecaisse.toLocaleString()} F
                          </td>
                        )}
                        {columnVisibility.resteAPayer && (
                          <td
                            className={`tw-font-bold tw-text-center ${
                              resteAPayer > 0
                                ? "tw-text-red-600"
                                : "tw-text-green-600"
                            }`}
                          >
                            {resteAPayer.toLocaleString()} F
                          </td>
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
                            <div className="tw-flex tw-items-center tw-justify-center">
                              {depense.bloquer ? (
                                <Lock className="w-4 h-4 tw-text-gray-700" />
                              ) : (
                                <Unlock className="w-4 h-4 tw-text-gray-700" />
                              )}
                            </div>
                          </td>
                        )}
                        {columnVisibility.facture && (
                          <td className="text-center">
                            {depense.factureUrl ? (
                              <a
                                className="btn btn-icon btn-sm btn-success-transparent rounded-pill d-flex justify-content-center align-items-center mx-auto"
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
                                className="btn btn-icon btn-sm btn-danger-transparent rounded-pill d-flex justify-content-center align-items-center mx-auto"
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

              {/* ⭐ Ligne de Total ajoutée dans le <tfoot> */}
              {!isLoading && !isError && depenses.length > 0 && (
                <tfoot>
                  <tr className="tw-bg-gray-200  dark:tw-text-gray-200 tw-font-extrabold tw-border-t-4 tw-border-orange-500">
  <td colSpan={4} className="text-end tw-align-middle tw-py-2 tw-text-xl">
    ⭐ Total Général :
  </td>
  {columnVisibility.montant && (
    <td className="tw-text-center tw-text-2xl tw-text-orange-700 dark:tw-text-orange-400 tw-align-middle">
      {totals.totalMontant.toLocaleString()} F
    </td>
  )}
  {columnVisibility.totalDecaisse && (
    <td className="tw-text-center tw-text-2xl tw-text-blue-700 dark:tw-text-blue-400 tw-align-middle">
      {totals.totalDecaisse.toLocaleString()} F
    </td>
  )}
  {columnVisibility.resteAPayer && (
    <td
      className={`tw-text-center tw-text-2xl tw-align-middle ${
        totals.totalResteAPayer > 0
          ? "tw-text-red-700 dark:tw-text-red-400"
          : "tw-text-green-700 dark:tw-text-green-400"
      }`}
    >
      {totals.totalResteAPayer.toLocaleString()} F
    </td>
  )}
  {/* Colonnes restantes (Statut à Créé le) */}
  <td colSpan={6}></td>
</tr>
                </tfoot>
              )}
              {/* Fin de la ligne de Total */}

            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
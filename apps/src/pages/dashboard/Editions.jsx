import { useEffect, useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import ExportToExcelButton from "../../components/ExportToExcelButton";
import PageHeaderActions from "../../components/common/PageHeaderActions";
import Spinner from "../../components/Spinner";
import { useFetchUsers } from "../../hook/api/useFetchUsers";
import { useFetchEditions } from "../../hook/api/useFetchEditions";
import { useSocket } from "../../context/socket.jsx";
import { ServerCrash, Lock, Unlock } from "lucide-react";
import UserAndDateRangeFilter from "../../components/UserAndDateRangeFilter";

export default function Editions() {
  const currentYear = new Date().getFullYear();

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
      "user_created", "user_updated", "user_deleted", "depense_created",
      "depense_updated", "depense_deleted", "type_depense_created",
      "type_depense_updated", "type_depense_deleted",
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
  const visibleColumnCount = Object.values(columnVisibility).filter(Boolean).length;

  return (
    <div>
      <div className="container-fluid">
        <PageHeaderActions indexTitle="Editions" />
        <div className="tw-my-4 tw-p-4 tw-bg-gray-50 dark:tw-bg-gray-800 tw-rounded-lg">
          <UserAndDateRangeFilter companyId={companyId} onSearch={handleSearch} />
        </div>
        <div className="table-responsive tw-my-5 tw-mb-20">
          <div className="tw-border tw-p-3 tw-rounded-md">
            <div className="tw-mb-4">
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
                  <label className="form-check-label ms-2" htmlFor={`col-${column}`}>
                    {columnLabels[column]}
                  </label>
                </div>
              ))}
            </div>
            <table className="customTable table table-bordered text-nowrap mb-0" id="editionsTable">
              <thead>
                <tr>
                  {columnVisibility.typeDepense && <th className="fw-bold">Type</th>}
                  {columnVisibility.id && <th className="fw-bold">N°</th>}
                  {columnVisibility.user && <th className="fw-bold">Effectué par</th>}
                  {columnVisibility.dateOperation && <th className="fw-bold">Date Opération</th>}
                  {columnVisibility.wording && <th className="fw-bold">Libellé</th>}
                  {columnVisibility.montant && <th className="fw-bold">Montant Dû</th>}
                  {columnVisibility.totalDecaisse && <th className="fw-bold">Total Décaissé</th>}
                  {columnVisibility.resteAPayer && <th className="fw-bold">Reste à Payer</th>}
                  {columnVisibility.status && <th className="fw-bold">Statut</th>}
                  {columnVisibility.approbation && <th className="fw-bold">Approbation</th>}
                  {columnVisibility.bloquer && <th className="fw-bold">Bloqué</th>}
                  {columnVisibility.facture && <th className="fw-bold">Facture</th>}
                  {columnVisibility.decharger && <th className="fw-bold">Décharge</th>}
                  
                  {columnVisibility.createdAt && <th className="fw-bold">Créé le</th>}
                </tr>
              </thead>
              <tbody>
                {isLoading && (<tr><td colSpan={visibleColumnCount} className="text-center py-5"><Spinner /></td></tr>)}
                {isError && (<tr><td colSpan={visibleColumnCount} className="text-center py-5"><div className="flex flex-col items-center gap-2 text-red-500"><ServerCrash className="w-8 h-8" /><span>{error?.message || "Erreur de chargement des données."}</span></div></td></tr>)}
                {!isLoading && !isError && depenses.length === 0 && (<tr><td colSpan={visibleColumnCount} className="text-center py-4"><span className="tw-text-gray-500">Aucun résultat trouvé pour ces critères.</span></td></tr>)}
                {!isLoading && !isError && depenses.map((depense, index, arr) => {
                    const isFirstRowOfGroup = index === 0 || arr[index - 1].typeDeDepense.wording !== depense.typeDeDepense.wording;
                    const showGroupedCell = columnVisibility.typeDepense && isFirstRowOfGroup;
                    const totalDecaisse = depense.Mouvements.reduce((sum, m) => sum + m.montant, 0);
                    const resteAPayer = depense.montant - totalDecaisse;

                    return (
                      <tr key={depense.id}>
                        {showGroupedCell && (<td rowSpan={arr.filter((d) => d.typeDeDepense.wording === depense.typeDeDepense.wording).length} className="align-middle text-center">{depense.typeDeDepense.wording}</td>)}
                        {columnVisibility.id && (<td className="text-center"><span className="tw-bg-blue-100 tw-text-blue-600 tw-rounded-full tw-p-1">{depense.id}</span></td>)}
                        {columnVisibility.user && (<td>{depense.user?.fullName}</td>)}
                        {columnVisibility.dateOperation && (<td className="text-center">{new Date(depense.dateOperation).toLocaleDateString("fr-CA")}</td>)}
                        {columnVisibility.wording && <td>{depense.wording}</td>}
                        {columnVisibility.montant && (<td className="tw-font-bold tw-text-center">{depense.montant?.toLocaleString()} F</td>)}
                        {columnVisibility.totalDecaisse && (<td className="tw-font-semibold tw-text-center">{totalDecaisse.toLocaleString()} F</td>)}
                        {columnVisibility.resteAPayer && (<td className={`tw-font-bold tw-text-center ${resteAPayer > 0 ? "tw-text-red-600" : "tw-text-green-600"}`}>{resteAPayer.toLocaleString()} F</td>)}
                        {columnVisibility.status && (<td className="text-center"><span className={`badge ${depense.status ? "bg-success-transparent" : "bg-danger-transparent"}`}>{depense.status ? "Payé" : "Impayé"}</span></td>)}
                        {columnVisibility.approbation && (<td className="text-center"><span className={`badge ${!depense.rejeter ? "bg-success-transparent" : "bg-danger-transparent"}`}>{!depense.rejeter ? "Approuvé" : "Rejeté"}</span></td>)}
                        {columnVisibility.bloquer && (<td className="text-center"><div className="tw-flex tw-items-center tw-justify-center">{depense.bloquer ? <Lock className="w-4 h-4 tw-text-gray-700" /> : <Unlock className="w-4 h-4 tw-text-gray-700" />}</div></td>)}
                        {columnVisibility.facture && (<td className="text-center">{depense.factureUrl ? (<a className="btn btn-icon btn-sm btn-success-transparent rounded-pill" href={`${import.meta.env.VITE_BACKEND_URL}/uploads/${depense.factureUrl}`} target="_blank" rel="noopener noreferrer"><i className="bx bx-download"></i></a>) : (<span className="btn btn-icon btn-sm btn-danger-transparent rounded-pill" style={{ cursor: "not-allowed" }}><i className="bx bx-x-circle"></i></span>)}</td>)}
                        {columnVisibility.decharger && (<td className="text-center"><span className={`badge ${depense.decharger ? "bg-success-transparent" : "bg-danger-transparent"}`}>{depense.decharger ? "Oui" : "Non"}</span></td>)}
                        
                        {columnVisibility.createdAt && (<td className="text-center">{new Date(depense.createdAt).toLocaleDateString("fr-CA")}</td>)}
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
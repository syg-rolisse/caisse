// src/pages/Depense/IndexDepense.jsx

import { useState, useMemo, useCallback, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import PageHeaderActions from "../../../components/common/PageHeaderActions";
import DeleteDepense from "../../../components/Depense/DeleteDepense";
import Spinner from "../../../components/Spinner";
import WelcomeModal from "../../../components/WelcomeModal";
import DepenseForm from "../../../components/Depense/DepenseForm";
import Pagination from "../../../components/Pagination";
import DepenseCard from "../../../components/Depense/DepenseCard";
import { useFetchDepenses } from "../../../hook/api/useFetchDepense";
import { useSocket } from "../../../context/socket.jsx";
import { usePermissions } from "../../../hook/usePermissions";
import { ServerCrash } from "lucide-react";
import UserAndDateRangeFilter from "../../../components/UserAndDateRangeFilter";

export default function IndexDepense() {
  const [page, setPage] = useState(1);
  const [perpage, setPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentDepense, setCurrentDepense] = useState(null);
  const [filters, setFilters] = useState({
    userId: null,
    dateDebut: null,
    dateFin: null,
  });

  const socket = useSocket();
  const { can } = usePermissions();
  const queryClient = useQueryClient();
  const user = JSON.parse(localStorage.getItem("user"));
  const companyId = user?.company?.id;

  const { data, isLoading, isError, error } = useFetchDepenses({
    page,
    perpage,
    companyId,
    userId: filters.userId,
    dateDebut: filters.dateDebut,
    dateFin: filters.dateFin,
  });

  const depenses = data?.depenses?.data || [];
  const allDepense = data?.allDepenses || [];
  const meta = data?.depenses?.meta || { total: 0, currentPage: 1, lastPage: 1 };

  const filteredDepense = useMemo(() => {
    if (searchTerm.trim() === "") {
      return depenses;
    }
    const listToFilter = allDepense.length > 0 ? allDepense : depenses;
    return listToFilter.filter((depense) => {
      const searchTermLower = searchTerm.toLowerCase();
      return (
        depense.wording?.toLowerCase().includes(searchTermLower) ||
        depense.typeDeDepense?.wording?.toLowerCase().includes(searchTermLower) ||
        depense.user?.fullName?.toLowerCase().includes(searchTermLower) ||
        new Date(depense.createdAt).toLocaleDateString("fr-CA").includes(searchTerm)
      );
    });
  }, [depenses, allDepense, searchTerm]);

  const handleSearch = useCallback((newFilters) => {
    setPage(1);
    setFilters(newFilters);
  }, []);

  const handlePerPageChange = (e) => {
    setPerPage(Number(e.target.value));
    setPage(1);
  };

  const handleSuccess = useCallback(() => {
    setShowModal(false);
    setShowDeleteModal(false);
    setCurrentDepense(null);
    queryClient.invalidateQueries({ queryKey: ["depenses"] });
  }, [queryClient]);

  useEffect(() => {
    if (!socket || !companyId) return;

    socket.emit("join_company_room", companyId);

    const handleDataUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ["depenses"] });
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

  return (
    <div>
      <WelcomeModal isActive={showModal} onClose={() => setShowModal(false)}>
        <DepenseForm depense={currentDepense} onSuccess={handleSuccess} />
      </WelcomeModal>

      <WelcomeModal isActive={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <DeleteDepense depense={currentDepense} onSuccess={handleSuccess} onClose={() => setShowDeleteModal(false)} />
      </WelcomeModal>

      <div className=" tw-pb-16">
        <PageHeaderActions
          indexTitle="Dépenses"
          primaryActionLabel="Ajouter une dépense"
          onPrimaryActionClick={() => {
            setCurrentDepense(null);
            setShowModal(true);
          }}
          showPrimaryAction={can('createDepense')}
        />

        <div className="tw-my-4 tw-bg-gray-50 dark:tw-bg-gray-800 tw-rounded-lg">
           <UserAndDateRangeFilter 
                companyId={companyId} 
                onSearch={handleSearch} 
            />
        </div>

        <div className="tw-flex tw-items-center tw-gap-4 tw-mb-4 tw-w-full">
          <div className="tw-flex tw-items-center tw-gap-2">
            <span>Afficher</span>
            <select className="form-select form-select-sm tw-h-10 tw-w-20" onChange={handlePerPageChange} value={perpage}>
              <option value="10">10</option><option value="25">25</option><option value="50">50</option><option value="100">100</option>
            </select>
          </div>
          <div className="tw-flex-1">
            <input
              className="form-control form-control-xl"
              type="text"
              placeholder="Faites une recherche sur les résultats actuels..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="row">
          {isLoading && (<div className="col-12 text-center py-5"><Spinner /></div>)}
          {isError && (
            <div className="col-12 text-center py-5">
              <div className="tw-flex tw-flex-col tw-items-center tw-gap-2 tw-text-red-500">
                <ServerCrash className="tw-w-8 tw-h-8" />
                <span>{error?.message || "Impossible de charger les dépenses."}</span>
              </div>
            </div>
          )}
          {!isLoading && !isError && filteredDepense.length === 0 && (
            <div className="col-12 text-center">
              <span className="tw-bg-gray-100 tw-text-gray-600 tw-p-3 tw-rounded-md tw-flex tw-mb-3 tw-items-center tw-justify-center">
                <i className="fe fe-info me-2"></i>
                Aucune dépense trouvée pour les filtres sélectionnés.
              </span>
            </div>
          )}
          
          {!isLoading && !isError && filteredDepense.length > 0 && (
            <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-3 xl:tw-grid-cols-4 tw-gap-6">
              {filteredDepense.map((depense) => (
                <DepenseCard
                  key={depense.id}
                  depense={depense}
                  canEdit={can('updateDepense')}
                  canDelete={can('deleteDepense')}
                  onEdit={() => {
                    setCurrentDepense(depense);
                    setShowModal(true);
                  }}
                  onDelete={() => {
                    setCurrentDepense(depense);
                    setShowDeleteModal(true);
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {meta && meta.total > perpage && searchTerm.trim() === "" && (
          <div className="card-footer tw-mt-5">
            <Pagination meta={meta} onPageChange={setPage} />
          </div>
        )}
      </div>
    </div>
  );
}
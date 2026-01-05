import { useState, useCallback, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Download, ServerCrash } from "lucide-react";

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
import UserAndDateRangeFilter from "../../../components/UserAndDateRangeFilter";
import EmptyState from "../../../components/EmptyState";
import {
  downloadMultipleDepenses,
  simpleFormatDate,
} from "../../../utils/downloadDepense.js";
import "../../../fade.css";

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

export default function IndexDepense() {
  const [page, setPage] = useState(1);
  const [perpage] = useState(100); 
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentDepense, setCurrentDepense] = useState(null);
  
  const [filters, setFilters] = useState({
    userId: null,
    dateDebut: null,
    dateFin: null,
    typeDeDepenseId: null,
    by: null,
  });

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

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
    typeDeDepenseId: filters.typeDeDepenseId,
    by: filters.by,
    keyword: debouncedSearchTerm,
  });

  const depenses = data?.depenses?.data || [];
  const meta = data?.depenses?.meta || {
    total: 0,
    currentPage: 1,
    lastPage: 1,
  };

  const handleSearch = useCallback((newFilters) => {
    setPage(1);
    setFilters(newFilters);
  }, []);

  const handleSuccess = useCallback(() => {
    setShowModal(false);
    setShowDeleteModal(false);
    setCurrentDepense(null);
    queryClient.invalidateQueries({ queryKey: ["depenses"] });
  }, [queryClient]);

  const handleDownloadAll = () => {
    downloadMultipleDepenses(depenses, user, simpleFormatDate);
  };

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

      <WelcomeModal
        isActive={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
      >
        <DeleteDepense
          depense={currentDepense}
          onSuccess={handleSuccess}
          onClose={() => setShowDeleteModal(false)}
        />
      </WelcomeModal>

      <div className="tw-pb-16">
        <PageHeaderActions
          indexTitle="Dépenses"
          primaryActionLabel="Ajouter une dépense"
          onPrimaryActionClick={() => {
            setCurrentDepense(null);
            setShowModal(true);
          }}
          showPrimaryAction={can("createDepense")}
        />

        <div className="tw-my-4 tw-bg-gray-50 dark:tw-bg-gray-800 tw-rounded-lg">
          <UserAndDateRangeFilter
            companyId={companyId}
            onSearch={handleSearch}
          />
        </div>

        <div className="tw-mb-4">
          <div className="tw-flex tw-items-center tw-gap-2 tw-justify-between">
            <input
              className="form-control form-control-xl tw-w-full"
              type="text"
              placeholder="Rechercher (Libellé, Montant, Auteur)..."
              value={searchTerm}
              onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
              }}
            />

            {depenses.length > 0 && (
              <button
                title="Télécharger les fiches affichées"
                onClick={handleDownloadAll}
                className="tw-flex tw-items-center tw-gap-2 tw-px-4 tw-py-2 tw-text-sm tw-font-medium tw-rounded-lg tw-text-white tw-bg-green-600 hover:tw-bg-green-700 tw-transition-colors"
              >
                <Download size={20} />
              </button>
            )}
          </div>
        </div>

        <div className="row">
          {isLoading && (
            <div className="col-12 text-center py-5">
              <Spinner />
            </div>
          )}
          {isError && (
            <div className="col-12 text-center py-5">
              <div className="tw-flex tw-flex-col tw-items-center tw-gap-2 tw-text-red-500">
                <ServerCrash className="tw-w-8 tw-h-8" />
                <span>
                  {error?.message || "Impossible de charger les dépenses."}
                </span>
              </div>
            </div>
          )}
          {!isLoading && !isError && depenses.length === 0 && (
            <div className="col-12 text-center">
              <span className="tw-bg-gray-100 tw-text-gray-600 tw-rounded-md tw-flex tw-mb-3 tw-items-center tw-justify-center">
                <EmptyState message="Aucune dépense trouvée pour les filtres sélectionnés." />
              </span>
            </div>
          )}

          {!isLoading && !isError && depenses.length > 0 && (
            <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-3 xl:tw-grid-cols-4 tw-gap-6">
              {depenses.map((depense) => (
                <DepenseCard
                  key={depense.id}
                  depense={depense}
                  canEdit={can("updateDepense")}
                  canDelete={can("deleteDepense")}
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

        {meta && (
          <div className="card-footer tw-mt-5">
            <Pagination meta={meta} onPageChange={setPage} />
          </div>
        )}
      </div>
    </div>
  );
}
import { useState, useCallback, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import PageHeaderActions from "../../../components/common/PageHeaderActions";
import Spinner from "../../../components/Spinner";
import WelcomeModal from "../../../components/WelcomeModal";
import Pagination from "../../../components/Pagination";
import ApprovisionnementForm from "../../../components/Approvisionnement/ApprovisionnementForm";
import DeleteApprovisionnement from "../../../components/Approvisionnement/DeleteApprovisionnement";
import ApprovisionnementCard from "../../../components/Approvisionnement/ApprovisionnementCard";
import { useFetchApprovisionnement } from "../../../hook/api/useFetchApprovisionnement";
import { useSocket } from "../../../context/socket.jsx";
import { usePermissions } from "../../../hook/usePermissions";
import { ServerCrash } from "lucide-react";
import EmptyState from "../../../components/EmptyState";
import "../../../fade.css";

// Hook de debounce simple intégré (à extraire si nécessaire)
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

export default function IndexApprovisionnement() {
  const [page, setPage] = useState(1);
  const [perpage, setPerPage] = useState(50);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentApprovisionnement, setCurrentApprovisionnement] = useState(null);

  // Utilisation du debounce sur le terme de recherche
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const socket = useSocket();
  const { can } = usePermissions();
  const queryClient = useQueryClient();
  const user = JSON.parse(localStorage.getItem("user"));
  const companyId = user?.company?.id;

  // On passe le terme déouncé au hook API
  const { data, isLoading, isError, error } = useFetchApprovisionnement({
    page,
    perpage,
    companyId,
    keyword: debouncedSearchTerm, 
  });

  const approvisionnements = data?.approvisionnements?.data || [];
  const meta = data?.approvisionnements?.meta || { total: 0, currentPage: 1, lastPage: 1 };

  const handlePerPageChange = (e) => {
    setPerPage(Number(e.target.value));
    setPage(1);
  };

  const handleSuccess = useCallback(() => {
    setShowModal(false);
    setShowDeleteModal(false);
    setCurrentApprovisionnement(null);
    queryClient.invalidateQueries({ queryKey: ["approvisionnements"] });
  }, [queryClient]);

  useEffect(() => {
    if (!socket || !companyId) return;
    socket.emit("join_company_room", companyId);
    const handleDataUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ["approvisionnements"] });
    };
    socket.on("appro_created", handleDataUpdate);
    socket.on("appro_updated", handleDataUpdate);
    socket.on("appro_deleted", handleDataUpdate);
    return () => {
      socket.off("appro_created", handleDataUpdate);
      socket.off("appro_updated", handleDataUpdate);
      socket.off("appro_deleted", handleDataUpdate);
    };
  }, [socket, companyId, queryClient]);

  return (
    <div>
      <WelcomeModal isActive={showModal} onClose={() => setShowModal(false)}>
        <ApprovisionnementForm approvisionnement={currentApprovisionnement} onSuccess={handleSuccess} onClose={() => setShowModal(false)} />
      </WelcomeModal>
      <WelcomeModal isActive={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <DeleteApprovisionnement approvisionnement={currentApprovisionnement} onSuccess={handleSuccess} onClose={() => setShowDeleteModal(false)} />
      </WelcomeModal>

      <div className="container-fluid">
        <PageHeaderActions
          indexTitle="Approvisionnements"
          primaryActionLabel="Faire un approvisionnement"
          onPrimaryActionClick={() => {
            setCurrentApprovisionnement(null);
            setShowModal(true);
          }}
          showPrimaryAction={can('createAppro')}
        />

        <div className="col-xl-12">
          <div className="card custom-card">
            <div className="card-body">
              <div className="d-sm-flex mb-4 justify-content-between">
                <div className="tw-flex tw-items-center tw-gap-2 ">
                  <span>Voir</span>
                  <select
                    className="form-select form-select-sm tw-h-10"
                    aria-label="Entries Select"
                    onChange={handlePerPageChange}
                    value={perpage}
                  >
                    <option value="20">20</option><option value="40">40</option><option value="60">60</option>
                  </select>
                </div>
                <div className="d-flex gap-2 mt-sm-0 tw-w-full md:tw-w-auto">
                  <div className="tw-w-full md:tw-w-80 max-sm:tw-mt-2 tw-ml-auto">
                    <input
                      className="form-control form-control-xl"
                      type="text"
                      placeholder="Rechercher..."
                      value={searchTerm}
                      onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setPage(1); // Reset page lors d'une nouvelle recherche
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="tw-mt-6">
                {isLoading && (<div className="tw-flex tw-justify-center tw-py-10"><Spinner /></div>)}
                {isError && (<div className="tw-flex tw-flex-col tw-items-center tw-gap-2 tw-text-red-500 tw-py-10"><ServerCrash className="w-8 h-8" /><span>{error?.message || "Impossible de charger les données."}</span></div>)}
                
                {!isLoading && !isError && approvisionnements.length === 0 && (
                  <div className="col-12 text-center">
                    <span className="tw-bg-gray-100 tw-text-gray-600 tw-rounded-md tw-flex tw-mb-3 tw-items-center tw-justify-center">
                      <EmptyState message="Aucun approvisionnement trouvé." />
                    </span>
                  </div>
                )}

                {!isLoading && !isError && approvisionnements.length > 0 && (
                  <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 xl:tw-grid-cols-4 tw-gap-6">
                    {approvisionnements.map((item) => (
                      <ApprovisionnementCard
                        key={item.id}
                        item={item}
                        canEdit={can('updateAppro')}
                        canDelete={can('deleteAppro')}
                        onEdit={() => { setCurrentApprovisionnement(item); setShowModal(true); }}
                        onDelete={() => { setCurrentApprovisionnement(item); setShowDeleteModal(true); }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {meta && (
              <div className="card-footer">
                <Pagination meta={meta} onPageChange={setPage} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
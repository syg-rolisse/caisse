import { useState, useMemo, useCallback, useEffect } from "react";
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
import "../../../fade.css";

export default function IndexApprovisionnement() {
  const [page, setPage] = useState(1);
  const [perpage, setPerPage] = useState(6); // Ajusté pour une meilleure mise en page en grille
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentApprovisionnement, setCurrentApprovisionnement] = useState(null);

  const socket = useSocket();
  const { can } = usePermissions();
  const queryClient = useQueryClient();
  const user = JSON.parse(localStorage.getItem("user"));
  const companyId = user?.company?.id;

  const { data, isLoading, isError, error } = useFetchApprovisionnement({
    page,
    perpage,
    companyId,
  });

  const approvisionnements = data?.approvisionnements?.data || [];
  const allApprovisionnements = data?.allApprovisionnements || [];
  const meta = data?.approvisionnements?.meta || { total: 0, currentPage: 1, lastPage: 1 };

  const filteredApprovisionnements = useMemo(() => {
    if (searchTerm.trim() === "") {
      return approvisionnements;
    }
    return allApprovisionnements.filter((item) => {
      const searchTermLower = searchTerm.toLowerCase();
      return (
        item.wording?.toLowerCase().includes(searchTermLower) ||
        item.montant?.toString().includes(searchTermLower) ||
        item.user?.fullName?.toLowerCase().includes(searchTermLower)
      );
    });
  }, [approvisionnements, allApprovisionnements, searchTerm]);

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
                    <option value="6">6</option><option value="12">12</option><option value="24">24</option>
                  </select>
                </div>
                <div className="d-flex gap-2 mt-sm-0 tw-w-full md:tw-w-auto">
                  <div className="tw-w-full md:tw-w-80 max-sm:tw-mt-2 tw-ml-auto">
                    <input
                      className="form-control form-control-xl"
                      type="text"
                      placeholder="Rechercher..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="tw-mt-6">
                {isLoading && (<div className="tw-flex tw-justify-center tw-py-10"><Spinner /></div>)}
                {isError && (<div className="tw-flex tw-flex-col tw-items-center tw-gap-2 tw-text-red-500 tw-py-10"><ServerCrash className="w-8 h-8" /><span>{error?.message || "Impossible de charger les données."}</span></div>)}
                {!isLoading && !isError && filteredApprovisionnements.length === 0 && (<div className="tw-text-center tw-py-10"><span className="tw-text-gray-500">Aucun approvisionnement trouvé.</span></div>)}

                {!isLoading && !isError && filteredApprovisionnements.length > 0 && (
                  <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 xl:tw-grid-cols-4 tw-gap-6">
                    {filteredApprovisionnements.map((item) => (
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
            {meta && meta.total > perpage && searchTerm.trim() === "" && (
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
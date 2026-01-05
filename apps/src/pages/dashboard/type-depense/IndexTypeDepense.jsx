import { useState, useMemo, useCallback, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import Spinner from "../../../components/Spinner";
import DeleteTypeDeDepense from "../../../components/Type-depense/DeleteTypeDeDepense";
import TypeDeDepenseForm from "../../../components/Type-depense/TypeDeDepenseForm";
import Pagination from "../../../components/Pagination";
import WelcomeModal from "../../../components/WelcomeModal";
import PageHeaderActions from "../../../components/common/PageHeaderActions";
// Import du nouveau composant Card
import TypeDepenseCard from "../../../components/Type-depense/TypeDepenseCard"; 
import { useFetchTypeDepense } from "../../../hook/api/useFetchTypeDepense";
import { useSocket } from "../../../context/socket.jsx";
import { usePermissions } from "../../../hook/usePermissions";
import { ServerCrash } from "lucide-react";
import "../../../fade.css";

export default function IndexTypeDepense() {
  const [page, setPage] = useState(1);
  const [perpage, setPerPage] = useState(24);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentTypeDepense, setCurrentTypeDepense] = useState(null);

  const socket = useSocket();
  const { can } = usePermissions();
  const queryClient = useQueryClient();
  const user = JSON.parse(localStorage.getItem("user"));
  const companyId = user?.company?.id;

  const { data, isLoading, isError, error } = useFetchTypeDepense({
    page,
    perpage,
    companyId,
  });

  const typeDeDepense = data?.typeDepenses?.data || [];
  const allTypeDeDepense = data?.allTypeDepenses || [];
  const meta = data?.typeDepenses?.meta || { total: 0, currentPage: 1, lastPage: 1 };

  // Filtrage côté client sur allTypeDepense (Comme demandé)
  const filteredTypeDepense = useMemo(() => {
    if (searchTerm.trim() === "") {
      return typeDeDepense; // Affiche la page courante par défaut
    }
    const listToFilter = allTypeDeDepense.length > 0 ? allTypeDeDepense : typeDeDepense;
    
    return listToFilter.filter((type) => {
      const searchTermLower = searchTerm.toLowerCase();
      return (
        type.wording?.toLowerCase().includes(searchTermLower) ||
        type.id.toString().includes(searchTerm)
      );
    });
  }, [typeDeDepense, allTypeDeDepense, searchTerm]);
  
  const handleSuccess = useCallback(() => {
    setShowModal(false);
    setShowDeleteModal(false);
    setCurrentTypeDepense(null);
    queryClient.invalidateQueries({ queryKey: ["typeDepenses"] });
  }, [queryClient]);

  useEffect(() => {
    if (!socket || !companyId) return;
    socket.emit("join_company_room", companyId);
    const handleDataUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ["typeDepenses"] });
    };
    socket.on("type_depense_created", handleDataUpdate);
    socket.on("type_depense_updated", handleDataUpdate);
    socket.on("type_depense_deleted", handleDataUpdate);
    return () => {
      socket.off("type_depense_created", handleDataUpdate);
      socket.off("type_depense_updated", handleDataUpdate);
      socket.off("type_depense_deleted", handleDataUpdate);
    };
  }, [socket, companyId, queryClient]);

  const handlePerPageChange = (e) => {
    setPerPage(Number(e.target.value));
    setPage(1);
  };

  return (
    <div>
      <WelcomeModal isActive={showModal} onClose={() => setShowModal(false)}>
        <TypeDeDepenseForm typeDepense={currentTypeDepense} onSuccess={handleSuccess} />
      </WelcomeModal>
      <WelcomeModal isActive={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <DeleteTypeDeDepense typeDepense={currentTypeDepense} onSuccess={handleSuccess} onClose={() => setShowDeleteModal(false)} />
      </WelcomeModal>
       
      <PageHeaderActions
        indexTitle="Type de dépense"
        primaryActionLabel="Ajouter un type de dépense"
        onPrimaryActionClick={() => {
          setCurrentTypeDepense(null);
          setShowModal(true);
        }}
        showPrimaryAction={can('createTypeDeDepense')}
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
                    placeholder="Rechercher une catégorie..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="tw-mt-6">
              {isLoading && (<div className="tw-flex tw-justify-center tw-py-10"><Spinner /></div>)}
              
              {isError && (
                <div className="tw-flex tw-flex-col tw-items-center tw-gap-2 tw-text-red-500 tw-py-10">
                    <ServerCrash className="w-8 h-8" />
                    <span>{error?.message || "Impossible de charger les données."}</span>
                </div>
              )}
              
              {!isLoading && !isError && filteredTypeDepense.length === 0 && (
                <div className="tw-text-center tw-py-10">
                    {/* Utilisation de EmptyState si disponible, sinon texte simple */}
                    <span className="tw-text-gray-500">Aucun type de dépense trouvé.</span>
                </div>
              )}

              {!isLoading && !isError && filteredTypeDepense.length > 0 && (
                <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 xl:tw-grid-cols-4 tw-gap-6">
                  {filteredTypeDepense.map((item) => (
                    <TypeDepenseCard
                      key={item.id}
                      item={item} // On passe l'objet complet 'item'
                      canEdit={can('updateTypeDeDepense')}
                      canDelete={can('deleteTypeDeDepense')}
                      onEdit={() => { setCurrentTypeDepense(item); setShowModal(true); }}
                      onDelete={() => { setCurrentTypeDepense(item); setShowDeleteModal(true); }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Pagination affichée seulement si pas de recherche active (car recherche client sur tout) */}
          {meta && meta.total > perpage && searchTerm.trim() === "" && (
            <div className="card-footer">
              <Pagination meta={meta} onPageChange={setPage} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
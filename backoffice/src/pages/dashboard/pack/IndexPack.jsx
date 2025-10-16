import { useState, useMemo, useCallback, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import Spinner from "../../../components/Spinner";
import DeletePack from "../../../components/Pack/DeletePack";
import PackForm from "../../../components/Pack/PackForm";
import WelcomeModal from "../../../components/WelcomeModal";
import PageHeaderActions from "../../../components/common/PageHeaderActions";
import PackCard from "../../../components/Pack/PackCard";
import { useFetchPack } from "../../../hook/api/useFetchPack";
import { useSocket } from "../../../context/socket.jsx";
import { usePermissions } from "../../../hook/usePermissions";
import { ServerCrash } from "lucide-react";
import "../../../fade.css";

export default function IndexPack() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentPack, setCurrentPack] = useState(null);

  const socket = useSocket();
  const { can } = usePermissions();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useFetchPack();

  const allPacks = data?.packs || [];

  const filteredPacks = useMemo(() => {
    if (searchTerm.trim() === "") {
      return allPacks;
    }
    return allPacks.filter((pack) => 
      pack.libelle?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allPacks, searchTerm]);
  
  const handleSuccess = useCallback(() => {
    setShowModal(false);
    setShowDeleteModal(false);
    setCurrentPack(null);
    queryClient.invalidateQueries({ queryKey: ["packs"] });
  }, [queryClient]);

  useEffect(() => {
    if (!socket) return;
    const handleDataUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ["packs"] });
    };
    socket.on("pack_created", handleDataUpdate);
    socket.on("pack_updated", handleDataUpdate);
    socket.on("pack_deleted", handleDataUpdate);
    return () => {
      socket.off("pack_created", handleDataUpdate);
      socket.off("pack_updated", handleDataUpdate);
      socket.off("pack_deleted", handleDataUpdate);
    };
  }, [socket, queryClient]);

  return (
    <div>
      <WelcomeModal isActive={showModal} onClose={() => setShowModal(false)}>
        <PackForm pack={currentPack} onSuccess={handleSuccess} />
      </WelcomeModal>
      <WelcomeModal isActive={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <DeletePack pack={currentPack} onSuccess={handleSuccess} />
      </WelcomeModal>
       
      <PageHeaderActions
        indexTitle="Gestion des Packs"
        primaryActionLabel="Ajouter un Pack"
        onPrimaryActionClick={() => {
          setCurrentPack(null);
          setShowModal(true);
        }}
        showPrimaryAction={can('createPack')} // Mettez le nom de la permission correspondante
      />

      <div className="col-xl-12">
        <div className="card custom-card">
          <div className="card-body">
            <div className="d-flex justify-content-end mb-4">
              <div className="tw-w-full md:tw-w-80">
                <input
                  className="form-control form-control-xl"
                  type="text"
                  placeholder="Rechercher un pack..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="tw-mt-6">
              {isLoading && (<div className="tw-flex tw-justify-center tw-py-10"><Spinner /></div>)}
              {isError && (<div className="tw-flex tw-flex-col tw-items-center tw-gap-2 tw-text-red-500 tw-py-10"><ServerCrash className="w-w-8 tw-h-8" /><span>{error?.message || "Impossible de charger les données."}</span></div>)}
              {!isLoading && !isError && filteredPacks.length === 0 && (<div className="tw-text-center tw-py-10"><span className="tw-text-gray-500">Aucun pack trouvé.</span></div>)}
              {!isLoading && !isError && filteredPacks.length > 0 && (
                <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 xl:tw-grid-cols-3 tw-gap-6">
                  {filteredPacks.map((item) => (
                    <PackCard
                      key={item.id}
                      item={item}
                      canEdit={can('updatePack')} // Permission correspondante
                      canDelete={can('deletePack')} // Permission correspondante
                      onEdit={() => { setCurrentPack(item); setShowModal(true); }}
                      onDelete={() => { setCurrentPack(item); setShowDeleteModal(true); }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
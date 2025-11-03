import { useState, useMemo, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Spinner from "../../../components/Spinner";
import PageHeaderActions from "../../../components/common/PageHeaderActions";
import AbonnementCard from "../../../components/Abonnement/AbonnementCard";
import Renouvellement from "../../../components/Pack/Renouvellement";
import { useFetchAbonnement } from "../../../hook/api/useFetchAbonnement";
import { useFetchPack } from "../../../hook/api/useFetchPack";
import { useSocket } from "../../../context/socket.jsx";
import { ServerCrash } from "lucide-react";
import "../../../fade.css";

export default function IndexAbonnement() {
  const [searchTerm, setSearchTerm] = useState("");
  const socket = useSocket();
  const queryClient = useQueryClient();
  const user = JSON.parse(localStorage.getItem("user"));
  const companyId = user?.company?.id;

  const { data: abonnementData, isLoading: isLoadingAbonnement, isError: isErrorAbonnement, error: errorAbonnement } = 
    useFetchAbonnement({ companyId });
  const allAbonnements = abonnementData?.abonnements || [];

  const { data: packData, isLoading: isLoadingPacks, isError: isErrorPacks, error: errorPacks } = 
    useFetchPack();
  const allPacks = packData?.packs || [];

  const filteredPacks = useMemo(() => {
    if (searchTerm.trim() === "") {
      return allPacks;
    }
    return allPacks.filter((pack) => 
      pack.libelle?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allPacks, searchTerm]);

  useEffect(() => {
    if (!socket) return;
    if (companyId) socket.emit("join_company_room", companyId);

    const handleAbonnementUpdate = () => queryClient.invalidateQueries({ queryKey: ["abonnements"] });
    const handlePackUpdate = () => queryClient.invalidateQueries({ queryKey: ["packs"] });

    socket.on("abonnement_updated", handleAbonnementUpdate);
    socket.on("pack_created", handlePackUpdate);
    socket.on("pack_updated", handlePackUpdate);
    socket.on("pack_deleted", handlePackUpdate);

    return () => {
      socket.off("abonnement_updated", handleAbonnementUpdate);
      socket.off("pack_created", handlePackUpdate);
      socket.off("pack_updated", handlePackUpdate);
      socket.off("pack_deleted", handlePackUpdate);
    };
  }, [socket, companyId, queryClient]);

  // 👇 CORRECTION : Cette variable est maintenant utilisée
  const isLoading = isLoadingAbonnement || isLoadingPacks;

  return (
    <div>
      <PageHeaderActions indexTitle="Abonnement & Tarifs" />

      {/* 👇 CORRECTION : On utilise la variable de chargement globale ici */}
      {isLoading ? (
        <div className="tw-flex tw-justify-center tw-py-20"><Spinner /></div>
      ) : (
        <div className="col-xl-12 tw-pb-12">
          {/* Section de l'abonnement actuel */}
          <div className="card custom-card">
            <div className="card-header">
              <h4 className="card-title">Mon Abonnement Actuel</h4>
            </div>
            <div className="card-body">
              {isErrorAbonnement && (<div className="tw-flex tw-flex-col tw-items-center tw-gap-2 tw-text-red-500 py-4"><ServerCrash className="w-8 h-8" /><span>{errorAbonnement?.message}</span></div>)}
              {!isErrorAbonnement && allAbonnements.length === 0 && (<div className="tw-text-center py-4"><span className="tw-text-gray-500">Aucun abonnement trouvé.</span></div>)}
              {!isErrorAbonnement && allAbonnements.length > 0 && (
                <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 xl:tw-grid-cols-3 tw-gap-6">
                  {allAbonnements.map((item) => (
                    <AbonnementCard key={item.id} item={item} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Section des packs disponibles */}
          <div className="card custom-card tw-mt-6">
            <div className="card-header justify-content-between">
              <h4 className="card-title">Packs Disponibles</h4>
              <div className="tw-w-full md:tw-w-80">
                  <input
                    className="form-control"
                    type="text"
                    placeholder="Rechercher un pack..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
            </div>
            <div className="card-body">
              {isErrorPacks && (<div className="tw-flex tw-flex-col tw-items-center tw-gap-2 tw-text-red-500 py-4"><ServerCrash className="w-8 h-8" /><span>{errorPacks?.message}</span></div>)}
              {!isErrorPacks && filteredPacks.length === 0 && (<div className="tw-text-center py-4"><span className="tw-text-gray-500">Aucun pack disponible.</span></div>)}
              {!isErrorPacks && filteredPacks.length > 0 && (
                <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 xl:tw-grid-cols-3 tw-gap-6">
                  {filteredPacks.map((item) => (
                    <Renouvellement key={item.id} item={item} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
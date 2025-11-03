import { useState, useCallback, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import PropTypes from "prop-types"; // 👈 N'oubliez pas d'importer PropTypes

import PageHeaderActions from "../../../components/common/PageHeaderActions";
import Pagination from "../../../components/Pagination";
import Spinner from "../../../components/Spinner";
import WelcomeModal from "../../../components/WelcomeModal";
import UpdatePermission from "../../../components/Permission/UpdatePermission";
import { useFetchPermissions } from "../../../hook/api/useFetchPermissions";
import { useSocket } from "../../../context/socket.jsx";
import { usePermissions } from "../../../hook/usePermissions";
import { ServerCrash, ShieldCheck, CheckCircle, XCircle } from "lucide-react";

// Un petit composant interne pour afficher une permission de manière propre
const PermissionItem = ({ label, hasPermission }) => (
  <li className="tw-flex tw-items-center tw-text-sm">
    {hasPermission ? (
      <CheckCircle size={16} className="tw-text-green-500 tw-mr-2 tw-flex-shrink-0" />
    ) : (
      <XCircle size={16} className="tw-text-gray-400 tw-mr-2 tw-flex-shrink-0" />
    )}
    <span className={hasPermission ? 'tw-text-gray-700' : 'tw-text-gray-500'}>{label}</span>
  </li>
);

// 👇 CORRECTION 1: Ajout des propTypes pour PermissionItem
PermissionItem.propTypes = {
  label: PropTypes.string.isRequired,
  hasPermission: PropTypes.bool,
};


export default function IndexPermission() {
  const [page, setPage] = useState(1);
  // 👇 CORRECTION 2: Remplacer useState par une simple constante car setPerPage n'est pas utilisé
  const perpage = 6;
  const [currentPermission, setCurrentPermission] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  const socket = useSocket();
  const { can } = usePermissions();
  const queryClient = useQueryClient();
  const user = JSON.parse(localStorage.getItem("user"));
  const companyId = user?.company?.id;

  const { data, isLoading, isError, error } = useFetchPermissions({
    page,
    perpage,
    companyId,
  });

  const permissions = data?.data || [];
  const meta = data?.meta || { total: 0, currentPage: 1, lastPage: 1 };

  const handleSuccess = useCallback(() => {
    setShowUpdateModal(false);
    setCurrentPermission(null);
    queryClient.invalidateQueries(["permissions"]);
  }, [queryClient]);

  useEffect(() => {
    if (!socket || !companyId) return;
    socket.emit("join_company_room", companyId);

    const handleDataUpdate = () => {
    queryClient.invalidateQueries(["permissions"]);
    };
    socket.on("permissions_updated", handleDataUpdate);
    return () => socket.off("permissions_updated", handleDataUpdate);
  }, [socket, companyId, queryClient]);


  return (
    <div>
      <WelcomeModal isActive={showUpdateModal} onClose={() => setShowUpdateModal(false)}>
        <UpdatePermission permission={currentPermission} onSuccess={handleSuccess} onClose={() => setShowUpdateModal(false)} />
      </WelcomeModal>

      <div className="container-fluid">
        <PageHeaderActions indexTitle="Gestion des Permissions" />

        <div className="col-xl-12">
          <div className="card custom-card mb-5">
            <div className="card-header justify-content-between">
              <div className="card-title">Permissions par Profil</div>
            </div>
            <div className="card-body">
              {isLoading && <div className="tw-flex tw-justify-center tw-py-10"><Spinner /></div>}
              {isError && (
                <div className="tw-flex tw-flex-col tw-items-center tw-gap-2 tw-text-red-500 tw-py-10">
                  <ServerCrash className="tw-w-8 tw-h-8" />
                  <span>{error?.message || "Impossible de charger les permissions."}</span>
                </div>
              )}
              {!isLoading && !isError && permissions.length === 0 && (
                <div className="tw-text-center tw-py-10"><span className="tw-text-gray-500">Aucune permission trouvée.</span></div>
              )}

              {!isLoading && !isError && (
                <div className="tw-grid tw-grid-cols-1 lg:tw-grid-cols-2 xl:tw-grid-cols-3 tw-gap-6">
                  {permissions.map((permission) => (
                    <div key={permission.id} className="tw-bg-white tw-rounded-lg tw-shadow-md tw-border tw-border-gray-200">
                      <div className="tw-flex tw-justify-between tw-items-center tw-p-4 tw-border-b">
                        <div className="tw-flex tw-items-center">
                          <ShieldCheck className="tw-text-violet-600 tw-mr-3" size={24} />
                          <h3 className="tw-text-lg tw-font-bold tw-text-gray-800">{permission.Profil?.wording}</h3>
                        </div>
                        {can('updatePermission') && (
                          <button onClick={() => { setCurrentPermission(permission); setShowUpdateModal(true); }} className="btn btn-icon btn-sm btn-primary-transparent rounded-pill">
                            <i className="ri-edit-line"></i>
                          </button>
                        )}
                      </div>
                      <div className="tw-p-4 tw-grid tw-grid-cols-2 tw-gap-4">
                        <div>
                          <h4 className="tw-font-semibold tw-text-sm tw-mb-2">Général</h4>
                          <ul className="tw-space-y-1">
                            <PermissionItem label="Voir Tableau de bord" hasPermission={permission.readDashboard} />
                            <PermissionItem label="Gérer Permissions" hasPermission={permission.updatePermission} />
                            <PermissionItem label="Renouveler l'abonnement" hasPermission={permission.createAbonnement} />
                            <PermissionItem label="Voir les abonnements" hasPermission={permission.readAbonnement} />
                          </ul>
                        </div>
                        <div>
                          <h4 className="tw-font-semibold tw-text-sm tw-mb-2">Utilisateurs</h4>
                          <ul className="tw-space-y-1">
                            <PermissionItem label="Créer" hasPermission={permission.createUser} />
                            <PermissionItem label="Lire" hasPermission={permission.readUser} />
                            <PermissionItem label="Modifier" hasPermission={permission.updateUser} />
                            <PermissionItem label="Supprimer" hasPermission={permission.deleteUser} />
                          </ul>
                        </div>
                        <div>
                          <h4 className="tw-font-semibold tw-text-sm tw-mb-2">Approvisionnements</h4>
                          <ul className="tw-space-y-1">
                            <PermissionItem label="Créer" hasPermission={permission.createAppro} />
                            <PermissionItem label="Lire" hasPermission={permission.readAppro} />
                            <PermissionItem label="Modifier" hasPermission={permission.updateAppro} />
                            <PermissionItem label="Supprimer" hasPermission={permission.deleteAppro} />
                          </ul>
                        </div>
                        <div>
                          <h4 className="tw-font-semibold tw-text-sm tw-mb-2">Dépenses</h4>
                           <ul className="tw-space-y-1">
                            <PermissionItem label="Créer" hasPermission={permission.createDepense} />
                            <PermissionItem label="Lire" hasPermission={permission.readDepense} />
                            <PermissionItem label="Modifier" hasPermission={permission.updateDepense} />
                            <PermissionItem label="Supprimer" hasPermission={permission.deleteDepense} />
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="tw-font-semibold tw-text-sm tw-mb-2">Types De Dépenses</h4>
                           <ul className="tw-space-y-1">
                            <PermissionItem label="Créer" hasPermission={permission.createTypeDeDepense} />
                            <PermissionItem label="Lire" hasPermission={permission.readTypeDeDepense} />
                            <PermissionItem label="Modifier" hasPermission={permission.updateTypeDeDepense} />
                            <PermissionItem label="Supprimer" hasPermission={permission.deleteTypeDeDepense} />
                          </ul>
                        </div>

                        <div>
                          <h4 className="tw-font-semibold tw-text-sm tw-mb-2">Packs</h4>
                           <ul className="tw-space-y-1">
                            <PermissionItem label="Créer" hasPermission={permission.createPack} />
                            <PermissionItem label="Lire" hasPermission={permission.readPack} />
                            <PermissionItem label="Modifier" hasPermission={permission.updatePack} />
                            <PermissionItem label="Supprimer" hasPermission={permission.deletePack} />
                          </ul>
                        </div>
                        
                         <div className="">
                          <h4 className="tw-font-semibold tw-text-sm tw-mb-2">Actions sur Dépenses</h4>
                           <ul className="tw-space-y-1">
                            <PermissionItem label="Payer" hasPermission={permission.payeDepense} />
                            <PermissionItem label="Rejeter" hasPermission={permission.rejectDepense} />
                            <PermissionItem label="Bloquer" hasPermission={permission.bloqueDepense} />
                            {/* <PermissionItem label="Décharger" hasPermission={permission.dechargeDepense} /> */}
                          </ul>
                        </div>
                         <div className="">
                          <h4 className="tw-font-semibold tw-text-sm tw-mb-2">Editions (Stats Dépenses)</h4>
                           <ul className="tw-space-y-1">
                            <PermissionItem label="Lire" hasPermission={permission.readEdition} />
                            <PermissionItem label="Exporter" hasPermission={permission.exportEdition} />
                          </ul>
                        </div>
                         <div className="">
                          <h4 className="tw-font-semibold tw-text-sm tw-mb-2">Mouvements</h4>
                           <ul className="tw-space-y-1">
                            <PermissionItem label="Lire" hasPermission={permission.readSortie} />
                            <PermissionItem label="Payer" hasPermission={permission.payeDepense} />
                            <PermissionItem label="Rejeter" hasPermission={permission.rejectDepense} />
                            <PermissionItem label="Bloquer" hasPermission={permission.bloqueDepense} />
                            <PermissionItem label="Décharger" hasPermission={permission.dechargeDepense} />
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {meta && meta.total > perpage && (
                <div className="card-footer">
                  <Pagination meta={meta} onPageChange={setPage} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
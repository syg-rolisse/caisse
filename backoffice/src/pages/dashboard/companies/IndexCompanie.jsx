import { useState, useMemo, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import PageHeaderActions from "../../../components/common/PageHeaderActions";
import EmptyState from "../../../components/common/EmptyState";
import Spinner from "../../../components/Spinner";
import UserCard from "../../../components/User/UserCard";
import WelcomeModal from "../../../components/WelcomeModal";
import DeleteUser from "../../../components/User/DeleteUser.jsx";
import UserForm from "../../../components/User/UserForm.jsx";
import AbonnementCard from "../../../components/Abonnement/AbonnementCard";
import { useFetchCompanies } from "../../../hook/api/useFetchCompanies";
import { usePermissions } from "../../../hook/usePermissions";
import { useSocket } from "../../../context/socket.jsx";
import { ServerCrash, SearchX, Search } from "lucide-react";
import CompanyInfoCard from "../../../components/Company/CompanyInfoCard"; // 👈 Importer le nouveau composant
import "../../../fade.css";

export default function IndexCompanie() {
  const [searchTerm, setSearchTerm] = useState("");
  const [setCurrentCompany] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    
  const socket = useSocket();
  const { can } = usePermissions();
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error } = useFetchCompanies();
  const allCompanies = data?.allCompanies || [];

  const filteredCompanies = useMemo(() => {
    if (searchTerm.trim() === "") {
      return allCompanies;
    }
    return allCompanies.filter((company) =>
      company.companyName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allCompanies, searchTerm]);

  useEffect(() => {
    if (!socket) return;

    const handleDataUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
    };

    socket.on("abonnement_updated", handleDataUpdate);
    socket.on("pack_created", handleDataUpdate);
    socket.on("pack_updated", handleDataUpdate);
    socket.on("pack_deleted", handleDataUpdate);

    socket.on("user_created", handleDataUpdate);
    socket.on("user_updated", handleDataUpdate);
    socket.on("user_deleted", handleDataUpdate);

    return () => {
      socket.off("abonnement_updated", handleDataUpdate);
      socket.off("pack_created", handleDataUpdate);
      socket.off("pack_updated", handleDataUpdate);
      socket.off("pack_deleted", handleDataUpdate);
      socket.off("user_created", handleDataUpdate);
      socket.off("user_updated", handleDataUpdate);
      socket.off("user_deleted", handleDataUpdate);
    };
  }, [socket, queryClient]);

  return (
    <div>
      <div className="container-fluid">
        <PageHeaderActions
          indexTitle="Entreprises"
          primaryActionLabel="Ajouter une entreprise"
          onPrimaryActionClick={() => {
            setCurrentCompany(null);
          }}
          showPrimaryAction={can("createCompany")}
        />

        <WelcomeModal isActive={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
          <DeleteUser user={currentUser} onSuccess={() => setShowDeleteModal(false)} onClose={() => setShowDeleteModal(false)} />
        </WelcomeModal>
        <WelcomeModal isActive={showUpdateModal} onClose={() => setShowUpdateModal(false)}>
          <UserForm user={currentUser} onSuccess={() => setShowUpdateModal(false)} onClose={() => setShowUpdateModal(false)} />
        </WelcomeModal>

        <div className="col-xl-12">
          <div className="card custom-card">
            <div className="card-body">
              <div className="d-flex justify-content-end mb-4">
                <div className="tw-w-full tw-relative">
                  {/* L'icône positionnée de manière absolue à l'intérieur du conteneur */}
                  <div className="tw-absolute tw-inset-y-0 tw-left-0 tw-flex tw-items-center tw-pl-3 tw-pointer-events-none">
                    <Search className="tw-h-5 tw-w-5 tw-text-gray-400" />
                  </div>

                  <input
                    className="form-control form-control-xl tw-pl-10" // 👈 Padding à gauche ajouté pour faire de la place à l'icône
                    type="text"
                    placeholder="Rechercher une entreprise..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="tw-mt-6">
                {isLoading && (
                  <div className="tw-flex tw-justify-center tw-py-10">
                    <Spinner />
                  </div>
                )}
                {isError && (
                  <div className="tw-flex tw-flex-col tw-items-center tw-gap-2 tw-text-red-500 tw-py-10">
                    <ServerCrash className="w-8 h-8" />
                    <span>
                      {error?.message ||
                        "Impossible de charger les entreprises."}
                    </span>
                  </div>
                )}
                {!isLoading && !isError && filteredCompanies.length === 0 && (
                  <EmptyState
                    Icon={SearchX}
                    title="Aucun résultat"
                    description="Nous n'avons trouvé aucune entreprise correspondant à votre recherche. Essayez avec d'autres mots-clés."
                  />
                )}

                {!isLoading && !isError && filteredCompanies.length > 0 && (
                  <>
                    {/* SECTION 1 : VUE D'ENSEMBLE DES ENTREPRISES */}
                    <div>
                      <h2 className="tw-text-xl tw-font-semibold tw-mb-4">
                        Toutes les entreprises
                      </h2>
                      <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 xl:tw-grid-cols-4 tw-gap-6">
                        {filteredCompanies.map((company) => (
                          <CompanyInfoCard key={company.id} company={company} />
                        ))}
                      </div>
                    </div>

                    <hr className="tw-my-12" />

                    {/* SECTION 2 : DÉTAILS PAR ENTREPRISE */}
                    <div className="tw-space-y-12">
                      <h2 className="tw-text-xl tw-font-semibold">
                        Entreprises | Utilisateurs | Abonnements
                      </h2>
                      {filteredCompanies.map((company) => (
                        <div
                          key={company.id}
                          className="fade-in card custom-card p-4 mt-4"
                        >
                          <h3 className="tw-text-2xl tw-font-bold tw-text-gray-800">
                            {company.companyName}
                          </h3>
                          <hr className="tw-my-4" />

                          {/* Section Utilisateurs */}
                          <div>
                            <h4 className="tw-text-lg tw-font-semibold tw-mb-4">
                              Utilisateurs
                            </h4>
                            {company.users && company.users.length > 0 ? (
                              <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 xl:tw-grid-cols-4 tw-gap-6">
                                {company.users.map((user) => (
                                  <UserCard
                                    key={user.id}
                                    user={user}
                                    onEdit={() => { setCurrentUser(user); setShowUpdateModal(true); }}
                                    onDelete={() => { setCurrentUser(user); setShowDeleteModal(true); }}
                                  />
                                ))}
                              </div>
                            ) : (
                              <p className="tw-text-gray-500">
                                Aucun utilisateur associé à cette entreprise.
                              </p>
                            )}
                          </div>

                          {/* Section Abonnements */}
                          <div className="tw-mt-8">
                            <h4 className="tw-text-lg tw-font-semibold tw-mb-4">
                              Abonnements
                            </h4>
                            {company.abonnements &&
                            company.abonnements.length > 0 ? (
                              <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 xl:tw-grid-cols-4 tw-gap-6">
                                {company.abonnements.map((item) => (
                                  <AbonnementCard key={item.id} item={item} />
                                ))}
                              </div>
                            ) : (
                              <p className="tw-text-gray-500">
                                Aucun abonnement pour cette entreprise.
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

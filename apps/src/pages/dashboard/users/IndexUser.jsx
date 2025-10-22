import { useState, useMemo, useCallback, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import PageHeaderActions from "../../../components/common/PageHeaderActions";
import Pagination from "../../../components/Pagination";
import Spinner from "../../../components/Spinner";
import DeleteUser from "../../../components/User/DeleteUser";
import UserForm from "../../../components/User/UserForm";
import UserRoleForm from "../../../components/User/UserRoleForm";
import WelcomeModal from "../../../components/WelcomeModal";
import UserCard from "../../../components/User/UserCard"; // 👈 Importer le nouveau composant
import { useFetchUsers } from "../../../hook/api/useFetchUsers";
import { useSocket } from "../../../context/socket.jsx";
import { usePermissions } from "../../../hook/usePermissions";
import { ServerCrash } from "lucide-react";
import "../../../fade.css";

export default function IndexUser() {
  const [page, setPage] = useState(1);
  const [perpage, setPerPage] = useState(6); // Ajusté pour une grille
  const [searchTerm, setSearchTerm] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const socket = useSocket();
  const { can } = usePermissions();
  const queryClient = useQueryClient();
  const loggedInUser = JSON.parse(localStorage.getItem("user"));
  const companyId = loggedInUser?.company?.id;

  const { data, isLoading, isError, error } = useFetchUsers({
    page,
    perpage,
    companyId,
  });

  const users = data?.users?.data || [];
  const allUsers = data?.allUsers || [];
  const meta = data?.users?.meta || { total: 0, currentPage: 1, lastPage: 1 };

  const filteredUsers = useMemo(() => {
    if (searchTerm.trim() === "") {
      return users;
    }
    return allUsers.filter((user) => {
      const searchTermLower = searchTerm.toLowerCase();
      return (
        user.fullName?.toLowerCase().includes(searchTermLower) ||
        user.email?.toLowerCase().includes(searchTermLower)
      );
    });
  }, [users, allUsers, searchTerm]);

  const handleSuccess = useCallback(() => {
    setShowModal(false);
    setShowDeleteModal(false);
    setShowRoleModal(false);
    setCurrentUser(null);
    queryClient.invalidateQueries({ queryKey: ["users"] });
  }, [queryClient]);

  useEffect(() => {
    if (!socket || !companyId) return;
    socket.emit("join_company_room", companyId);

    const handleDataUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    };

    socket.on("user_created", handleDataUpdate);
    socket.on("user_updated", handleDataUpdate);
    socket.on("user_deleted", handleDataUpdate);

    return () => {
      socket.off("user_created", handleDataUpdate);
      socket.off("user_updated", handleDataUpdate);
      socket.off("user_deleted", handleDataUpdate);
    };
  }, [socket, companyId, queryClient]);

  const handlePerPageChange = (e) => {
    setPerPage(Number(e.target.value));
    setPage(1);
  };

  return (
    <div>
      <WelcomeModal isActive={showModal} onClose={() => setShowModal(false)}>
        <UserForm user={currentUser} onSuccess={handleSuccess} onClose={() => setShowModal(false)} />
      </WelcomeModal>
      <WelcomeModal isActive={showRoleModal} onClose={() => setShowRoleModal(false)}>
        <UserRoleForm user={currentUser} onSuccess={handleSuccess} onClose={() => setShowRoleModal(false)} />
      </WelcomeModal>
      <WelcomeModal isActive={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <DeleteUser user={currentUser} onSuccess={handleSuccess} onClose={() => setShowDeleteModal(false)} />
      </WelcomeModal>

      <div className="container-fluid">
        <PageHeaderActions
          indexTitle="Utilisateurs"
          primaryActionLabel="Ajouter un utilisateur"
          onPrimaryActionClick={() => {
            setCurrentUser(null);
            setShowModal(true);
          }}
          showPrimaryAction={can('createUser')}
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
                      placeholder="Rechercher par nom ou email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="tw-mt-6">
                {isLoading && (<div className="tw-flex tw-justify-center tw-py-10"><Spinner /></div>)}
                {isError && (<div className="tw-flex tw-flex-col tw-items-center tw-gap-2 tw-text-red-500 tw-py-10"><ServerCrash className="w-8 h-8" /><span>{error?.message || "Impossible de charger les utilisateurs."}</span></div>)}
                {!isLoading && !isError && filteredUsers.length === 0 && (<div className="tw-text-center tw-py-10"><span className="tw-text-gray-500">Aucun utilisateur trouvé.</span></div>)}

                {!isLoading && !isError && filteredUsers.length > 0 && (
                  <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 xl:tw-grid-cols-4 tw-gap-6">
                    {filteredUsers.map((user) => (
                      <UserCard
                        key={user.id}
                        user={user}
                        // canEdit={can('updateUser')}
                        canDelete={can('deleteUser')}
                        canChangeRole={can('updateUser')}
                        // onEdit={() => { setCurrentUser(user); setShowModal(true); }}
                        onChangeRole={() => { setCurrentUser(user); setShowRoleModal(true); }}
                        onDelete={() => { setCurrentUser(user); setShowDeleteModal(true); }}
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
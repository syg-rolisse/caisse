import { useEffect, useState, useContext } from "react";
import { SocketContext } from "../../../context/socket";
import { useFetchUsers } from "../../../hook/api/useFetchUsers";
import PageHeaderActions from "../../../components/common/PageHeaderActions";
import Pagination from "../../../components/Pagination";
import Spinner from "../../../components/Spinner";
import DeleteUser from "../../../components/User/DeleteUser";
import UserForm from "../../../components/User/UserForm";
import WelcomeModal from "../../../components/WelcomeModal";
import "../../../fade.css";

function IndexUser() {
  const [users, setUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [perpage, setPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const socket = useContext(SocketContext);
  const loggedInUser = JSON.parse(localStorage.getItem("user"));

  const { fetchUsers, isLoading, isError, error, data } = useFetchUsers();

  useEffect(() => {
    fetchUsers({ page, perpage });
  }, [fetchUsers, page, perpage]);

  useEffect(() => {
    if (data) {
      setUsers(data.users.data);
      setAllUsers(data.allUsers);
      setMeta(data.users.meta);
    }
  }, [data]);

  useEffect(() => {
    if (!socket || !loggedInUser?.company?.id) return;
    socket.emit("join_company_room", loggedInUser.company.id);

    const handleDataUpdate = (socketData, action) => {
      if (socketData.companyId !== loggedInUser.company.id) return;

      const newUsersPaginated = socketData.users;
      const newAllUsers = socketData.allUsers;

      if (!newUsersPaginated?.data) {
        console.error(`[ERREUR] Données '${action}' invalides.`);
        return;
      }

      if (action !== "deleted" && newUsersPaginated.data[0]) {
        newUsersPaginated.data[0].isNew = true;
      }

      setUsers(newUsersPaginated.data);
      setAllUsers(newAllUsers);
      setMeta(newUsersPaginated.meta);

      if (action !== "deleted") {
        setTimeout(() => {
          setUsers((currentList) =>
            currentList.map((item, index) =>
              index === 0 ? { ...item, isNew: false } : item
            )
          );
        }, 700);
      }
    };

    socket.on("user_created", (socketData) => handleDataUpdate(socketData, "created"));
    socket.on("user_updated", (socketData) => handleDataUpdate(socketData, "updated"));
    socket.on("user_deleted", (socketData) => handleDataUpdate(socketData, "deleted"));

    return () => {
      socket.off("user_created");
      socket.off("user_updated");
      socket.off("user_deleted");
    };
  }, [socket, loggedInUser?.company.id, page, perpage]);

  const handleSuccess = () => {
    setShowModal(false);
    setShowDeleteModal(false);
    setCurrentUser(null);
  };

  const handlePerPageChange = (e) => {
    setPerPage(Number(e.target.value));
    setPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredUsers =
    searchTerm.trim() === ""
      ? users
      : allUsers.filter((user) => {
          const searchTermLower = searchTerm.toLowerCase();
          return (
            user.fullName?.toLowerCase().includes(searchTermLower) ||
            user.email?.toLowerCase().includes(searchTermLower)
          );
        });

  return (
    <div>
      <WelcomeModal
        isActive={showModal}
        onClose={() => { setShowModal(false); setCurrentUser(null); }}
      >
        <UserForm user={currentUser} onSuccess={handleSuccess} onClose={() => setShowModal(false)} />
      </WelcomeModal>
      <WelcomeModal
        isActive={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setCurrentUser(null); }}
      >
        <DeleteUser user={currentUser} onSuccess={handleSuccess} onClose={() => setShowDeleteModal(false)} />
      </WelcomeModal>

      <div className="container-fluid">
        <PageHeaderActions
          indexTitle="Utilisateurs"
          primaryActionLabel="Ajouter un utilisateur"
          onPrimaryActionClick={() => { setCurrentUser(null); setShowModal(true); }}
        />

        <div className="col-xl-12">
          <div className="card custom-card">
            <div className="card-header justify-content-between">
              <div className="card-title">Liste des utilisateurs</div>
            </div>
            <div className="card-body card-border tw-rounded-md tw-m-5">
              <div className="d-sm-flex mb-4 justify-content-between">
                <div className="tw-flex tw-items-center tw-gap-2 ">
                  <span>Voir</span>
                  <select
                    className="form-select form-select-sm tw-h-10"
                    aria-label="Entries Select"
                    onChange={handlePerPageChange}
                    value={perpage}
                  >
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                  </select>
                </div>
                <div className="d-flex gap-2 mt-sm-0 tw-w-full ">
                  <div className="tw-w-full max-sm:tw-mt-2 tw-ml-3">
                    <input
                      className="form-control form-control-xl"
                      type="text"
                      placeholder="Rechercher par nom ou email..."
                      value={searchTerm}
                      onChange={handleSearchChange}
                    />
                  </div>
                </div>
              </div>
              <div className="table-responsive">
                <table className="customTable table table-bordered text-nowrap mb-0">
                  <thead>
                    <tr>
                      <th className="wd-5p tx-center fw-bold"></th>
                      <th className="wd-5p tw-text-center fw-bold">N°</th>
                      <th className="wd-25p fw-bold">Nom & Prénom | E-mail</th>
                      <th className="wd-25p tw-text-center fw-bold">Photo</th>
                      <th className="fw-bold tw-text-center">Mail valide</th>
                      <th className="fw-bold tw-text-center">Profil</th>
                      <th className="fw-bold tw-text-center">Statut</th>
                      <th className="fw-bold tw-text-center">Ajouté le</th>
                      <th className="fw-bold tw-text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading && (
                      <tr>
                        <td colSpan="9" className="text-center py-5"><Spinner /></td>
                      </tr>
                    )}
                    {isError && (
                      <tr>
                        <td colSpan="9" className="text-center">
                          <span className="tw-text-red-500 tw-font-semibold">
                            Erreur : {error?.message || "Une erreur est survenue"}
                          </span>
                        </td>
                      </tr>
                    )}
                    {!isLoading && !isError && (!filteredUsers || filteredUsers.length === 0) && (
                      <tr>
                        <td colSpan="9" className="text-center">
                          <span className="tw-text-gray-500 tw-font-semibold">
                            Aucun utilisateur trouvé
                          </span>
                        </td>
                      </tr>
                    )}
                    {!isLoading && !isError && filteredUsers && filteredUsers.map((user) => (
                      <tr key={user.id} className={user.isNew ? "fade-in-row" : ""}>
                        <td align="center">
                          <span className="avatar avatar-sm rounded-full shadow-lg">
                            <img src={`/assets/images/users/male/${(user.id % 9) + 1}.jpg`} alt="img" />
                          </span>
                        </td>
                        <td align="center" className="tx-center">
                          <span className="tag tag-orange">{user.id}</span>
                        </td>
                        <td>
                          <div className="tw-font-semibold">{user?.fullName}</div>
                          <div className="tw-text-gray-500 tw-text-sm">{user?.email}</div>
                        </td>
                        <td align="center">
                          <img
                            src={`${import.meta.env.VITE_BACKEND_URL}/uploads/${user?.avatarUrl || "avatars/default.jpg"}`}
                            alt="Avatar"
                            className="tw-w-9 tw-h-9 tw-object-cover tw-rounded-full"
                          />
                        </td>
                        <td className="text-center">
                          <span className={`badge rounded-pill ${user.validEmail ? "bg-success-transparent" : "bg-danger-transparent"}`}>
                            {user.validEmail ? "Valide" : "Invalide"}
                          </span>
                        </td>
                        <td className="text-center">
                          <span className={`badge rounded-pill ${user.Profil?.wording === "Admin" ? "bg-primary-transparent" : "bg-warning-transparent"}`}>
                            {user.Profil?.wording}
                          </span>
                        </td>
                        <td className="text-center">
                          <span className={`badge rounded-pill ${user.status ? "bg-success-transparent" : "bg-danger-transparent"}`}>
                            {user.status ? "Actif" : "Inactif"}
                          </span>
                        </td>
                        <td className="tw-text-center">
                          {new Date(user.createdAt).toLocaleDateString("fr-CA")}
                        </td>
                        <td>
                          <div className="d-flex justify-content-center align-items-center">
                            <a
                              onClick={() => { setCurrentUser(user); setShowModal(true); }}
                              className="btn btn-icon btn-sm btn-primary-transparent rounded-pill"
                            >
                              <i className="ri-edit-line"></i>
                            </a>
                            <a
                              onClick={() => { setCurrentUser(user); setShowDeleteModal(true); }}
                              className="btn btn-icon btn-sm btn-danger-transparent rounded-pill ms-2"
                            >
                              <i className="ri-delete-bin-line"></i>
                            </a>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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

export default IndexUser;
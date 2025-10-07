import { useEffect, useState, useContext } from "react";
import Spinner from "../../../components/Spinner";
import Pagination from "../../../components/Pagination";
import WelcomeModal from "../../../components/WelcomeModal";
import PageHeaderActions from "../../../components/common/PageHeaderActions";
import { useFetchApprovisionnement } from "../../../hook/api/useFetchApprovisionnement";
import { SocketContext } from "../../../context/socket";
import ApprovisionnementForm from "../../../components/Approvisionnement/ApprovisionnementForm"; // Renommé pour la clarté
import DeleteApprovisionnement from "../../../components/Approvisionnement/DeleteApprovisionnement";
import "../../../fade.css";

function IndexApprovisionnement() {
  const [approvisionnements, setApprovisionnements] = useState([]);
  const [allApprovisionnements, setAllApprovisionnements] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [perpage, setPerPage] = useState(5);
  const [currentApprovisionnement, setCurrentApprovisionnement] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  const user = JSON.parse(localStorage.getItem("user"));
  const socket = useContext(SocketContext);

  const { fetchApprovisionnement, isLoading, isError, error, data } = useFetchApprovisionnement();

  useEffect(() => {
    fetchApprovisionnement({ page, perpage });
  }, [fetchApprovisionnement, page, perpage]);

  useEffect(() => {
    if (data && data.approvisionnements) {
      setApprovisionnements(data.approvisionnements.data);
      setAllApprovisionnements(data.allApprovisionnements || []);
      setMeta(data.approvisionnements.meta);
    }
  }, [data]);

  useEffect(() => {
    console.log("user", user);
    
    if (!socket || !user?.company?.id) return;
    socket.emit("join_company_room", user.company.id);

    const handleDataUpdate = (socketData, action) => {
      if (socketData.companyId !== user.company.id) return;

      const newApprovisionnements = socketData.approvisionnements;
      const newAllApprovisionnements = socketData.allApprovisionnements;

      if (!newApprovisionnements?.data) return;

      if (action !== "deleted" && newApprovisionnements.data[0]) {
        newApprovisionnements.data[0].isNew = true;
      }

      setApprovisionnements(newApprovisionnements.data);
      setAllApprovisionnements(newAllApprovisionnements);
      setMeta(newApprovisionnements.meta);

      if (action !== "deleted") {
        setTimeout(() => {
          setApprovisionnements((currentList) =>
            currentList.map((item, index) =>
              index === 0 ? { ...item, isNew: false } : item
            )
          );
        }, 700);
      }
    };

    socket.on("approvisionnement_created", (socketData) => handleDataUpdate(socketData, "created"));
    socket.on("approvisionnement_updated", (socketData) => handleDataUpdate(socketData, "updated"));
    socket.on("approvisionnement_deleted", (socketData) => handleDataUpdate(socketData, "deleted"));

    return () => {
      socket.off("approvisionnement_created");
      socket.off("approvisionnement_updated");
      socket.off("approvisionnement_deleted");
    };
  }, [socket, user?.company.id, page, perpage]);

  const handlePerPageChange = (e) => {
    setPerPage(Number(e.target.value));
    setPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredApprovisionnements =
    searchTerm.trim() === ""
      ? approvisionnements
      : allApprovisionnements.filter((item) => {
          const searchTermLower = searchTerm.toLowerCase();
          return (
            item.wording?.toLowerCase().includes(searchTermLower) ||
            item.montant?.toString().includes(searchTermLower) ||
            item.user?.fullName?.toLowerCase().includes(searchTermLower)
          );
        });

  const handleSuccess = () => {
    setShowModal(false);
    setShowDeleteModal(false);
    setCurrentApprovisionnement(null);
  };

  return (
    <div>
      <WelcomeModal
        isActive={showModal}
        onClose={() => { setShowModal(false); setCurrentApprovisionnement(null); }}
      >
        <ApprovisionnementForm approvisionnement={currentApprovisionnement} onSuccess={handleSuccess} onClose={() => setShowModal(false)} />
      </WelcomeModal>
      <WelcomeModal
        isActive={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setCurrentApprovisionnement(null); }}
      >
        <DeleteApprovisionnement approvisionnement={currentApprovisionnement} onSuccess={handleSuccess} onClose={() => setShowDeleteModal(false)} />
      </WelcomeModal>
      
      <div className="container-fluid">
        <PageHeaderActions
          indexTitle="Approvisionnements"
          primaryActionLabel="Faire un approvisionnement"
          onPrimaryActionClick={() => { setCurrentApprovisionnement(null); setShowModal(true); }}
        />

        <div className="col-xl-12">
          <div className="card custom-card">
            <div className="card-header justify-content-between">
              <div className="card-title">Liste des approvisionnements</div>
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
                      placeholder="Rechercher ici..."
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
                      <th className="wd-25p fw-bold">Montant</th>
                      <th className="wd-25p fw-bold">Saisi par</th>
                      <th className="wd-25p fw-bold">Message</th>
                      <th className="fw-bold tw-text-center">Date d&apos;ajout</th>
                      <th className="fw-bold tw-text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading && (
                      <tr>
                        <td colSpan="7" className="text-center py-5"><Spinner /></td>
                      </tr>
                    )}
                    {isError && (
                      <tr>
                        <td colSpan="7" className="text-center">
                          <span className="tw-text-red-500 tw-font-semibold">
                            Erreur : {error?.message || "Une erreur est survenue"}
                          </span>
                        </td>
                      </tr>
                    )}
                    {!isLoading && !isError && filteredApprovisionnements.length === 0 && (
                       <tr>
                        <td colSpan="7" className="text-center">
                          <span className="tw-text-gray-500 tw-font-semibold">
                            Aucune donnée disponible
                          </span>
                        </td>
                      </tr>
                    )}
                    {!isLoading && !isError && filteredApprovisionnements.map((item) => (
                      <tr key={item.id} className={item.isNew ? "fade-in-row" : ""}>
                        <td align="center">
                          <span className="avatar avatar-sm rounded-full shadow-lg">
                             <img src={`/assets/images/users/male/${(item.id % 9) + 1}.jpg`} alt="img" />
                          </span>
                        </td>
                        <td align="center" className="tx-center">
                          <span className="tag tag-orange">{item.id}</span>
                        </td>
                        <td className="tw-font-semibold tw-text-lg">
                          {item.montant?.toLocaleString()} F
                        </td>
                        <td>
                          <div className="tw-font-medium">{item.user?.fullName}</div>
                        </td>
                        <td>
                          <div>{item.wording}</div>
                        </td>
                        <td className="tw-text-center">
                          {new Date(item.createdAt).toLocaleDateString("fr-CA")}
                        </td>
                        <td>
                          <div className="d-flex justify-content-center align-items-center">
                            <a
                              onClick={() => { setCurrentApprovisionnement(item); setShowModal(true); }}
                              className="btn btn-icon btn-sm btn-primary-transparent rounded-pill"
                            >
                              <i className="ri-edit-line"></i>
                            </a>
                            <a
                              onClick={() => { setCurrentApprovisionnement(item); setShowDeleteModal(true); }}
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
              {meta && meta.total > perpage && searchTerm.trim() === "" && (
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

export default IndexApprovisionnement;
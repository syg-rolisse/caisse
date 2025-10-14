import { useEffect, useState, useContext } from "react";
import Spinner from "../../../components/Spinner";
import DeleteTypeDeDepense from "../../../components/Type-depense/DeleteTypeDeDepense";
import TypeDeDepenseForm from "../../../components/Type-depense/TypeDeDepenseForm";
import Pagination from "../../../components/Pagination";
import WelcomeModal from "../../../components/WelcomeModal";
import PageHeaderActions from "../../../components/common/PageHeaderActions";
import { useFetchTypeDepense } from "../../../hook/api/useFetchTypeDepense";
import { SocketContext } from "../../../context/socket";
import "../../../fade.css"; // IMPORTANT: Contient l'animation CSS

function IndexTypeDepense() {
  const [typeDeDepense, setTypeDepense] = useState([]);
  const [allTypeDeDepense, setAllTypeDepense] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [perpage, setPerPage] = useState(5);
  const [currentTypeDepense, setCurrentTypeDepense] = useState();
  const [searchTerm, setSearchTerm] = useState("");
  const user = JSON.parse(localStorage.getItem("user"));
  const socket = useContext(SocketContext);

  const { fetchTypeDepense, isLoading, isError, error, data } =
    useFetchTypeDepense();

  useEffect(() => {
    fetchTypeDepense({ page, perpage });
  }, [fetchTypeDepense, page, perpage]);

  useEffect(() => {
    if (data) {
      setTypeDepense(data.typeDepenses.data);
      setAllTypeDepense(data.allTypeDepenses);
      setMeta(data.typeDepenses.meta);
    }
  }, [data]);

  // --- Gestion du Socket ---
  useEffect(() => {
    if (!socket || !user?.company?.id) return;

    socket.emit("join_company_room", user.company.id);

    const handleDataUpdate = (data, action) => {
      if (data.companyId !== user.company.id) return;

      console.log(`[SOCKET] Données '${action}' reçues :`, data);

      const newTypeDepense = data.typeDepenses;
      const newAllTypeDepense = data.allTypeDepenses;

      if (!newTypeDepense?.data) {
        console.error(`[ERREUR] Données '${action}' invalides.`);
        return;
      }

      if (action !== "deleted" && newTypeDepense.data[0]) {
        newTypeDepense.data[0].isNew = true;
      }

      setTypeDepense(newTypeDepense.data);
      setAllTypeDepense(newAllTypeDepense);
      setMeta(newTypeDepense.meta);

      if (action !== "deleted") {
        setTimeout(() => {
          setTypeDepense((currentList) =>
            currentList.map((item, index) =>
              index === 0 ? { ...item, isNew: false } : item
            )
          );
        }, 700);
      }
    };

    socket.on("type_depense_created", (data) =>
      handleDataUpdate(data, "created")
    );
    socket.on("type_depense_updated", (data) =>
      handleDataUpdate(data, "updated")
    );
    socket.on("type_depense_deleted", (data) =>
      handleDataUpdate(data, "deleted")
    );

    return () => {
      socket.off("type_depense_created");
      socket.off("type_depense_updated");
      socket.off("type_depense_deleted");
    };
  }, [socket, user?.company.id, perpage, page]);

  const handlePerPageChange = (e) => {
    setPerPage(Number(e.target.value));
    setPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredTypeDepense =
    searchTerm.trim() === ""
      ? typeDeDepense
      : allTypeDeDepense.filter((type) => {
          const searchTermLower = searchTerm.toLowerCase();
          return (
            type.wording?.toLowerCase().includes(searchTermLower) ||
            type.id.toString().includes(searchTerm) ||
            type.user?.fullName?.toLowerCase().includes(searchTermLower) ||
            new Date(type.createdAt)
              .toLocaleDateString("fr-CA")
              .includes(searchTerm)
          );
        });

  const handleSuccess = () => {
    setShowModal(false);
    setShowDeleteModal(false);
    setCurrentTypeDepense(null);
  };

  return (
    <div>
      <WelcomeModal
        isActive={showModal}
        onClose={() => {
          setShowModal(false);
          setCurrentTypeDepense(null);
        }}
      >
        <TypeDeDepenseForm
          typeDepense={currentTypeDepense}
          onSuccess={handleSuccess}
        />
      </WelcomeModal>
      <WelcomeModal
        isActive={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
      >
        <DeleteTypeDeDepense
          typeDepense={currentTypeDepense}
          onSuccess={handleSuccess}
          onClose={() => setShowDeleteModal(false)}
        />
      </WelcomeModal>
       
      <PageHeaderActions
          indexTitle="Type de dépense"
          primaryActionLabel="Ajouter un type de dépense"
          onPrimaryActionClick={() => setShowModal(true)} // La magie est ici !
        />

      <div className="">
        

        <div className="col-xl-12">
          <div className="card custom-card">
            <div className="card-header justify-content-between">
              <div className="card-title">Liste des types de dépenses</div>
              <div className="btn-group btn-sm"></div>
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

                <div className="d-flex gap-2 mt-sm-0  tw-w-full ">
                  <div className="tw-w-full max-sm:tw-mt-2 tw-ml-3">
                    <input
                      className="form-control form-control-xl"
                      type="text"
                      placeholder="Faite une recherche ici..."
                      aria-label=".form-control-xl example"
                      value={searchTerm}
                      onChange={handleSearchChange}
                    />
                  </div>
                </div>
              </div>
              <div className="table-responsive">
                <div>
                  <table
                    className="customTable table table-bordered text-nowrap mb-0"
                    id="projectSummary"
                  >
                    <thead>
                      <tr>
                        <th className="wd-5p tx-center fw-bold"></th>
                        <th className="wd-5p tw-text-center fw-bold">N°</th>
                        <th className="wd-25p fw-bold">Intitulé</th>
                        <th className="wd-25p fw-bold">Saisir par</th>
                        <th className="fw-bold tw-text-center">Ajouter le</th>
                        <th className="fw-bold tw-text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isLoading && (
                        <tr>
                          <td colSpan="6" className="text-center">
                            <Spinner />
                          </td>
                        </tr>
                      )}
                      {isError && (
                        <tr>
                          <td colSpan="6" className="text-center">
                            <span className="tw-text-red-500 tw-bg-white tw-font-semibold tw-p-2 tw-rounded-md">
                              Erreur :{" "}
                              {error?.message || "Une erreur est survenue"}
                            </span>
                          </td>
                        </tr>
                      )}
                      {!isLoading &&
                        !isError &&
                        filteredTypeDepense?.length === 0 && (
                          <tr>
                            <td colSpan="6" className="text-center">
                              <span className="tw-text-gray-500 tw-font-semibold">
                                Aucune donnée disponible
                              </span>
                            </td>
                          </tr>
                        )}

                      {!isLoading &&
                        !isError &&
                        filteredTypeDepense?.map((typeDeDepense) => (
                          <tr
                            key={typeDeDepense.id}
                            className={typeDeDepense.isNew ? "fade-in-row" : ""}
                          >
                            <td align="center">
                              <span className="avatar avatar-sm rounded-full shadow-lg w-6 h-6 overflow-hidden tw-mt-3">
                                <img
                                  src="assets/images/icons/std1.jpg"
                                  alt="img"
                                  className="w-6 h-6 object-cover"
                                />
                              </span>
                            </td>

                            <td align="center" className="tx-center">
                              <span className="tag tag-orange">
                                {typeDeDepense.id}
                              </span>
                            </td>
                            <td>
                              <span className="">{typeDeDepense.wording}</span>
                            </td>
                            <td>
                              <span className="">
                                {typeDeDepense.user?.fullName}
                              </span>
                            </td>

                            <td className="tw-text-center">
                              {new Date(
                                typeDeDepense.createdAt
                              ).toLocaleDateString("fr-CA", {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                              })}
                            </td>

                            <td className="">
                              <div className="d-flex justify-content-center align-items-center">
                                <a
                                  onClick={() => {
                                    setCurrentTypeDepense(typeDeDepense);
                                    setShowModal(true);
                                  }}
                                  className="btn btn-icon btn-sm btn-primary-transparent rounded-pill tw-ml-2"
                                >
                                  <i className="ri-edit-line"></i>
                                </a>
                                <a
                                  onClick={() => {
                                    setCurrentTypeDepense(typeDeDepense);
                                    setShowDeleteModal(true);
                                  }}
                                  className="btn btn-icon btn-sm btn-danger-transparent rounded-pill tw-ml-2"
                                >
                                  <i className="ri-delete-bin-2-line"></i>
                                </a>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                  <div className="card-footer tw-mt-5">
                    <Pagination meta={meta} onPageChange={setPage} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default IndexTypeDepense;

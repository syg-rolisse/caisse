import { useMutation } from "@tanstack/react-query";
import { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import CreateDepense from "../../../components/Depense/CreateDepense";
import DeleteDepense from "../../../components/Depense/DeleteDepense";
import Spinner from "../../../components/Spinner";
import axiosInstance from "../../../config/axiosConfig";
import { SocketContext } from "../../../context/socket";
import useSocketEvents from "../../../components/UseSocketEvents";

const IndexDepense = () => {
  const socket = useContext(SocketContext);
  const [page, setPage] = useState(1);
  const [currentDeleteDepenseId, setCurrentDeleteDepenseId] = useState();
  const [currentDepenseId, setCurrentDepenseId] = useState();
  const [perpage, setPerPage] = useState(10);
  const [meta, setMeta] = useState([]);
  const [depenses, setDepenses] = useState();
  const [allDepense, setAllDepense] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
 
  const {shouldRefreshDepense} = useSocketEvents()

  const user = JSON.parse(localStorage.getItem("user"));
  const handleEditClick = (depenseId) => {
    setCurrentDepenseId(depenseId);
  };

  const handlePerPageChange = (e) => {
    setPerPage(Number(e.target.value));
    setPage(1);
  };

  const handleDeleteClick = (depenseId) => {
    setCurrentDeleteDepenseId(depenseId);
  };

  const fetchDepense = useMutation(
    (params) =>
      axiosInstance.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/all_depense?page=${
          params.page
        }&companieId=${user?.company?.id}&perpage=${params.perpage}`
      ),
    {
      onSuccess: (response) => {
        if (response?.data?.message) {
          toast.error(response?.data?.message, { duration: 5000 });
        }

        setDepenses(response?.data?.depenses?.data);
        setAllDepense(response?.data?.allDepenses);
        setMeta(response?.data?.depenses?.meta);
      },
      onError: (error) => {
        toast.error(error?.response?.data?.error, { autoClose: 1000 });
      },
    }
  );

  const refreshDepense = () => {
    setCurrentDepenseId(null);
    fetchDepense.mutate({ page, perpage });
    setCurrentDeleteDepenseId(null);
  };

  useEffect(()=> {
    refreshDepense()
  },[shouldRefreshDepense])

  useEffect(() => {
    if (socket) {
      // Écoute des événements pour rafraîchir les données
      const handleSocketEvent = () => {
        fetchDepense.mutate({ page, perpage }); // Rafraîchir les données
      };

      socket.on("user_created", handleSocketEvent);
      socket.on("user_deleted", handleSocketEvent);

      socket.on("thematique_created", handleSocketEvent);
      socket.on("thematique_deleted", handleSocketEvent);

      return () => {
        socket.off("user_created", handleSocketEvent);
        socket.off("user_deleted", handleSocketEvent);

        socket.off("test_created", handleSocketEvent);

        socket.off("thematique_created", handleSocketEvent);
        socket.off("thematique_deleted", handleSocketEvent);
      };
    }
  }, [socket, fetchDepense]);

  useEffect(() => {
    fetchDepense.mutate({ page, perpage }); // Récupérer les données initiales lors du montage du composant
  }, []);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value); // Update search term
  };

  const filteredDepense =
    searchTerm.trim() === ""
      ? allDepense // Retourne typeDeDepense complet si le searchTerm est vide
      : depenses.filter((type) => {
          const isWordingMatch = type.wording
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
          const isTypeDepense = type.typeDeDepense?.wording
            .toString()
            .includes(searchTerm);
          const isFullNameMatch = type.user?.fullName
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase());
          const isDateMatch = new Date(type.createdAt)
            .toLocaleDateString("fr-CA", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            })
            .includes(searchTerm);

          return (
            isWordingMatch || isTypeDepense || isFullNameMatch || isDateMatch
          );
        });

  return (
    <div className="">
      <div className="p-3 header-secondary row">
        <div className="col">
          <div className="d-flex">
            <a
              className="btn tw-bg-orange-600 tw-text-white tw-flex tw-justify-center tw-items-center"
              href="#"
            >
              <i className="fe fe-rotate-cw me-1 mt-1"></i> CAISSE PRATIQUE
            </a>
          </div>
        </div>
        <div className="col col-auto">
          <div className="btn-list max-sm:tw-hidden">
            <a className="btn btn-outline-light border" href="#">
              <i className="fe fe-help-circle me-1 mt-1"></i> Support
            </a>
            <a
              className="btn tw-bg-green-600 tw-text-white tw-font-semibold me-0"
              href="#"
            >
              <i className="bx bx-key side-menu__icon"></i> Performance
            </a>
          </div>
        </div>
      </div>
      <div className="container-fluid">
        {/* page-header */}
        {/* Page Header */}
        <div className="d-md-flex d-block align-items-center justify-content-between my-4 page-header-breadcrumb">
          <div className="">
            <div className="">
              <nav>
                <ol className="breadcrumb mb-1 mb-md-0">
                  <li className="breadcrumb-item">
                    <a href="#">Index</a>
                  </li>
                  <li className="breadcrumb-item active" aria-current="page">
                    Liste des depenses
                  </li>
                </ol>
              </nav>
            </div>
          </div>
          <div className="ms-auto pageheader-btn">
            <nav>
              <div className="breadcrumb mb-0">
                <div className="d-flex">
                  <div className="input-group me-2">
                    {/* <div className="input-group-text text-muted bg-primary text-fixed-white me-0 border-0 pe-0">
                      <i className="ri-calendar-line mt-1"></i>
                    </div>
                    <input
                      type="text"
                      className="form-control flatpickr-input bg-primary text-fixed-white border-0 ps-2"
                      id="daterange"
                      placeholder="Ajouter une dépense"
                    /> */}

                    <div className="btn-group btn-sm">
                      <CreateDepense
                        currentDepenseId={currentDepenseId}
                        refreshDepense={refreshDepense}
                      />
                    </div>
                  </div>
                  <a
                    href="#"
                    className="btn btn-secondary text-fixed-white"
                    data-bs-toggle="tooltip"
                    title=""
                    data-placement="bottom"
                    data-original-title="Rating"
                  >
                    <span>
                      <i className="fe fe-star"></i>
                    </span>
                  </a>
                </div>
              </div>
            </nav>
          </div>
        </div>
        {/* Page Header Close */}

        {/* End page-header */}

        <div className="tw-flex tw-items-center tw-gap-4 tw-my-4 tw-w-full">
          {/* Section Afficher */}
          <div className="tw-flex tw-items-center tw-gap-2">
            <span>Afficher</span>
            <select
              className="form-select form-select-sm tw-h-10 tw-w-20"
              aria-label="Entries Select"
              onChange={handlePerPageChange}
              value={perpage}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>

          {/* Section Recherche */}
          <div className="tw-flex-1">
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
        <div className="row">
          {fetchDepense.isLoading && (
            <div className="col-12 text-center">
              <Spinner />
            </div>
          )}
          {fetchDepense.isError && (
            <div className="col-12 text-center">
              <span className="tw-text-red-500 tw-bg-white tw-font-semibold tw-p-2 tw-rounded-md">
                Erreur : {fetchDepense.errorMessage}
              </span>
            </div>
          )}
          {!fetchDepense.isLoading &&
            !fetchDepense.isError &&
            filteredDepense?.length === 0 && (
              <div className="col-12 text-center">
                <span className="tw-bg-red-500 tw-text-white tw-p-3 tw-rounded-md tw-flex tw-mb-3 tw-items-center tw-justify-center">
                  <i className="fe fe-alert-circle me-2 tw-text-white"></i>
                  Aucune donnée disponible
                </span>
              </div>
            )}
          {!fetchDepense.isLoading &&
            !fetchDepense.isError &&
            filteredDepense?.length > 0 &&
            filteredDepense?.map((depense, index) => (
              <div
                className="col-sm-12 col-md-6 col-lg-4 col-xxl-3"
                key={index}
              >
                <div className="card custom-card">
                  <div className="card-header justify-content-between">
                    <div>
                      <div className="card-title">
                        {depense?.user?.fullName}
                      </div>
                    </div>
                    <div className="card-options">
                      <div className="form-check form-check-md form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          role="switch"
                          id={`flexSwitchCheckCheckedp-${index}`}
                          defaultChecked={depense.status}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="d-flex">
                      <div className="">
                        <h6 className="text-muted">Montant Total</h6>
                        <h3 className="text-dark count mt-0 font-30 mb-0 tw-py-4 tw-font-semibold">
                          {depense.montant.toLocaleString()} CFA
                        </h3>

                        <div className="tw-space-x-4 tw-mb-3 tw-flex tw-items-center">
                          <span className="tag tw-bg-orange-500 tw-text-white tw-font-bold">
                            {depense?.typeDeDepense?.wording}
                          </span>
                        </div>
                      </div>
                      <div className="ms-auto">
                        <div className="tw-pl-2">
                          <span>
                            {new Date(depense.createdAt).toLocaleString(
                              "fr-CA",
                              {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                              }
                            )}
                          </span>
                        </div>
                        <div className="tw-pl-2 tw-my-2">
                          <h3
                            className={`badge badge-sm rounded-pill ${
                              !depense.rejeter
                                ? "bg-success-transparent text-success"
                                : "bg-danger-transparent text-danger"
                            }`}
                          >
                            {!depense.rejeter ? "Dépense Approuvé" : "Rejeté"}
                          </h3>
                        </div>
                        <div className="d-flex justify-content-start align-items-center tw-mt-4">
                          {/* <a
                            onClick={() => handleConstaClick(depense.id)}
                            className="btn btn-icon btn-sm btn-success-transparent rounded-pill tw-ml-2"
                          >
                            <ConstaDepense
                              constaId={constaId}
                              refreshDepense={refreshDepense}
                            />
                            <i className="ri-check-line"></i>
                          </a> */}
                          <a
                            onClick={() => handleEditClick(depense.id)}
                            className="btn btn-icon btn-sm btn-primary-transparent rounded-pill tw-ml-2"
                          >
                            <i className="ri-edit-line"></i>
                          </a>
                          <a
                            onClick={() => handleDeleteClick(depense.id)}
                            className="btn btn-icon btn-sm btn-danger-transparent rounded-pill tw-ml-2"
                          >
                            <i className="ri-delete-bin-line"></i>
                          </a>

                          {depense?.factureUrl ? (
                            <a
                              className="btn btn-icon btn-sm btn-success-transparent rounded-pill tw-ml-2 tw-flex tw-justify-center tw-items-center"
                              href={`${
                                import.meta.env.VITE_BACKEND_URL
                              }/uploads/${depense?.factureUrl}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <i className="bx bx-download tw-text-green-600 tw-text-lg header-link-icon"></i>
                            </a>
                          ) : (
                            <span
                              className="btn btn-icon btn-sm btn-danger-transparent rounded-pill tw-ml-2 tw-flex tw-justify-center tw-items-center"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <i className="bx bx-x-circle tw-text-red-600 tw-text-lg header-link-icon"></i>
                            </span>
                          )}

                          {/* {depense?.factureUrl && (
                            <a
                              className="btn btn-icon btn-sm btn-success-transparent rounded-pill tw-ml-2"
                              href={`${
                                import.meta.env.VITE_BACKEND_URL
                              }/uploads/${depense?.factureUrl}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <i className="bx bx-download tw-text-green-600 tw-text-lg header-link-icon"></i>
                            </a>
                          )} */}
                          {currentDeleteDepenseId && (
                            <DeleteDepense
                              currentDeleteDepenseId={currentDeleteDepenseId}
                              refreshDepense={refreshDepense}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                    <span className="">{depense?.wording}</span>
                  </div>
                  <div className="card-footer">
                    <div className="">
                      {depense.decharger && (
                        <span className="tw-ml-3 float-start badge badge-sm rounded-pill bg-success-transparent text-success">
                          Déchargé
                        </span>
                      )}

                      <span
                        className={`btn tw-absolute tw-bottom-4 -tw-left-1 btn-icon btn-sm btn-transparent rounded-pill tw-ml-2 ${
                          depense.bloquer ? "text-success" : "text-danger"
                        }`}
                      >
                        <i
                          className={`fa ${
                            depense.bloquer ? "fa-lock" : "fa-unlock"
                          } fa-sm tw-mr-2`}
                        ></i>
                      </span>
                    </div>

                    {depense.status ? (
                      <span className="float-end">
                        <i className="fe fe-arrow-up text-success me-1"></i>
                        {depense.montant.toLocaleString("fr-FR")} Payé
                      </span>
                    ) : (
                      <span className="float-end text-danger px-2 tw-rounded-md">
                        <i className="fe fe-arrow-down text-danger me-1"></i>
                        {Math.max(
                          0,
                          depense.montant -
                            (depense.Mouvements?.reduce(
                              (total, mouvement) => total + mouvement.montant,
                              0
                            ) || 0)
                        ).toLocaleString("fr-FR")}
                        &nbsp;Impayé
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
        </div>

        <div className="card-footer">
          <div className="d-flex align-items-center">
            <div>
              Afficher les {perpage} suivant
              <i className="bi bi-arrow-right ms-2 fw-semibold"></i>
            </div>
            <div className="ms-auto">
              <nav aria-label="Page navigation" className="pagination-style-4">
                <ul className="pagination mb-0">
                  <li
                    className={`page-item ${
                      meta?.previousPageUrl ? "" : "disabled"
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => setPage(meta?.currentPage - 1)}
                      disabled={!meta?.previousPageUrl}
                    >
                      Prev
                    </button>
                  </li>
                  {[...Array(meta?.lastPage).keys()].map((num) => (
                    <li
                      key={num + 1}
                      className={`page-item ${
                        meta?.currentPage === num + 1 ? "active" : ""
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() => setPage(num + 1)}
                      >
                        {num + 1}
                      </button>
                    </li>
                  ))}
                  <li
                    className={`page-item ${
                      meta?.nextPageUrl ? "" : "disabled"
                    }`}
                  >
                    <button
                      className="page-link text-primary"
                      onClick={() => setPage(meta?.currentPage + 1)}
                      disabled={!meta?.nextPageUrl}
                    >
                      Next
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndexDepense;

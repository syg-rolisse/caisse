import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import BloquerDepense from "../../../components/Sortie/BloquerDepense";
import CreateSortie from "../../../components/Sortie/CreateSortie";
import DeleteSortie from "../../../components/Sortie/DeleteSortie";
import RejeteDepense from "../../../components/Sortie/RejeteDepense";
import Spinner from "../../../components/Spinner";
import axiosInstance from "../../../config/axiosConfig";
function IndexSortie() {
  const [sortie, setSortie] = useState([]);
  const [meta, setMeta] = useState([]);
  const [page, setPage] = useState(1);
  const [perpage, setPerPage] = useState(5);
  const [currentSortieId, setSortieId] = useState();
  const [currentDepenseId, setCurrentDepenseId] = useState();
  const [currentDeleteSortieId, setDeleteSortieId] = useState();
  const [currentRejeteDepenseId, setRejeteDepenseId] = useState();
  const [currentBloquereDepenseId, setBloquereDepenseId] = useState();
  const [errorMessage, setErrorMessage] = useState();
  const [allDepense, setAllDepense] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const user = JSON.parse(localStorage.getItem("user"));
  const fetchSortie = useMutation(
    (params) =>
      axiosInstance.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/all_depense?page=${
          params.page
        }}&companieId=${user?.company?.id}&perpage=${params.perpage}`
      ),
    {
      onSuccess: (response) => {
        console.log(response);

        if (response?.data?.message) {
          toast.error(response?.data?.message, { duration: 5000 });
        }

        setSortie(response?.data?.depenses?.data);
        setAllDepense(response?.data?.allDepenses);
        setMeta(response?.data?.depenses?.meta);
      },
      onError: (error) => {
        if (error?.response?.data?.error.includes("Désolé")) {
          toast.error(error?.response?.data?.error, { duration: 5000 });
          setErrorMessage(error.response.data);
        } else {
          setErrorMessage(error.response.data)?.error;
          toast.error(error?.response?.data?.error, { autoClose: 1000 });
        }
      },
    }
  );

  const refreshSortie = () => {
    setSortieId(null);
    fetchSortie.mutate({ page, perpage });
    setDeleteSortieId(null);
    setRejeteDepenseId(null);
    setBloquereDepenseId(null);
  };

  useEffect(() => {
    fetchSortie.mutate({ page, perpage });
  }, [page, perpage]);

  const handleAddClick = (depenseId) => {
    setCurrentDepenseId(depenseId);
  };

  const handleEditClick = (sortieId) => {
    setSortieId(sortieId);
  };

  const handleDeleteClick = (depenseId) => {
    setDeleteSortieId(depenseId);
  };

  const handleRejetDepenseClick = (depenseId) => {
    setRejeteDepenseId(depenseId);
  };

  const handleBloquerDepenseClick = (depenseId) => {
    setBloquereDepenseId(depenseId);
  };

  const handlePerPageChange = (e) => {
    setPerPage(Number(e.target.value));
    setPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value); // Update search term
  };

  const filteredDepense =
    searchTerm.trim() === ""
      ? allDepense // Retourne typeDeDepense complet si le searchTerm est vide
      : sortie.filter((type) => {
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
    <div>
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
            <div className="btn-list">
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

        <div className="container-fluid tw-mt-4">
          <div className="col-xl-12">
            <div className="card custom-card">
              <div className="card-header justify-content-between">
                <div className="card-title">Dépenses | Sortie</div>
                <div className="btn-group btn-sm">
                  <CreateSortie
                    currentSortieId={currentSortieId}
                    currentDepenseId={currentDepenseId}
                    refreshSortie={refreshSortie}
                  />
                </div>
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
                          <th className="fw-bold tw-text-center">Action</th>
                          <th className="wd-5p tw-text-center fw-bold">N°</th>
                          <th className="wd-25p fw-bold">Intitulé</th>
                          <th className="wd-25p fw-bold">Type de dépense</th>
                          <th className="wd-25p fw-bold">Facture</th>
                          <th className="wd-25p fw-bold">Montant</th>
                          <th className="wd-25p fw-bold">Décharge</th>
                          <th className="wd-25p fw-bold">Status</th>
                          <th className="wd-25p fw-bold">Approbation</th>
                          <th className="wd-25p fw-bold">Bloquer</th>
                          <th className="wd-25p fw-bold">Mouvement</th>
                          <th className="wd-25p fw-bold">Saisir par</th>
                          <th className="fw-bold tw-text-center">Ajouter le</th>
                          <th className="fw-bold tw-text-center">
                            Modifier le
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {fetchSortie.isLoading && (
                          <tr>
                            <td colSpan="14" className="text-center">
                              <Spinner />
                            </td>
                          </tr>
                        )}
                        {fetchSortie.isError && (
                          <tr>
                            <td colSpan="14" className="text-center">
                              <span className="tw-text-red-500 tw-bg-white tw-font-semibold tw-p-2 tw-rounded-md">
                                Erreur : {errorMessage}
                              </span>
                            </td>
                          </tr>
                        )}
                        {!fetchSortie.isLoading &&
                          !fetchSortie.isError &&
                          filteredDepense?.map((sortie, index) => (
                            <tr key={index}>
                              <td align="center">
                                <span className="avatar avatar-sm rounded-full shadow-lg w-6 h-6 overflow-hidden tw-mt-3">
                                  <img
                                    src="assets/images/icons/std1.jpg"
                                    alt="img"
                                    className="w-6 h-6 object-cover"
                                  />
                                </span>
                              </td>

                              <td className="">
                                <div className="d-flex justify-content-center align-items-center">
                                  {currentRejeteDepenseId && (
                                    <RejeteDepense
                                      currentRejeteDepenseId={
                                        currentRejeteDepenseId
                                      }
                                      refreshSortie={refreshSortie}
                                    />
                                  )}

                                  <button
                                    onClick={() =>
                                      handleRejetDepenseClick(sortie.id)
                                    }
                                    disabled={
                                      sortie?.status ||
                                      sortie.Mouvements.length > 0
                                    }
                                    className="btn btn-sm tw-ml-2 btn-primary-transparent d-flex align-items-center"
                                  >
                                    <i className="ri-edit-line tw-mr-1"></i>
                                    {sortie?.rejeter
                                      ? "Annuler le rejet"
                                      : "Rejeté"}
                                  </button>

                                  <button
                                    onClick={() =>
                                      !sortie.bloquer &&
                                      handleAddClick(sortie.id)
                                    }
                                    className={`btn btn-sm tw-ml-2 d-flex align-items-center ${
                                      sortie.status
                                        ? "btn-secondary cursor-not-allowed opacity-50"
                                        : "btn-primary-transparent"
                                    }`}
                                    disabled={sortie.status}
                                  >
                                    {!sortie.bloquer && (
                                      <i className="ri-add-line tw-mr-1"></i>
                                    )}
                                    {sortie.bloquer ? "Déjà payé" : "Payé"}
                                  </button>

                                  <a
                                    onClick={() =>
                                      handleBloquerDepenseClick(sortie.id)
                                    }
                                    className="btn btn-sm tw-ml-2 btn-primary-transparent d-flex align-items-center"
                                  >
                                    <i
                                      className={`fa ${
                                        sortie?.bloquer
                                          ? "fa-unlock"
                                          : "fa-lock"
                                      } fa-sm tw-mr-1`}
                                    ></i>
                                    {sortie?.bloquer ? "Débloquer" : "Bloquer"}
                                  </a>

                                  {currentBloquereDepenseId && (
                                    <BloquerDepense
                                      currentBloquerDepenseId={
                                        currentBloquereDepenseId
                                      }
                                      refreshSortie={refreshSortie}
                                    />
                                  )}
                                </div>
                              </td>

                              <td align="center" className="tx-center">
                                <span className="tag tag-orange">
                                  {sortie.id}
                                </span>
                              </td>
                              <td>
                                <span className="">{sortie.wording}</span>
                              </td>
                              <td className="tw-text-center">
                                <span className="bg-primary-transparent text-primary tw-rounded-md tw-p-1">
                                  {sortie?.typeDeDepense?.wording}
                                </span>
                              </td>

                              <td className="tw-text-center">
                                {sortie?.factureUrl ? (
                                  <a
                                    className="btn btn-icon btn-sm btn-success-transparent rounded-pill tw-ml-2 tw-flex tw-justify-center tw-items-center"
                                    href={`${
                                      import.meta.env.VITE_BACKEND_URL
                                    }/uploads/${sortie?.factureUrl}`}
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
                              </td>
                              <td className="tw-text-center ">
                                <span className="tw-font-bold">
                                  {sortie.montant.toLocaleString()}
                                </span>
                              </td>
                              <td className="tw-text-center ">
                                <span
                                  className={`badge badge-sm rounded-pill ${
                                    sortie.decharger
                                      ? "bg-success-transparent text-success"
                                      : "bg-danger-transparent text-danger"
                                  }`}
                                >
                                  {sortie.decharger ? "Oui" : "Non"}
                                </span>
                              </td>
                              <td className="tw-text-center ">
                                <span
                                  className={`badge badge-sm rounded-pill ${
                                    sortie.status
                                      ? "bg-success-transparent text-success"
                                      : "bg-danger-transparent text-danger"
                                  }`}
                                >
                                  {sortie.status ? "Payé" : "impayé"}
                                </span>
                              </td>
                              <td className="tw-text-center ">
                                <span
                                  className={`badge badge-sm rounded-pill ${
                                    !sortie.rejeter
                                      ? "bg-success-transparent text-success"
                                      : "bg-danger-transparent text-danger"
                                  }`}
                                >
                                  {!sortie.rejeter ? "Approuver" : "Rejeter"}
                                </span>
                              </td>
                              <td className="tw-text-center">
                                <span
                                  className={`d-flex align-items-center justify-content-center ${
                                    sortie.bloquer
                                      ? "text-success"
                                      : "text-danger"
                                  }`}
                                >
                                  {/* Utilisation de Font Awesome avec les icônes lock et unlock et taille légèrement réduite */}
                                  <i
                                    className={`fa ${
                                      sortie.bloquer ? "fa-lock" : "fa-unlock"
                                    } fa-lg tw-mr-1`}
                                  ></i>
                                </span>
                              </td>

                              <td className="" align="center">
                                <div className="pay-column">
                                  {sortie.Mouvements.length > 0 ? (
                                    sortie.Mouvements.map(
                                      (mouvement, index) => (
                                        <div
                                          key={index}
                                          className="tw-mb-1 tw-text-sm tw-font-medium tw-border tw-p-2 tw-rounded-md my-3"
                                        >
                                          <div className="tw-flex tw-justify-between tw-w-full tw-items-center">
                                            <div>
                                              <span className="badge badge-md rounded-pill bg-success-transparent text-success">
                                                {mouvement.montant.toLocaleString(
                                                  "fr-FR"
                                                )}
                                              </span>
                                            </div>
                                            <div>
                                              <h5 className="">
                                                décaissé le &nbsp;
                                                {new Date(
                                                  mouvement.createdAt
                                                ).toLocaleString("fr-CA", {
                                                  year: "numeric",
                                                  month: "2-digit",
                                                  day: "2-digit",
                                                  hour: "2-digit",
                                                  minute: "2-digit",
                                                  second: "2-digit",
                                                })}
                                              </h5>
                                            </div>
                                            <div>
                                              <a
                                                onClick={() =>
                                                  handleEditClick(mouvement.id)
                                                }
                                                className="btn btn-icon btn-sm btn-primary-transparent rounded-pill tw-ml-2"
                                              >
                                                <i className="ri-edit-line"></i>
                                              </a>
                                              <a
                                                onClick={() =>
                                                  handleDeleteClick(
                                                    mouvement.id
                                                  )
                                                }
                                                className="btn btn-icon btn-sm btn-danger-transparent rounded-pill tw-ml-2"
                                              >
                                                <i className="ri-delete-bin-line"></i>
                                              </a>

                                              {currentDeleteSortieId && (
                                                <DeleteSortie
                                                  currentDeleteSortieId={
                                                    currentDeleteSortieId
                                                  }
                                                  refreshSortie={refreshSortie}
                                                />
                                              )}
                                            </div>
                                          </div>

                                          <p>{mouvement?.wording}</p>
                                        </div>
                                      )
                                    )
                                  ) : (
                                    <span className="badge badge-sm rounded-pill bg-warning-transparent text-warning">
                                      <i className="ri-information-line tw-mr-1"></i>
                                      En attente
                                    </span>
                                  )}
                                </div>
                              </td>

                              <td>
                                <span className="">
                                  {sortie.user?.fullName}
                                </span>
                              </td>

                              <td className="tw-text-center">
                                {new Date(sortie.createdAt).toLocaleString(
                                  "fr-CA",
                                  {
                                    year: "numeric",
                                    month: "2-digit",
                                    day: "2-digit",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    second: "2-digit",
                                  }
                                )}
                              </td>
                              <td className="tw-text-center">
                                {new Date(sortie.updatedAt).toLocaleString(
                                  "fr-CA",
                                  {
                                    year: "numeric",
                                    month: "2-digit",
                                    day: "2-digit",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    second: "2-digit",
                                  }
                                )}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div className="card-footer">
                <div className="d-flex align-items-center">
                  <div>
                    Afficher les {perpage} suivant
                    <i className="bi bi-arrow-right ms-2 fw-semibold"></i>
                  </div>
                  <div className="ms-auto">
                    <nav
                      aria-label="Page navigation"
                      className="pagination-style-4"
                    >
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
        </div>
      </div>
    </div>
  );
}

export default IndexSortie;

import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import CreateApprovisionnement from "../../../components/Approvisionnement/CreateApprovisionnement";
import DeleteApprovisionnement from "../../../components/Approvisionnement/DeleteApprovisionnement";
import Spinner from "../../../components/Spinner";
import axiosInstance from "../../../config/axiosConfig";
function IndexApprovisionnement() {
  const [approvisionnement, setApprovisionnement] = useState([]);
  const [meta, setMeta] = useState([]);
  const [page, setPage] = useState(1);
  const [perpage, setPerPage] = useState(5);
  const [currentApprovisionnementId, setApprovisionnementId] = useState();
  const [currentDeleteApprovisionnementId, setDeleteApprovisionnementId] =
    useState();
  const [errorMessage, setErrorMessage] = useState();

  const user = JSON.parse(localStorage.getItem("user"));

  const fetchApprovisionnements = useMutation(
    (params) =>
      axiosInstance.get(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/v1/all_approvisionnement?page=${params.page}&companieId=${
          user?.company?.id
        }&perpage=${params.perpage}`
      ),
    {
      onSuccess: (response) => {
        if (response?.data?.message) {
          toast.error(response?.data?.message, { duration: 5000 });
        }

        setApprovisionnement(response?.data?.data);
        setMeta(response?.data?.meta);
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

  const refreshApprovisionnement = () => {
    setApprovisionnementId(null);
    fetchApprovisionnements.mutate({ page, perpage });
    setDeleteApprovisionnementId(null);
  };

  useEffect(() => {
    fetchApprovisionnements.mutate({ page, perpage });
  }, [page, perpage]);

  const handleEditClick = (provisionId) => {
    setApprovisionnementId(provisionId);
  };

  const handleDeleteClick = (provisionId) => {
    setDeleteApprovisionnementId(provisionId);
  };

  const handlePerPageChange = (e) => {
    setPerPage(Number(e.target.value));
    setPage(1);
  };

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
                <div className="card-title">Liste des approvisionnements</div>
                <div className="btn-group btn-sm">
                  <CreateApprovisionnement
                    currentApprovisionnementId={currentApprovisionnementId}
                    refreshApprovisionnement={refreshApprovisionnement}
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
                          <th className="wd-25p fw-bold">Montant</th>
                          <th className="wd-25p fw-bold">Saisir par</th>
                          <th className="wd-25p fw-bold">Message</th>
                          <th className="fw-bold tw-text-center">Ajouter le</th>
                          <th className="fw-bold tw-text-center">
                            Modifier le
                          </th>
                          <th className="fw-bold tw-text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {fetchApprovisionnements.isLoading && (
                          <tr>
                            <td colSpan="8" className="text-center">
                              <Spinner />
                            </td>
                          </tr>
                        )}
                        {fetchApprovisionnements.isError && (
                          <tr>
                            <td colSpan="8" className="text-center">
                              <span className="tw-text-red-500 tw-bg-white tw-font-semibold tw-p-2 tw-rounded-md">
                                Erreur : {errorMessage}
                              </span>
                            </td>
                          </tr>
                        )}
                        {!fetchApprovisionnements.isLoading &&
                          !fetchApprovisionnements.isError &&
                          approvisionnement.length === 0 && (
                            <tr>
                              <td colSpan="8" className="text-center">
                                <span className="tw-text-gray-500 tw-bg-white tw-font-medium tw-p-2 tw-rounded-md">
                                  Aucune donnée disponible.
                                </span>
                              </td>
                            </tr>
                          )}
                        {!fetchApprovisionnements.isLoading &&
                          !fetchApprovisionnements.isError &&
                          approvisionnement.map((approvisionnement, index) => (
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
                              <td align="center" className="tx-center">
                                <span className="tag tag-orange">
                                  {approvisionnement.id}
                                </span>
                              </td>
                              <td className="tw-text-center">
                                <strong className="tw-text-lg">
                                  {approvisionnement.montant?.toLocaleString()}
                                </strong>
                              </td>
                              <td>
                                <span className="">
                                  {approvisionnement.user?.fullName}
                                </span>
                              </td>
                              <td>
                                <span className="">
                                  {approvisionnement.wording}
                                </span>
                              </td>
                              <td className="tw-text-center">
                                {new Date(
                                  approvisionnement.createdAt
                                ).toLocaleDateString("fr-CA", {
                                  year: "numeric",
                                  month: "2-digit",
                                  day: "2-digit",
                                })}
                              </td>
                              <td className="tw-text-center">
                                {new Date(
                                  approvisionnement.updatedAt
                                ).toLocaleString("fr-CA", {
                                  year: "numeric",
                                  month: "2-digit",
                                  day: "2-digit",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  second: "2-digit",
                                })}
                              </td>

                              <td className="">
                                <div className="d-flex justify-content-center align-items-center">
                                  <a
                                    onClick={() =>
                                      handleEditClick(approvisionnement.id)
                                    }
                                    className="btn btn-icon btn-sm btn-primary-transparent rounded-pill tw-ml-2"
                                  >
                                    <i className="ri-edit-line"></i>
                                  </a>
                                  <a
                                    onClick={() =>
                                      handleDeleteClick(approvisionnement.id)
                                    }
                                    className="btn btn-icon btn-sm btn-danger-transparent rounded-pill tw-ml-2"
                                  >
                                    <i className="ri-delete-bin-line"></i>
                                  </a>
                                  {currentDeleteApprovisionnementId && (
                                    <DeleteApprovisionnement
                                      currentDeleteApprovisionnementId={
                                        currentDeleteApprovisionnementId
                                      }
                                      refreshApprovisionnement={
                                        refreshApprovisionnement
                                      }
                                    />
                                  )}
                                </div>
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
                            meta.previousPageUrl ? "" : "disabled"
                          }`}
                        >
                          <button
                            className="page-link"
                            onClick={() => setPage(meta.currentPage - 1)}
                            disabled={!meta.previousPageUrl}
                          >
                            Prev
                          </button>
                        </li>
                        {[...Array(meta.lastPage).keys()].map((num) => (
                          <li
                            key={num + 1}
                            className={`page-item ${
                              meta.currentPage === num + 1 ? "active" : ""
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
                            meta.nextPageUrl ? "" : "disabled"
                          }`}
                        >
                          <button
                            className="page-link text-primary"
                            onClick={() => setPage(meta.currentPage + 1)}
                            disabled={!meta.nextPageUrl}
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

export default IndexApprovisionnement;

import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import FilterCard from "../../components/EditionCard/FilterCard";
import ExportToExcelButton from "../../components/ExportToExcelButton";
//import ExportToPDFButton from "../../components/ExportToPDFButton";
import axiosInstance from "../../config/axiosConfig";

const Editions = () => {
  const [depenses, setTypeDepense] = useState([]);
  const [users, setUsers] = useState([]);

  const [columnVisibility, setColumnVisibility] = useState({
    typeDepense: true,
    id: true,
    montant: true,
    wording: true,
    facture: true,
    decharger: true,
    user: true,
    status: true,
    decaissement: true,
    approbation: true,
    bloquer: true,
    createdAt: true,
  });

  const fetchUsers = useMutation(
    () =>
      axiosInstance.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/allUsers`),
    {
      onSuccess: (response) => {
        setUsers(response?.data?.data);
      },
      onError: (error) => {
        if (error.response.data.includes("Désolé")) {
          toast.error(error.response?.data, { duration: 5000 });
        } else {
          toast.error(error?.response?.data?.error, { autoClose: 1000 });
        }
      },
    }
  );

  useEffect(() => {
    fetchUsers.mutate();
  }, []);

  const handleFilterChange = (data) => {
    setTypeDepense(data);
  };

  // Toggle column visibility
  const toggleColumnVisibility = (column) => {
    setColumnVisibility((prevState) => ({
      ...prevState,
      [column]: !prevState[column],
    }));
  };

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

      <div className="container-fluid">
        <div className="d-md-flex d-block align-items-center justify-content-between my-4 page-header-breadcrumb">
          <div className="">
            <div className="">
              <nav>
                <ol className="breadcrumb mb-1 mb-md-0">
                  <li className="breadcrumb-item">
                    <a href="#">Index</a>
                  </li>
                  <li className="breadcrumb-item active" aria-current="page">
                    Editions
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
                    <div className="input-group-text text-muted bg-primary text-fixed-white me-0 border-0 pe-0">
                      <i className="ri-calendar-line mt-1"></i>
                    </div>
                    <input
                      type="text"
                      className="form-control flatpickr-input bg-primary text-fixed-white border-0 ps-2"
                      id="daterange"
                      placeholder="Paramètres"
                    />
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

        <div className="row">
          <FilterCard
            users={users}
            onTypeDeDepenseChange={handleFilterChange}
          />
        </div>

        <div className="table-responsive tw-my-5 tw-mb-20">
          <div className="tw-border tw-p-3 tw-rounded-md">
            <div className="tw-mb-4 tw-space-x-3">
              <ExportToExcelButton tableId="projectSummary" />
              {/* <ExportToPDFButton tableId="projectSummary" /> */}
            </div>
            <div className="d-flex mb-3 w-100">
              {Object.keys(columnVisibility).map((column, index) => (
                <div key={index} className="me-3 flex-grow-1">
                  <input
                    type="checkbox"
                    checked={columnVisibility[column]}
                    onChange={() => toggleColumnVisibility(column)}
                  />
                  <label className="ms-2">
                    {column.replace(/([A-Z])/g, " $1")}
                  </label>
                </div>
              ))}
            </div>
            <table
              className="customTable table table-bordered text-nowrap mb-0"
              id="projectSummary"
            >
              <thead>
                <tr>
                  {columnVisibility.typeDepense && (
                    <th className="wd-5p tw-text-center fw-bold">
                      Type de depense
                    </th>
                  )}
                  {columnVisibility.id && (
                    <th className="wd-25p fw-bold">N°</th>
                  )}
                  {columnVisibility.montant && (
                    <th className="wd-25p fw-bold">Montant</th>
                  )}
                  {columnVisibility.wording && (
                    <th className="wd-25p fw-bold">Dépense</th>
                  )}
                  {columnVisibility.facture && (
                    <th className="wd-25p fw-bold">Facture</th>
                  )}
                  {columnVisibility.decharger && (
                    <th className="wd-25p fw-bold">Décharge</th>
                  )}
                  {columnVisibility.user && (
                    <th className="wd-25p fw-bold">Saisir par</th>
                  )}
                  {columnVisibility.status && (
                    <th className="wd-25p fw-bold">Status</th>
                  )}
                  {columnVisibility.decaissement && (
                    <th className="wd-25p fw-bold">Décaissement</th>
                  )}
                  {columnVisibility.approbation && (
                    <th className="wd-25p fw-bold">Approbation</th>
                  )}
                  {columnVisibility.bloquer && (
                    <th className="wd-25p fw-bold">Bloquer</th>
                  )}
                  {columnVisibility.createdAt && (
                    <th className="fw-bold tw-text-center">Ajouter le</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {depenses.map((depense, index) => {
                  // Vérifiez si le typeDeDepense précédent est le même pour décider d'afficher ou non la cellule avec rowspan
                  const showTypeDeDepenseCell =
                    index === 0 ||
                    depenses[index - 1].typeDeDepense.wording !==
                      depense.typeDeDepense.wording;

                  // Calculez le rowspan pour le typeDeDepense actuel
                  const rowspanCount = depenses.filter(
                    (d) =>
                      d.typeDeDepense.wording === depense.typeDeDepense.wording
                  ).length;

                  return (
                    <tr key={index}>
                      {showTypeDeDepenseCell && (
                        <td rowSpan={rowspanCount} align="center">
                          <span className="">
                            {depense.typeDeDepense.wording}
                          </span>
                        </td>
                      )}
                      {columnVisibility.id && (
                        <td align="center">
                          <span className="tag tag-orange">{depense.id}</span>
                        </td>
                      )}
                      {columnVisibility.montant && (
                        <td className="tw-text-center">
                          <span className="tw-font-bold">
                            {depense.montant}
                          </span>
                        </td>
                      )}
                      {columnVisibility.wording && (
                        <td className="">
                          <span className="tw-font-bold">
                            {depense.wording}
                          </span>
                        </td>
                      )}

                      <td align="center">
                        {depense?.factureUrl ? (
                          <a
                            className="btn btn-icon btn-sm btn-success-transparent rounded-pill tw-flex tw-justify-center tw-items-center"
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
                            className="btn btn-icon btn-sm btn-danger-transparent rounded-pill tw-flex tw-justify-center tw-items-center"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <i className="bx bx-x-circle tw-text-red-600 tw-text-lg header-link-icon"></i>
                          </span>
                        )}
                      </td>
                      {columnVisibility.decharger && (
                        <td className="tw-text-center">
                          <span
                            className={`badge badge-sm rounded-pill ${
                              depense.decharger
                                ? "bg-success-transparent text-success"
                                : "bg-danger-transparent text-danger"
                            }`}
                          >
                            {depense.decharger ? "Oui" : "Non"}
                          </span>
                        </td>
                      )}
                      {columnVisibility.user && (
                        <td className="">
                          <span className="tw-font-bold">
                            {depense?.user?.fullName}
                          </span>
                        </td>
                      )}
                      {columnVisibility.status && (
                        <td className="tw-text-center">
                          <span
                            className={`badge badge-sm rounded-pill ${
                              depense.status
                                ? "bg-success-transparent text-success"
                                : "bg-danger-transparent text-danger"
                            }`}
                          >
                            {depense.status ? "Payé" : "impayé"}
                          </span>
                        </td>
                      )}
                      {columnVisibility.decaissement && (
                        <td className="" align="center">
                          <div className="pay-column">
                            {depense.Mouvements.length > 0 ? (
                              depense.Mouvements.map((mouvement, index) => (
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
                                  </div>
                                  <p>{mouvement?.wording}</p>
                                </div>
                              ))
                            ) : (
                              <span className="badge badge-sm rounded-pill bg-warning-transparent text-warning">
                                <i className="ri-information-line tw-mr-2"></i>
                                En attente
                              </span>
                            )}
                          </div>
                        </td>
                      )}
                      {columnVisibility.approbation && (
                        <td className="tw-text-center">
                          <span
                            className={`badge badge-sm rounded-pill ${
                              !depense.rejeter
                                ? "bg-success-transparent text-success"
                                : "bg-danger-transparent text-danger"
                            }`}
                          >
                            {!depense.rejeter ? "Approuver" : "Rejeter"}
                          </span>
                        </td>
                      )}
                      {columnVisibility.bloquer && (
                        <td className="tw-text-center">
                          <span
                            className={`d-flex align-items-center justify-content-center ${
                              depense.bloquer ? "text-success" : "text-danger"
                            }`}
                          >
                            <i
                              className={`fa ${
                                depense.bloquer ? "fa-lock" : "fa-unlock"
                              } fa-lg tw-mr-2`}
                            ></i>
                            {depense.bloquer ? "Bloqué" : "Débloqué"}
                          </span>
                        </td>
                      )}
                      {columnVisibility.createdAt && (
                        <td className="tw-text-center">
                          <span className="">{depense.createdAt}</span>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Editions;

import { useMutation } from "@tanstack/react-query";
import { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import FilterCard from "../../components/DashboardCard/FilterCard";
import axiosInstance from "../../config/axiosConfig";
import { SocketContext } from "../../context/socket";

const Dashboard = () => {
  const socket = useContext(SocketContext);
  const [solde, setSolde] = useState([]);
  const [totalTypeDepense, setTotalTypeDepense] = useState([]);
  const [users, setUsers] = useState([]);
  const [typeDeDepense, setTypeDepense] = useState([]);
  const [statusSummary, setStatusSummary] = useState({
    activeUsers: 0,
    inactiveUsers: 0,
  });
  const [profilSummary, setProfilSummary] = useState({
    admin: 0,
    employe: 0,
    secretaire: 0,
  });
  const [approvisionnementSummary, setApprovisionnementSummary] = useState({
    total: 0,
    dernierMontant: 0,
  });

  const user = JSON.parse(localStorage.getItem("user"));

  // const fetchTypeDepenses = useMutation(
  //   () =>
  //     axiosInstance.get(
  //       `${import.meta.env.VITE_BACKEND_URL}/api/v1/totalTypeDepense`
  //     ),
  //   {
  //     onSuccess: (response) => {
  //       //console.log(response?.data);

  //       setTypeDepense(response?.data);
  //     },
  //     onError: (error) => {
  //       if (error?.response?.data?.error.includes("Désolé")) {
  //         toast.error(error?.response?.data?.error, { duration: 5000 });
  //         setErrorMessage(error.response.data);
  //       } else {
  //         setErrorMessage(error.response.data)?.error;
  //         toast.error(error?.response?.data?.error, { autoClose: 1000 });
  //       }
  //     },
  //   }
  // );

  const fetchDashboardData = useMutation(
    () =>
      axiosInstance.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/dashboardInfos?companieId=${
          user?.company?.id
        }`
      ),
    {
      onSuccess: (response) => {
        if (response?.data?.message) {
          toast.error(response?.data?.message, { duration: 5000 });
        }

        setSolde(response?.data?.solde);
        setTotalTypeDepense(response?.data?.totalTypeDepense);
        setUsers(response?.data?.users);
        setStatusSummary(response?.data.statusSummary || {});
        setApprovisionnementSummary(
          response?.data.approvisionnementSummary || {}
        );
        setProfilSummary(response?.data.profilSummary || {});
      },
      onError: (error) => {
        toast.error(error?.response?.data?.error, { autoClose: 1000 });
      },
    }
  );

  // useEffect(() => {
  //   fetchTypeDepenses.mutate();
  // }, []);

  useEffect(() => {
    if (socket) {
      // Écoute des événements pour rafraîchir les données
      const handleSocketEvent = () => {
        fetchDashboardData.mutate(); // Rafraîchir les données
      };

      socket.on("user_created", handleSocketEvent);
      socket.on("user_deleted", handleSocketEvent);

      socket.on("approvisionnement_created", handleSocketEvent);
      socket.on("approvisionnement_deleted", handleSocketEvent);
      socket.on("approvisionnement_updated", handleSocketEvent);

      socket.on("depense_created", handleSocketEvent);
      socket.on("depense_deleted", handleSocketEvent);
      socket.on("depense_updated", handleSocketEvent);

      socket.on("sortie_created", handleSocketEvent);
      socket.on("sortie_deleted", handleSocketEvent);
      socket.on("sortie_updated", handleSocketEvent);

      return () => {
        socket.off("user_created", handleSocketEvent);
        socket.off("user_deleted", handleSocketEvent);

        socket.off("test_created", handleSocketEvent);

        socket.off("depense_created", handleSocketEvent);
        socket.off("depense_updated", handleSocketEvent);
        socket.off("depense_deleted", handleSocketEvent);

        socket.off("approvisionnement_created", handleSocketEvent);
        socket.off("approvisionnement_updated", handleSocketEvent);
        socket.off("approvisionnement_deleted", handleSocketEvent);

        socket.off("sortie_created", handleSocketEvent);
        socket.off("sortie_updated", handleSocketEvent);
        socket.off("sortie_deleted", handleSocketEvent);
      };
    }
  }, [socket, fetchDashboardData]);

  const handleFilterChange = (data) => {
    console.log(data);

    setTypeDepense(data);
  };

  useEffect(() => {
    fetchDashboardData.mutate(); // Récupérer les données initiales lors du montage du composant
  }, []);

  return (
    <div className="">
      <div className="p-3 header-secondary row ">
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
                    Tableau de board
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

          <div className="col-sm-12 col-md-6 col-lg-6 col-xxl-3">
            <div className="card custom-card">
              <div className="card-header justify-content-between">
                <div>
                  <div className="card-title">Utilisateurs</div>
                </div>
                <div className="card-options">
                  <div className="form-check form-check-md form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      role="switch"
                      id="flexSwitchCheckCheckedp"
                      defaultChecked
                    />
                  </div>
                </div>
              </div>
              <div className="p-3">
                <div className="d-flex">
                  <div>
                    <h6 className="text-muted">Total utilisateurs</h6>
                    <h3 className="text-dark count mt-0 font-30 mb-0">
                      {statusSummary.activeUsers + statusSummary.inactiveUsers}
                    </h3>

                    <div className="tw-mt-2 tw-space-x-4">
                      <span className="tag tw-bg-orange-500 tw-text-white tw-font-bold">
                        {profilSummary.admin} A
                      </span>
                      <span className="tag tw-bg-green-600 tw-text-white tw-font-bold">
                        {profilSummary.employe} E
                      </span>
                      <span className="tag tw-bg-orange-500 tw-text-white tw-font-bold">
                        {profilSummary.secretaire} S
                      </span>
                    </div>
                  </div>
                  <span className="ms-auto" id="total-projects"></span>
                </div>
              </div>
              <div className="card-footer">
                <span className="text-start">
                  <i className="fe fe-arrow-up text-success me-1"></i>
                  {statusSummary.activeUsers} Actifs
                </span>
                <span className="float-end">
                  <i className="fe fe-arrow-down text-danger me-1"></i>
                  {statusSummary.inactiveUsers} Inactifs
                </span>
              </div>
            </div>
          </div>

          <div className="col-sm-12 col-md-6 col-lg-6 col-xxl-3">
            <div className="card custom-card">
              <div className="card-header justify-content-between">
                <div>
                  <div className="card-title">SOLDE CAISSE</div>
                </div>
                <div className="card-options">
                  <div className="form-check form-check-md form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      role="switch"
                      id="flexSwitchCheckCheckedp"
                      defaultChecked
                    />
                  </div>
                </div>
              </div>
              <div className="p-3">
                <div className="d-flex">
                  <div>
                    <h6 className="text-muted">Solde Actuel</h6>

                    <div className="tw-mt-2 tw-space-x-4">
                      <span
                        className={`tag tw-font-bold ${
                          solde <= 0 ? "tw-bg-red-600" : "tw-bg-green-600"
                        } tw-text-white`}
                      >
                        {solde?.toLocaleString()}
                        {/* Ajout du séparateur de milliers */}
                      </span>
                    </div>
                  </div>
                  <span className="ms-auto" id="total-earnings"></span>
                </div>
              </div>

              <div className="card-footer">
                <span className="text-start">
                  <i className="fa fa-money text-success me-1"></i>
                  Cash Flow
                </span>
                {solde > 0 ? (
                  <span className="float-end">
                    <i className="fe fe-arrow-up text-success me-1"></i>
                    Positif
                  </span>
                ) : (
                  <span className="float-end btn btn-sm btn-danger-transparent rounded-pill">
                    <i className="fe fe-arrow-down text-danger me-1"></i>
                    Négatif
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="col-sm-12 col-md-6 col-lg-6 col-xxl-3">
            <div className="card custom-card">
              <div className="card-header justify-content-between">
                <div>
                  <div className="card-title">Approvisionnements</div>
                </div>
                <div className="card-options">
                  <div className="form-check form-check-md form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      role="switch"
                      id="flexSwitchCheckChecked"
                      defaultChecked
                    />
                  </div>
                </div>
              </div>
              <div className="p-3">
                <div className="d-flex">
                  <div>
                    <h6 className="text-muted">Solde Actuel</h6>

                    <div className="tw-mt-2 tw-space-x-4">
                      <span className="tag tw-font-bold tw-bg-green-600 tw-text-white">
                        {approvisionnementSummary.total?.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <span className="ms-auto" id="total-tasks"></span>
                </div>
              </div>
              <div className="card-footer">
                <span className="text-start">
                  <i className="fa fa-money text-success me-1"></i>
                  {approvisionnementSummary.dernierMontant?.toLocaleString()}
                </span>
                <span className="float-end">
                  <i className="fa fa-calendar text-primary me-1"></i>

                  {new Date(approvisionnementSummary.du).toLocaleDateString(
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
                </span>
              </div>
            </div>
          </div>
          <div className="col-sm-12 col-md-6 col-lg-6 col-xxl-3 ">
            <div className="card custom-card ">
              <div className="card-header justify-content-between">
                <div>
                  <div className="card-title">Type De Dépenses</div>
                </div>
                <div className="card-options">
                  <div className="form-check form-check-md form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      role="switch"
                      id="flexSwitchCheckChecked"
                      defaultChecked
                    />
                  </div>
                </div>
              </div>
              <div className="p-3">
                <div className="d-flex">
                  <div>
                    <h6 className="text-muted">Nombre de type de dépense</h6>

                    <div className="tw-mt-2 tw-space-x-4">
                      <span className="tag tw-font-bold tw-bg-green-600 tw-text-white">
                        {totalTypeDepense}
                      </span>
                    </div>
                  </div>

                  <span className="ms-auto" id="total-tasks"></span>
                </div>
              </div>
              <div className="card-footer">
                <span className="text-start">
                  <i className="fa fa-money text-success me-1"></i>
                  {approvisionnementSummary.dernierMontant?.toLocaleString()}
                </span>
                <span className="float-end">
                  <i className="fa fa-calendar text-primary me-1"></i>

                  {new Date(approvisionnementSummary.du).toLocaleDateString(
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
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="d-md-flex d-block align-items-center justify-content-between page-header-breadcrumb tw-mb-5">
          <div className="">
            <div className="">
              <nav>
                <ol className="breadcrumb mb-1 mb-md-0">
                  <li className="breadcrumb-item">
                    <a href="#">Stat</a>
                  </li>
                  <li className="breadcrumb-item active" aria-current="page">
                    Type De Dépense
                  </li>
                </ol>
              </nav>
            </div>
          </div>
          <div className="ms-auto pageheader-btn"></div>
        </div>

        <div className="row tw-mb-10">
          {typeDeDepense.map((typeDeDepense, index) => (
            <div
              key={index}
              className="col-sm-12 col-md-6 col-lg-4 col-xxl-3 mb-4"
            >
              <div className="card custom-card">
                <div className="card-header justify-content-between">
                  <div>
                    <div className="card-title">{typeDeDepense.wording}</div>
                  </div>
                  <div className="card-options">
                    <div className="form-check form-check-md form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        role="switch"
                        id="flexSwitchCheckChecked1"
                        defaultChecked
                      />
                    </div>
                  </div>
                </div>
                <div className="p-3">
                  <div className="d-flex">
                    <div>
                      <h6 className="text-muted tw-mb-2">Montant Total</h6>
                      <div className="count mt-0 font-30 mb-0 tag tw-font-bold tw-bg-orange-500 tw-text-white">
                        {typeDeDepense.total?.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="card-footer">
                  <span className="text-start bg-success-transparent text-success p-1 tw-rounded-md">
                    <i className="fe fe-corner-left-up text-success me-1"></i>
                    {typeDeDepense.totalPaye?.toLocaleString() || 0} Payé
                  </span>
                  <span className="float-end bg-danger-transparent text-danger p-1 tw-rounded-md">
                    <i className="fe fe-corner-left-down text-danger me-1"></i>
                    {(
                      typeDeDepense.total - typeDeDepense.totalPaye
                    )?.toLocaleString() || 0}{" "}
                    Dû
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

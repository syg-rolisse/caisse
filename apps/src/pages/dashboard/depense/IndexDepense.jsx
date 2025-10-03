import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import PageHeaderActions from "../../../components/common/PageHeaderActions";
import DeleteDepense from "../../../components/Depense/DeleteDepense";
import Spinner from "../../../components/Spinner";
import axiosInstance from "../../../config/axiosConfig";
import useSocketEvents from "../../../components/UseSocketEvents";
import WelcomeModal from "../../../components/WelcomeModal";
import DepenseForm from "../../../components/Depense/DepenseForm";
import Pagination from "../../../components/Pagination";
import DepenseCard from "../../../components/Depense/DepenseCard";
import { AnimatePresence } from 'framer-motion'; // 👈 Importer AnimatePresence


const IndexDepense = () => {
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [perpage, setPerPage] = useState(10);
  const [meta, setMeta] = useState([]);
  const [depenses, setDepenses] = useState();
  const [currentDepense, setCurrentDepense] = useState();
  const [allDepense, setAllDepense] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const { shouldRefreshDepense } = useSocketEvents();

  const user = JSON.parse(localStorage.getItem("user"));

  const handlePerPageChange = (e) => {
    setPerPage(Number(e.target.value));
    setPage(1);
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
    fetchDepense.mutate({ page, perpage });
  };

  useEffect(() => {
    refreshDepense();
    
  }, [shouldRefreshDepense]);

  useEffect(() => {
    fetchDepense.mutate({ page, perpage }); // Récupérer les données initiales lors du montage du composant
  }, []);

  const handleSuccess = () => {
    setShowModal(false);
    setShowDeleteModal(false);
    setCurrentDepense(null);
    refreshDepense();
  };

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
      <WelcomeModal
        isActive={showModal}
        onClose={() => {
          setShowModal(false);
          setCurrentDepense(null);
        }}
      >
        <DepenseForm depense={currentDepense} onSuccess={handleSuccess} />
      </WelcomeModal>
      <WelcomeModal
        isActive={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
      >
        <DeleteDepense depense={currentDepense} onSuccess={handleSuccess} onClose={() => setShowDeleteModal(false)} />
      </WelcomeModal>

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
            <PageHeaderActions 
            primaryActionLabel="Ajouter une dépense"
            onPrimaryActionClick={() => setShowModal(true)} // La magie est ici !
            />
           
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
          {/* // Votre section de rendu devient : */}
{!fetchDepense.isLoading &&
  !fetchDepense.isError &&
  filteredDepense?.length > 0 && (
    <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-3 xl:tw-grid-cols-4 tw-gap-6">
      {/* 👇 On enveloppe la liste avec AnimatePresence */}
      <AnimatePresence>
        {filteredDepense.map((depense) => (
          <DepenseCard
            key={depense.id}
            depense={depense}
            onEdit={() => {
              setCurrentDepense(depense);
              setShowModal(true);
            }}
            onDelete={() => {
              setCurrentDepense(depense);
              setShowDeleteModal(true);
            }}
          />
        ))}
      </AnimatePresence>
    </div>
)}
        </div>

        <div className="card-footer tw-mt-5">
          <Pagination
            meta={meta} // L'objet meta de votre API
            onPageChange={setPage} // La fonction pour mettre à jour l'état de la page
          />
        </div>
      </div>
    </div>
  );
};

export default IndexDepense;

import { useEffect, useState, useContext } from "react";
import PageHeaderActions from "../../../components/common/PageHeaderActions";
import DeleteDepense from "../../../components/Depense/DeleteDepense";
import Spinner from "../../../components/Spinner";
import { useFetchDepense } from "../../../hook/api/useFetchDepense";
import WelcomeModal from "../../../components/WelcomeModal";
import DepenseForm from "../../../components/Depense/DepenseForm";
import Pagination from "../../../components/Pagination";
import DepenseCard from "../../../components/Depense/DepenseCard";
import { SocketContext } from "../../../context/socket";
import "../../../fade.css";

const IndexDepense = () => {
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [perpage, setPerPage] = useState(10);
  const [meta, setMeta] = useState(null);
  const [depenses, setDepenses] = useState([]);
  const [currentDepense, setCurrentDepense] = useState();
  const [allDepense, setAllDepense] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const socket = useContext(SocketContext);
  const user = JSON.parse(localStorage.getItem("user"));

  const { fetchDepense, isLoading, isError, error, data } = useFetchDepense();

  useEffect(() => {
    fetchDepense({ page, perpage });
  }, [fetchDepense, page, perpage]);

  useEffect(() => {
    if (data) {
      setDepenses(data.depenses.data);
      setAllDepense(data.allDepenses);
      setMeta(data.depenses.meta);
    }
  }, [data]);

  const handleSuccess = () => {
    setShowModal(false);
    setShowDeleteModal(false);
    setCurrentDepense(null);
  };

  useEffect(() => {
    if (!socket || !user?.company?.id) return;

    socket.emit("join_company_room", user.company.id);

    const handleDataUpdate = (socketData, action) => {
      
      if (socketData.companyId !== user.company.id) return;

      const newDepensesPaginated = socketData.depenses;
      const newAllDepense = socketData.allDepenses;

      if (!newDepensesPaginated?.data) {
        console.error(`[ERREUR] Données '${action}' invalides.`);
        return;
      }

      if (action !== "deleted" && newDepensesPaginated.data[0]) {
        newDepensesPaginated.data[0].isNew = true;
      }

      setDepenses(newDepensesPaginated.data);
      setAllDepense(newAllDepense);
      setMeta(newDepensesPaginated.meta);

      if (action !== "deleted") {
        setTimeout(() => {
          setDepenses((currentList) =>
            currentList.map((item, index) =>
              index === 0 ? { ...item, isNew: false } : item
            )
          );
        }, 700);
      }
    };

    socket.on("depense_created", (socketData) => handleDataUpdate(socketData, "created"));
    socket.on("depense_updated", (socketData) => handleDataUpdate(socketData, "updated"));
    socket.on("depense_deleted", (socketData) => handleDataUpdate(socketData, "deleted"));

    return () => {
      socket.off("depense_created");
      socket.off("depense_updated");
      socket.off("depense_deleted");
    };
  }, [socket, user?.company.id, perpage, page]);


  const handlePerPageChange = (e) => {
    setPerPage(Number(e.target.value));
    setPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredDepense =
    searchTerm.trim() === ""
      ? depenses
      : allDepense.filter((depense) => {
          const searchTermLower = searchTerm.toLowerCase();
          return (
            depense.wording?.toLowerCase().includes(searchTermLower) ||
            depense.typeDeDepense?.wording?.toLowerCase().includes(searchTermLower) ||
            depense.user?.fullName?.toLowerCase().includes(searchTermLower) ||
            new Date(depense.createdAt)
              .toLocaleDateString("fr-CA")
              .includes(searchTerm)
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
        <DeleteDepense
          depense={currentDepense}
          onSuccess={handleSuccess}
          onClose={() => setShowDeleteModal(false)}
        />
      </WelcomeModal>

      <div className="container-fluid">
        <PageHeaderActions
          indexTitle="Dépenses"
          primaryActionLabel="Ajouter une dépense"
          onPrimaryActionClick={() => setShowModal(true)}
        />

        <div className="tw-flex tw-items-center tw-gap-4 tw-my-4 tw-w-full">
          <div className="tw-flex tw-items-center tw-gap-2">
            <span>Afficher</span>
            <select
              className="form-select form-select-sm tw-h-10 tw-w-20"
              aria-label="Entries Select"
              onChange={handlePerPageChange}
              value={perpage}
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>

          <div className="tw-flex-1">
            <input
              className="form-control form-control-xl"
              type="text"
              placeholder="Faites une recherche ici..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
        </div>

        <div className="row">
          {isLoading && (
            <div className="col-12 text-center py-5">
              <Spinner />
            </div>
          )}
          {isError && (
            <div className="col-12 text-center">
              <span className="tw-text-red-500 tw-bg-white tw-font-semibold tw-p-2 tw-rounded-md">
                Erreur : {error?.message || "Une erreur est survenue"}
              </span>
            </div>
          )}
          {!isLoading && !isError && filteredDepense?.length === 0 && (
            <div className="col-12 text-center">
              <span className="tw-bg-red-500 tw-text-white tw-p-3 tw-rounded-md tw-flex tw-mb-3 tw-items-center tw-justify-center">
                <i className="fe fe-alert-circle me-2 tw-text-white"></i>
                Aucune donnée disponible
              </span>
            </div>
          )}
          
          {!isLoading && !isError && filteredDepense?.length > 0 && (
            <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-3 xl:tw-grid-cols-4 tw-gap-6">
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
            </div>
          )}
        </div>

        {meta && meta.total > perpage && searchTerm.trim() === "" && (
          <div className="card-footer tw-mt-5">
            <Pagination meta={meta} onPageChange={setPage} />
          </div>
        )}
      </div>
    </div>
  );
};

export default IndexDepense;
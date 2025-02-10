import { useMutation } from "@tanstack/react-query";
import PropTypes from "prop-types";
import { useContext, useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import axiosInstance from "../../config/axiosConfig";
import { SocketContext } from "../../context/socket";
const FilterCard = ({ users, onTypeDeDepenseChange }) => {
  const currentYear = new Date().getFullYear();
  const defaultDateDu = `${currentYear}-01-01`;
  const defaultDateAu = `${currentYear}-12-31`;

  const { register, handleSubmit } = useForm({
    defaultValues: {
      du: defaultDateDu,
      au: defaultDateAu,
      userId: "", // Default empty userId
    },
  });
  const socket = useContext(SocketContext);
  // Mutation pour récupérer les données de typeDeDepense
  const fetchTypeDepenses = useMutation(
    ({ du, au, userId }) =>
      axiosInstance.get(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/v1/totalTypeDepense?du=${du}&au=${au}&userId=${userId}`
      ),
    {
      onSuccess: (response) => {
        // Appeler la fonction onTypeDeDepenseChange du parent pour transmettre les données
        if (onTypeDeDepenseChange) {
          onTypeDeDepenseChange(response?.data);
        }
      },
      onError: (error) => {
        if (error?.response?.data?.error.includes("Désolé")) {
          toast.error(error?.response?.data?.error, { duration: 5000 });
        } else {
          toast.error(error?.response?.data?.error, { autoClose: 1000 });
        }
      },
    }
  );

  // Fetch initial data on mount
  useEffect(() => {
    fetchTypeDepenses.mutate({
      du: defaultDateDu,
      au: defaultDateAu,
      userId: "",
    });
  }, []);

  useEffect(() => {
    if (socket) {
      // Écoute des événements pour rafraîchir les données
      const handleSocketEvent = () => {
        fetchTypeDepenses.mutate(); // Rafraîchir les données
      };

      socket.on("sortie_created", handleSocketEvent);
      socket.on("sortie_deleted", handleSocketEvent);
      socket.on("sortie_updated", handleSocketEvent);

      socket.on("depense_created", handleSocketEvent);
      socket.on("depense_deleted", handleSocketEvent);
      socket.on("depense_updated", handleSocketEvent);

      return () => {
        socket.off("depense_created", handleSocketEvent);
        socket.off("depense_updated", handleSocketEvent);
        socket.off("depense_deleted", handleSocketEvent);

        socket.off("sortie_created", handleSocketEvent);
        socket.off("sortie_updated", handleSocketEvent);
        socket.off("sortie_deleted", handleSocketEvent);
      };
    }
  }, [socket, fetchTypeDepenses]);

  const onSubmit = (data) => {
    // Fetch data based on current form values
    fetchTypeDepenses.mutate({
      du: data.du,
      au: data.au,
      userId: data.userId,
    });
  };

  return (
    <div className="col-sm-12 col-md-6 col-lg-12 col-xxl-12">
      <div className="card custom-card">
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* <div className="card-header justify-content-between">
            <div>
              <div className="card-title">Option de filtre</div>
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
          </div> */}
          <div className="p-3">
            <div className="tw-grid tw-grid-cols-3 tw-gap-3">
              <div>
                <h6 className="text-muted">Utilisateurs</h6>
                {users && (
                  <div className="form-group tw-mt-2">
                    <select
                      id="userId"
                      className="form-control form-control-lg"
                      {...register("userId")}
                    >
                      <option value="">Choisir un utilisateur</option>
                      {users.map((user, index) => (
                        <option key={index} value={user.id}>
                          {user.fullName}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Date "Du" */}
              <div>
                <label htmlFor="du" className="form-label">
                  Du
                </label>
                <input
                  type="date"
                  id="du"
                  className="form-control"
                  {...register("du")}
                />
              </div>

              {/* Date "Au" */}
              <div>
                <label htmlFor="au" className="form-label">
                  Au
                </label>
                <input
                  type="date"
                  id="au"
                  className="form-control"
                  {...register("au")}
                />
              </div>
            </div>
          </div>

          {/* Bouton de recherche */}
          <div className="tw-pl-4 tw-pb-4 tw-w-40">
            <button type="submit" className="btn btn-primary">
              Recherche
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

FilterCard.propTypes = {
  users: PropTypes.array.isRequired, // Changement de 'object' à 'array' car users est un tableau d'objets
  onTypeDeDepenseChange: PropTypes.func.isRequired, // Callback pour transmettre les données
};

export default FilterCard;

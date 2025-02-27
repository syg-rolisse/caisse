import { useMutation } from "@tanstack/react-query";
import PropTypes from "prop-types";
import { useContext, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import axiosInstance from "../../config/axiosConfig";
import { SocketContext } from "../../context/socket";

function CreateDepense({ currentDepenseId, forceUpdate, refreshDepense }) {
  const [currentDepense, setCurrentDepense] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [isConnected, setIsConnected] = useState(false);
  const [typeDeDepense, setDepense] = useState([]);
  const [page] = useState(1);
  const [perpage] = useState(5);
  const prevDepenseIdRef = useRef();
  const addDepenseLinkRef = useRef();
  const user = JSON.parse(localStorage.getItem("user"));

  const socket = useContext(SocketContext);

  const fetchTypeDepenses = useMutation(
    (params) =>
      axiosInstance.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/all_type_depense?page=${
          params.page
        }&companieId=${user?.company?.id}&perpage=${params.perpage}`
      ),
    {
      onSuccess: (response) => {
        setDepense(response?.data?.allTypeDepense);
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

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      decharger: false,
    },
  });

  const handleError = (error) => {
    const validationErrors = error?.response?.data?.error;
    if (validationErrors && Array.isArray(validationErrors)) {
      validationErrors.forEach((err) =>
        toast.error(err.message, { duration: 12000 })
      );
    } else {
      toast.error(
        error?.response?.data?.error ||
          error?.response?.data?.message ||
          error?.response?.data,
        {
          duration: 5000,
        }
      );
    }
  };

  const handleSuccess = (response, action) => {
    toast.success(response?.data?.message || "Action réussie !");
    reset({
      wording: "",
      purcent: "",
    });
    refreshDepense();

    addDepenseLinkRef.current.click();
    socket.emit(`depense_${action}`, user?.company?.id);
  };

  const createOrUpdateDepense = useMutation(
    ({ data, depenseId }) => {
      const url = depenseId
        ? `${
            import.meta.env.VITE_BACKEND_URL
          }/api/v1/depense?depenseId=${depenseId}&userConnectedId=${user?.id}`
        : `${import.meta.env.VITE_BACKEND_URL}/api/v1/depense`;
      const method = depenseId ? axiosInstance.put : axiosInstance.post;
      return method(url, data);
    },
    {
      onSuccess: (response, { depenseId }) => {
        currentDepenseId = 0;

        handleSuccess(response, depenseId ? "updated" : "created");
      },
      onError: handleError,
    }
  );

  useEffect(() => {
    fetchTypeDepenses.mutate({ page, perpage });
  }, [page, perpage]);

  const fetchDepense = useMutation(
    (depenseId) =>
      axiosInstance.get(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/v1/depense?depenseId=${depenseId}`
      ),
    {
      onSuccess: (response) => setCurrentDepense(response?.data?.depense),
      onError: handleError,
    }
  );

  const onSubmit = (data) => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (user) {
      const facture = data.facture[0];
      const formData = new FormData();
      formData.append("wording", data.wording);
      formData.append("typeDeDepenseId", data.typeDeDepenseId);
      formData.append("montant", data.montant);
      formData.append("decharger", data.decharger | false);
      formData.append("userId", user.id);
      formData.append("companieId", user?.company?.id);

      if (facture) {
        formData.append("facture", facture);
      }

      createOrUpdateDepense.mutate({
        data: formData,
        depenseId: currentDepenseId,
      });
    } else {
      toast.error("Utilisateur non trouvé dans le stockage local");
    }
  };

  useEffect(() => {
    if (currentDepenseId) {
      prevDepenseIdRef.current = currentDepenseId;
      fetchDepense.mutate(currentDepenseId);
      addDepenseLinkRef.current?.click();
    }
  }, [currentDepenseId, forceUpdate]);

  useEffect(() => {
    if (currentDepense) {
      reset({
        wording: currentDepense.wording || "",
        montant: currentDepense.montant || "",
        decharger: currentDepense.decharger || false,
        typeDeDepenseId: currentDepense.typeDeDepenseId || "",
      });
    }
  }, [currentDepense, reset]);

  return (
    <div className="row">
      <div className="input-group">
        <div className="input-group-text text-muted bg-primary text-fixed-white me-0 border-0 pe-0">
          <i className="ri-calendar-line mt-1"></i>
        </div>
        <a
          ref={addDepenseLinkRef}
          className="modal-effect form-control flatpickr-input bg-primary text-fixed-white border-0 ps-2"
          data-bs-effect="effect-rotate-bottom"
          data-bs-toggle="modal"
          data-bs-target="#modaldemo8"
          style={{ cursor: "pointer" }}
        >
          Ajouter une dépense
        </a>
      </div>
      <div
        className="modal fade"
        id="modaldemo8"
        tabIndex="-1"
        data-bs-backdrop="static"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content tw-rounded-lg tw-border tw-p-2">
            <div className="modal-header">
              <h6 className="modal-title tw-text-gray-700 tw-text-xl">
                {currentDepenseId ? "Modifier la dépense" : "Nouvelle dépense"}
              </h6>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body text-start">
              <div className="tw-text-red-600 tw-mb-3">
                <h6>
                  <span className="tw-text-xl">*</span> signifie que
                  l&apos;information est requise
                </h6>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="row gy-4">
                <div className="form-group">
                  <label htmlFor="wording" className="form-label text-default">
                    Intitulé
                  </label>
                  <span className="tw-text-red-600">*</span>
                  <input
                    type="text"
                    className="form-control form-control-lg"
                    id="wording"
                    placeholder="Saisir l'intitulé"
                    {...register("wording", {
                      required: "L'intitulé est requis",
                    })}
                  />
                  {errors.wording && (
                    <span className="tw-text-red-500">
                      {errors.wording.message}
                    </span>
                  )}
                </div>

                {typeDeDepense && (
                  <div className="form-group">
                    <label
                      htmlFor="typeDeDepenseId"
                      className="form-label text-default"
                    >
                      Type de dépense
                    </label>
                    <select
                      id="typeDeDepenseId"
                      className="form-control form-control-lg"
                      defaultValue=""
                      {...register("typeDeDepenseId", {
                        required: "Le type de dépense est requis",
                      })}
                    >
                      <option value="">Choisir le type de dépense</option>
                      {typeDeDepense.map((typeDepense, index) => (
                        <option key={index} value={typeDepense.id}>
                          {typeDepense.wording}
                        </option>
                      ))}
                    </select>

                    {errors.typeDeDepenseId && (
                      <span className="tw-text-red-500">
                        {errors.typeDeDepenseId.message}
                      </span>
                    )}
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="montant" className="form-label text-default">
                    Montant
                  </label>
                  <span className="tw-text-red-600">*</span>
                  <input
                    type="text"
                    className="form-control form-control-lg"
                    id="montant"
                    placeholder="Saisir le montant"
                    {...register("montant", {
                      required: "Le montant est requis",
                    })}
                  />
                  {errors.montant && (
                    <span className="tw-text-red-500">
                      {errors.montant.message}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  {/* Affichage du lien si le fichier existe, sinon afficher l'input */}
                  {currentDepense?.factureUrl && (
                    <div className="mb-2 -tw-ml-3">
                      <a
                        href={`${import.meta.env.VITE_BACKEND_URL}/uploads/${
                          currentDepense.factureUrl
                        }`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-link"
                      >
                        Télécharger le fichier PDF existant
                      </a>
                    </div>
                  )}

                  <label htmlFor="facture" className="form-label text-default">
                    Joindre une facture (PDF)
                  </label>

                  {/* Le champ pour joindre un fichier (toujours visible pour mettre à jour le fichier) */}
                  <input
                    type="file"
                    className="form-control form-control-lg"
                    id="facture"
                    accept=".pdf"
                    {...register("facture")}
                  />
                </div>

                {currentDepenseId && (
                  <div className="form-check tw-flex tw-justify-start tw-ml-4 tw-items-center">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="decharger"
                      {...register("decharger")}
                    />
                    <label
                      className="form-check-label tw-ml-2"
                      htmlFor="decharger"
                    >
                      Déchargé
                    </label>
                  </div>
                )}

                <div className="d-flex justify-content-between tw-mt-5">
                  <button
                    type="submit"
                    className="btn tw-bg-green-600 tw-text-white"
                    disabled={createOrUpdateDepense.isLoading}
                  >
                    {createOrUpdateDepense.isLoading
                      ? "Chargement..."
                      : "Valider"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-light"
                    data-bs-dismiss="modal"
                  >
                    Fermer
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

CreateDepense.propTypes = {
  currentDepenseId: PropTypes.number,
  forceUpdate: PropTypes.bool,
  refreshDepense: PropTypes.func.isRequired,
};

export default CreateDepense;

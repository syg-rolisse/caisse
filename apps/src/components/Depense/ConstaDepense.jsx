import { useMutation } from "@tanstack/react-query";
import PropTypes from "prop-types";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import axiosInstance from "../../config/axiosConfig";

function ConstaDepense({ constaId, refreshDepense }) {
  const [consta, setCurrentDepense] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [isConnected, setIsConnected] = useState(false);
  const [typeDeDepense, setDepense] = useState([]);
  const [page] = useState(1);
  const [perpage] = useState(5);
  const prevDepenseIdRef = useRef();
  const addDepenseLinkRef = useRef();
  const user = JSON.parse(localStorage.getItem("user"));

  const fetchDepenses = useMutation(
    (params) =>
      axiosInstance.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/all_type_depense?page=${
          params.page
        }&perpage=${params.perpage}`
      ),
    {
      onSuccess: (response) => {
        setDepense(response?.data?.data);
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
  } = useForm();

  const handleError = (error) => {
    console.log(error);

    const validationErrors = error?.response?.data?.error;
    if (validationErrors && Array.isArray(validationErrors)) {
      validationErrors.forEach((err) =>
        toast.error(err.message, { duration: 12000 })
      );
    } else {
      toast.error(
        error?.response?.data?.message || error?.response?.data?.error,
        {
          duration: 2000,
        }
      );
    }
  };

  const handleSuccess = (response) => {
    toast.success(response?.data?.message || "Action réussie !");
    reset({
      wording: "",
      purcent: "",
    });
    refreshDepense();

    addDepenseLinkRef.current.click();
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
        constaId = null;

        handleSuccess(response, depenseId ? "updated" : "created");
      },
      onError: handleError,
    }
  );

  useEffect(() => {
    fetchDepenses.mutate({ page, perpage });
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
      const datas = { ...data, userId: user.id };

      createOrUpdateDepense.mutate({
        data: datas,
        depenseId: constaId,
      });
    } else {
      toast.error("Utilisateur non trouvé dans le stockage local");
    }
  };


  useEffect(() => {
    if (constaId && constaId !== prevDepenseIdRef.current) {
      prevDepenseIdRef.current = constaId;
      fetchDepense.mutate(constaId);
      addDepenseLinkRef.current?.click();
    }
  }, [constaId]);

  useEffect(() => {
    if (consta) {
      reset({
        wording: consta.wording || "",
        montant: consta.montant || "",
        typeDeDepenseId: consta.typeDeDepenseId || "",
      });
    }
  }, [consta, reset]);

  return (
    <div className="row">
      <a
        ref={addDepenseLinkRef}
        className=""
        data-bs-effect="effect-rotate-bottom"
        data-bs-toggle="modal"
        data-bs-target="#constaModal"
        style={{ cursor: "pointer" }}
      ></a>
      <div
        className="modal fade"
        id="constaModal"
        tabIndex="-1"
        data-bs-backdrop="static"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content tw-rounded-lg tw-border tw-p-2">
            <div className="modal-header">
              <h6 className="modal-title tw-text-gray-700 tw-text-xl">
                {constaId ? "Constat de la dépense" : "Nouvelle dépense"}
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
                    disabled
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
                      disabled
                      id="typeDeDepenseId"
                      className="form-control form-control-lg"
                      {...register("typeDeDepenseId", {
                        required: "Le type de dépense est requis",
                      })}
                    >
                      <option value="" selected>
                        Choisir le type de dépense
                      </option>
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
                    disabled
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

ConstaDepense.propTypes = {
  constaId: PropTypes.number,
  refreshDepense: PropTypes.func.isRequired,
};

export default ConstaDepense;

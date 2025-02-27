import { useMutation } from "@tanstack/react-query";
import PropTypes from "prop-types";
import { useContext, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import axiosInstance from "../../config/axiosConfig";
import { SocketContext } from "../../context/socket";

function CreateSortie({ currentDepenseId, currentSortieId,forceUpdate, refreshSortie }) {
  const [currentSortie, setCurrentDepense] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [isConnected, setIsConnected] = useState(false);
  const prevSortieIdRef = useRef();
  const addSortieLinkRef = useRef();
  const user = JSON.parse(localStorage.getItem("user"));
  const socket = useContext(SocketContext);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const handleError = (error) => {
    const validationErrors = error?.response?.data?.error;
    if (validationErrors && Array.isArray(validationErrors)) {
      validationErrors.forEach((err) =>
        toast.error(err.message, { duration: 12000 })
      );
    } else {
      toast.error(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.response?.data,
        {
          duration: 4000,
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
    refreshSortie();

    addSortieLinkRef.current.click();
    socket.emit(`sortie_${action}`, response.data);
  };

  const createOrUpdateDepense = useMutation(
    ({ data }) => {
      const url = currentSortieId
        ? `${
            import.meta.env.VITE_BACKEND_URL
          }/api/v1/sortie?sortieId=${currentSortieId}`
        : `${import.meta.env.VITE_BACKEND_URL}/api/v1/sortie?companieId=${
            user?.company?.id
          }`;
      const method = currentSortieId ? axiosInstance.put : axiosInstance.post;
      return method(url, data);
    },
    {
      onSuccess: (response) => {
        currentSortieId = null;

        handleSuccess(response, currentDepenseId ? "updated" : "created");
      },
      onError: handleError,
    }
  );

  const fetchSortie = useMutation(
    (sortieId) =>
      axiosInstance.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/sortie?sortieId=${sortieId}`
      ),
    {
      onSuccess: (response) => {
        setCurrentDepense(response?.data?.depense);
      },
      onError: handleError,
    }
  );

  const onSubmit = (data) => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (user) {
      const datas = {
        ...data,
        depenseId: currentSortie?.depenseId
          ? currentSortie?.depenseId
          : currentDepenseId,
        userId: user.id,
      };

      createOrUpdateDepense.mutate({
        data: datas,
        currentDepenseId,
      });
    } else {
      toast.error("Utilisateur non trouvé dans le stockage local");
    }
  };

  useEffect(() => {
    if (socket) {
      socket.on("sortie_created", refreshSortie);
      socket.on("sortie_updated", refreshSortie);
      socket.on("sortie_deleted", refreshSortie);
      return () => {
        socket.off("sortie_created", refreshSortie);
        socket.off("sortie_updated", refreshSortie);
        socket.off("sortie_deleted", refreshSortie);
      };
    }
  }, [socket, refreshSortie]);

  useEffect(() => {
    if (currentDepenseId) {
      prevSortieIdRef.current = currentDepenseId;
      fetchSortie.mutate(currentDepenseId);
      //}

      addSortieLinkRef.current?.click();
    }
  }, [currentDepenseId,forceUpdate]);

  // useEffect(() => {
  //   if (currentSortieId || currentDepenseId) {
  //     console.log('rrrrrrrrrrrrrrrrrrrrr');

  //     if (currentSortieId) {
  //       prevSortieIdRef.current = currentSortieId;
  //       fetchSortie.mutate(currentSortieId);
  //     }

  //     addSortieLinkRef.current?.click();
  //   }
  // }, [currentSortieId, currentDepenseId]);

  useEffect(() => {
    if (currentSortie) {
      reset({
        wording: currentSortie.wording || "",
        montant: currentSortie.montant || "",
      });
    }
  }, [currentSortie, reset]);

  return (
    <div className="row">
      <a
        ref={addSortieLinkRef}
        data-bs-effect="effect-rotate-bottom"
        data-bs-toggle="modal"
        data-bs-target="#modaldemo8"
        style={{ cursor: "pointer" }}
        className=""
      >
        {/* <i className="ri-add-line">Payé</i>  modal-effect btn  btn-sm btn-primary-transparent rounded-pill tw-mr-2*/}
      </a>
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
                {currentSortieId ? "Modifier le montant" : "Décaissement"}
              </h6>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body text-start">
              <form onSubmit={handleSubmit(onSubmit)} className="row gy-4">
                <div className="form-group">
                  <label htmlFor="montant" className="form-label text-default">
                    Montant
                  </label>

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
                  <label htmlFor="wording" className="form-label text-default">
                    Message spécifique
                  </label>
                  <span className="tw-text-red-600">*</span>
                  <textarea
                    className="form-control form-control-lg"
                    id="wording"
                    placeholder="Saisir le message"
                    rows="4"
                    {...register("wording")}
                  ></textarea>
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

CreateSortie.propTypes = {
  currentSortieId: PropTypes.number,
  currentDepenseId: PropTypes.number,
  forceUpdate: PropTypes.bool,
  refreshSortie: PropTypes.func.isRequired,
};

export default CreateSortie;

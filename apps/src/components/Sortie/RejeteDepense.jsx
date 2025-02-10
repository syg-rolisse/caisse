import { useMutation } from "@tanstack/react-query";
import PropTypes from "prop-types";
import { useContext, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import axiosInstance from "../../config/axiosConfig";
import { SocketContext } from "../../context/socket";

function RejeteDepense({ currentRejeteDepenseId, refreshSortie }) {
  const [currentRejetDepense, setRejetDepense] = useState();
  const prevUserIdRef = useRef();
  const addRejeteLinkRef = useRef();
  const user = JSON.parse(localStorage.getItem("user"));

  const socket = useContext(SocketContext);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  // Fonction handleError déplacée ici
  const handleError = (error) => {
    const validationErrors = error?.response?.data?.error;

    if (validationErrors && Array.isArray(validationErrors)) {
      validationErrors.forEach((err) => {
        toast.error(err.message, { duration: 12000 });
      });
    } else {
      toast.error(
        error?.response?.data?.error ||
          error?.response?.data?.message ||
          error?.response?.data,
        { duration: 12000 }
      );
    }
  };

  const rejetDepense = useMutation(
    ({ data, currentRejeteDepenseId }) =>
      axiosInstance.put(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/v1/rejetDepense?userConnectedId=${user.id}&rejeter=${
          data.rejeter
        }&depenseId=${currentRejeteDepenseId}&rejetMessage=${data.rejetMessage}`
      ),
    {
      onSuccess: (response) => {
        socket.emit("depense_updated");
        toast.success(response?.data?.message);
        addRejeteLinkRef.current.click();
        refreshSortie();
        reset();
      },
      onError: handleError,
    }
  );

  const getDepense = useMutation(
    (param) =>
      axiosInstance.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/depense?depenseId=${
          param.currentRejeteDepenseId
        }`
      ),
    {
      onSuccess: (response) => {
        setRejetDepense(response?.data?.depense);
      },
      onError: handleError, // Utilisation après déclaration
    }
  );

  // const closeModal = () => {
  //   const modalElement = document.getElementById("rejetDepenseModal");
  //   const modalInstance = Modal.getInstance(modalElement);
  //   if (modalInstance) modalInstance.hide();
  // };

  const onSubmit = (data) => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      rejetDepense.mutate({ data, currentRejeteDepenseId });
    } else {
      toast.error("Utilisateur non trouvé dans le stockage local");
    }
  };

  useEffect(() => {
    if (
      currentRejeteDepenseId &&
      currentRejeteDepenseId !== prevUserIdRef.current
    ) {
      prevUserIdRef.current = currentRejeteDepenseId;
      getDepense.mutate({ currentRejeteDepenseId });
      if (addRejeteLinkRef.current) {
        addRejeteLinkRef.current.click();
      }
    }
  }, [currentRejeteDepenseId]);

  useEffect(() => {
    if (currentRejetDepense) {
      reset({
        wording: currentRejetDepense?.wording || "",
        rejetMessage: currentRejetDepense?.rejetMessage || "",
        montant: currentRejetDepense?.montant || "",
        rejeter: currentRejetDepense?.rejeter || "",
      });
    }
  }, [currentRejetDepense, reset]);

  useEffect(() => {
    if (socket) {
      socket.on("depense_updated", refreshSortie);
      return () => {
        socket.off("depense_updated", refreshSortie);
      };
    }
  }, [socket, refreshSortie]);

  return (
    <div className="row">
      <a
        ref={addRejeteLinkRef}
        className="modal-effect"
        data-bs-effect="effect-rotate-bottom"
        data-bs-toggle="modal"
        href="#rejetDepenseModal"
        style={{ cursor: "pointer", visibility: "hidden" }}
        disabled
      ></a>

      <div
        className="modal fade"
        id="rejetDepenseModal"
        tabIndex="-1"
        data-bs-backdrop="static"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content tw-rounded-lg tw-border tw-p-2">
            <div className="modal-header">
              <h6 className="modal-title tw-text-gray-700 tw-text-xl">
                REJET DE LA DEPENSE
              </h6>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                style={{ cursor: "pointer" }}
              ></button>
            </div>
            <div className="modal-body text-start">
              <div className="tw-text-red-600 tw-mb-3">
                <h6>
                  <span className="tw-text-xl">*</span> signifie que
                  l&apos;information est requise
                </h6>
              </div>

              <form
                onSubmit={handleSubmit(onSubmit)}
                className="row formCustom"
              >
                <div className="form-group">
                  <label
                    htmlFor="wording"
                    className="form-label tw-text-red-500 text-default"
                  >
                    Nature de la dépense
                  </label>

                  <input
                    type="text"
                    className="form-control form-control-lg"
                    id="wording"
                    placeholder="Saisir l'intitulé"
                    {...register("wording", {
                      required: "L'intitulé est requis",
                    })}
                    disabled
                  />
                  {errors.wording && (
                    <span className="tw-text-red-500">
                      {errors.wording.message}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="montant" className="form-label text-default">
                    Montant
                  </label>

                  <input
                    type="text"
                    className="form-control form-control-lg"
                    id="montant"
                    placeholder="Saisir l'intitulé"
                    {...register("montant", {
                      required: "L'intitulé est requis",
                    })}
                    disabled
                  />
                  {errors.montant && (
                    <span className="tw-text-red-500">
                      {errors.montant.message}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label
                    htmlFor="rejetMessage"
                    className="form-label text-default"
                  >
                    Message spécifique
                  </label>
                  <span className="tw-text-red-600">*</span>
                  <textarea
                    className="form-control form-control-lg"
                    id="rejetMessage"
                    placeholder="Saisir la raison du rejet..."
                    rows="4"
                    {...register("rejetMessage")}
                  ></textarea>
                </div>

                <div className="form-check tw-mt-3 tw-ml-3 tw-flex tw-justify-start tw-items-center">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="rejeter"
                    {...register("rejeter")}
                  />
                  <label className="form-check-label tw-ml-2 tw-font-bold tw-text-lg" htmlFor="rejeter">
                    Rejeter
                  </label>
                </div>

                <div className="d-flex justify-content-between tw-mt-5">
                  <button
                    type="submit"
                    className="btn tw-bg-green-600 tw-text-white"
                    disabled={rejetDepense.isLoading}
                    style={{ cursor: "pointer" }}
                  >
                    {rejetDepense.isLoading ? "Chargement..." : "Valider"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-light"
                    data-bs-dismiss="modal"
                    style={{ cursor: "pointer" }}
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

RejeteDepense.propTypes = {
  currentRejeteDepenseId: PropTypes.number,
  refreshSortie: PropTypes.func,
};

export default RejeteDepense;

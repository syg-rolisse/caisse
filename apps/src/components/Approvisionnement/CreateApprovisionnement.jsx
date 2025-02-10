import { useMutation } from "@tanstack/react-query";
import PropTypes from "prop-types";
import { useContext, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import axiosInstance from "../../config/axiosConfig";
import { SocketContext } from "../../context/socket";

function CreateApprovisionnement({
  currentApprovisionnementId,
  refreshApprovisionnement,
}) {
  const [currentApprovisionnement, setCurrentApprovisionnement] =
    useState(null);
  // eslint-disable-next-line no-unused-vars
  const [isConnected, setIsConnected] = useState(false);

  const prevApprovisionnementIdRef = useRef();
  const addApprovisionnementLinkRef = useRef();

  const socket = useContext(SocketContext);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      wording: "",
      montant: "",
      approvisionnementId: "",
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
        error?.response?.data?.message ||
          error?.response?.data ||
          error?.response?.data?.error,
        {
          duration: 2000,
        }
      );
    }
  };

  const handleSuccess = (response, action) => {
    toast.success(response?.data?.message || "Action réussie !");
    reset({
      wording: "",
      montant: "",
    });
    refreshApprovisionnement();

    addApprovisionnementLinkRef.current.click();

    socket.emit(`approvisionnement_${action}`);
  };

  const createOrUpdateApprovisionnement = useMutation(
    ({ data, approvisionnementId }) => {
      const url = approvisionnementId
        ? `${
            import.meta.env.VITE_BACKEND_URL
          }/api/v1/approvisionnement?approvisionnementId=${approvisionnementId}`
        : `${import.meta.env.VITE_BACKEND_URL}/api/v1/approvisionnement`;
      const method = approvisionnementId
        ? axiosInstance.put
        : axiosInstance.post;
      return method(url, data);
    },
    {
      onSuccess: (response, { approvisionnementId }) => {
        currentApprovisionnementId = null;

        handleSuccess(response, approvisionnementId ? "updated" : "created");
      },
      onError: handleError,
    }
  );

  const fetchApprovisionnement = useMutation(
    (approvisionnementId) =>
      axiosInstance.get(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/v1/approvisionnement?approvisionnementId=${approvisionnementId}`
      ),
    {
      onSuccess: (response) =>
        setCurrentApprovisionnement(response?.data?.approvisionnement),
      onError: handleError,
    }
  );

  const onSubmit = (data) => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      const datas = { ...data, companieId: user?.company?.id, userId: user.id };

      createOrUpdateApprovisionnement.mutate({
        data: datas,
        approvisionnementId: currentApprovisionnementId,
      });
    } else {
      toast.error("Utilisateur non trouvé dans le stockage local");
    }
  };

  // useEffect(() => {
  //   if (socket) {
  //     setIsConnected(socket.connected);
  //     socket.on("connect", () => setIsConnected(true));
  //     socket.on("disconnect", () => setIsConnected(false));
  //     return () => {
  //       socket.off("connect");
  //       socket.off("disconnect");
  //     };
  //   }
  // }, [socket]);

  useEffect(() => {
    if (socket) {
      socket.on("approvisionnement_created", refreshApprovisionnement);
      socket.on("approvisionnement_updated", refreshApprovisionnement);
      socket.on("approvisionnement_deleted", refreshApprovisionnement);
      return () => {
        socket.off("approvisionnement_created", refreshApprovisionnement);
        socket.off("approvisionnement_updated", refreshApprovisionnement);
        socket.off("approvisionnement_deleted", refreshApprovisionnement);
      };
    }
  }, [socket, refreshApprovisionnement]);

  useEffect(() => {
    if (
      currentApprovisionnementId &&
      currentApprovisionnementId !== prevApprovisionnementIdRef.current
    ) {
      prevApprovisionnementIdRef.current = currentApprovisionnementId;
      fetchApprovisionnement.mutate(currentApprovisionnementId);
      addApprovisionnementLinkRef.current?.click();
    }
  }, [currentApprovisionnementId]);

  useEffect(() => {
    if (currentApprovisionnement) {
      reset({
        montant: currentApprovisionnement.montant || "",
        wording: currentApprovisionnement.wording || "",
      });
    }
  }, [currentApprovisionnement, reset]);

  return (
    <div className="row">
      <a
        ref={addApprovisionnementLinkRef}
        className="modal-effect btn btn-primary d-grid mb-3"
        data-bs-effect="effect-rotate-bottom"
        data-bs-toggle="modal"
        data-bs-target="#modaldemo8"
        style={{ cursor: "pointer" }}
      >
        Approvisionner La Caisse
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
                {currentApprovisionnementId
                  ? "Modifier l'approvisionnement"
                  : "Nouvel approvisionnement"}
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
                    disabled={createOrUpdateApprovisionnement.isLoading}
                  >
                    {createOrUpdateApprovisionnement.isLoading
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

CreateApprovisionnement.propTypes = {
  currentApprovisionnementId: PropTypes.number,
  refreshApprovisionnement: PropTypes.func.isRequired,
};

export default CreateApprovisionnement;

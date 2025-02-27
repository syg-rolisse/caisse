import { useMutation } from "@tanstack/react-query";
import PropTypes from "prop-types";
import { useContext, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import axiosInstance from "../../config/axiosConfig";
import { SocketContext } from "../../context/socket";

function CreateTypeDepense({
  currentTypeDepenseId,
  forceUpdate,
  refreshTypeDepense,
}) {
  const [currentTypeDepense, setCurrentTypeDepense] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [isConnected, setIsConnected] = useState(false);

  const prevTypeDepenseIdRef = useRef();
  const addTypeDepenseLinkRef = useRef();

  const socket = useContext(SocketContext);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      wording: "",
      percent: "",
      cumul: 0,
      typeDepenseId: "",
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
        error?.response?.data?.message || error?.response?.data?.error,
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
      purcent: "",
    });
    refreshTypeDepense();

    addTypeDepenseLinkRef.current.click();
    socket.emit(`typeDepense_${action}`, response.data);
  };

  const createOrUpdateTypeDepense = useMutation(
    ({ data, typeDepenseId }) => {
      const url = typeDepenseId
        ? `${
            import.meta.env.VITE_BACKEND_URL
          }/api/v1/type_depense?typeDepenseId=${typeDepenseId}`
        : `${import.meta.env.VITE_BACKEND_URL}/api/v1/type_depense`;
      const method = typeDepenseId ? axiosInstance.put : axiosInstance.post;
      return method(url, data);
    },
    {
      onSuccess: (response, { typeDepenseId }) => {
        currentTypeDepenseId = null;

        handleSuccess(response, typeDepenseId ? "updated" : "created");
      },
      onError: handleError,
    }
  );

  const fetchTypeDepense = useMutation(
    (typeDepenseId) =>
      axiosInstance.get(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/v1/type_depense?typeDepenseId=${typeDepenseId}`
      ),
    {
      onSuccess: (response) =>
        setCurrentTypeDepense(response?.data?.typededepense),
      onError: handleError,
    }
  );

  const onSubmit = (data) => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (user) {
      const datas = { ...data, companieId: user?.company?.id, userId: user.id };

      createOrUpdateTypeDepense.mutate({
        data: datas,
        typeDepenseId: currentTypeDepenseId,
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
      socket.on("type_depense_created", refreshTypeDepense);
      socket.on("type_depense_updated", refreshTypeDepense);
      socket.on("type_depense_deleted", refreshTypeDepense);
      return () => {
        socket.off("type_depense_created", refreshTypeDepense);
        socket.off("type_depense_updated", refreshTypeDepense);
        socket.off("type_depense_deleted", refreshTypeDepense);
      };
    }
  }, [socket, refreshTypeDepense]);

  useEffect(() => {
    if (currentTypeDepenseId) {
      prevTypeDepenseIdRef.current = currentTypeDepenseId;
      fetchTypeDepense.mutate(currentTypeDepenseId);
      addTypeDepenseLinkRef.current?.click();
    }
  }, [currentTypeDepenseId, forceUpdate]);

  useEffect(() => {
    if (currentTypeDepense) {
      reset({
        wording: currentTypeDepense.wording || "",
      });
    }
  }, [currentTypeDepense, reset]);

  return (
    <div className="row">
      <a
        ref={addTypeDepenseLinkRef}
        className="modal-effect btn btn-primary d-grid mb-3"
        data-bs-effect="effect-rotate-bottom"
        data-bs-toggle="modal"
        data-bs-target="#modaldemo8"
        style={{ cursor: "pointer" }}
      >
        Ajouter un type de dépense
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
                {currentTypeDepenseId
                  ? "Modifier le type de dépense"
                  : "Nouveau type de dépense"}
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

                <div className="d-flex justify-content-between tw-mt-5">
                  <button
                    type="submit"
                    className="btn tw-bg-green-600 tw-text-white"
                    disabled={createOrUpdateTypeDepense.isLoading}
                  >
                    {createOrUpdateTypeDepense.isLoading
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

CreateTypeDepense.propTypes = {
  currentTypeDepenseId: PropTypes.number,
  forceUpdate: PropTypes.bool,
  refreshTypeDepense: PropTypes.func.isRequired,
};

export default CreateTypeDepense;

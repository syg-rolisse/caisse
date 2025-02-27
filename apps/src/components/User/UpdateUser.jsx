import { useMutation } from "@tanstack/react-query";
import PropTypes from "prop-types";
import { useContext, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import axiosInstance from "../../config/axiosConfig";
import { SocketContext } from "../../context/socket";

function CreateUser({ currentUserId, forceUpdate, refreshUserList }) {
  const [currentUser, setCurrentUser] = useState();
  const prevUserIdRef = useRef();
  const addUserLinkRef = useRef();
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

  const createUser = useMutation(
    (data) =>
      axiosInstance.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/user`,
        data
      ),
    {
      onSuccess: (response) => {
        toast.success(response?.data?.message);
        refreshUserList();
        reset();
        addUserLinkRef.current.click();
      },
      onError: handleError, // Utilisation après déclaration
    }
  );

  const updateUser = useMutation(
    ({ data, currentUserId }) =>
      axiosInstance.put(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/v1/changeAccountStatus?userConnectedId=${
          user.id
        }&userId=${currentUserId}`, // Ajout du signe `=` manquant
        data
      ),
    {
      onSuccess: (response) => {
        socket.emit("user_updated");
        toast.success(response?.data?.message);
        refreshUserList();
        reset();
        addUserLinkRef.current.click();
      },
      onError: handleError,
    }
  );

  const getUser = useMutation(
    (param) =>
      axiosInstance.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/user?userId=${
          param.currentUserId
        }`
      ),
    {
      onSuccess: (response) => {
        setCurrentUser(response?.data?.user);
      },
      onError: handleError, // Utilisation après déclaration
    }
  );

  const onSubmit = (data) => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      const datas = { ...data };

      if (currentUserId) {
        updateUser.mutate({ data, currentUserId });
      } else {
        createUser.mutate(datas);
      }
    } else {
      toast.error("Utilisateur non trouvé dans le stockage local");
    }
  };

  useEffect(() => {
    if (currentUserId) {
      prevUserIdRef.current = currentUserId;
      getUser.mutate({ currentUserId });
      if (addUserLinkRef.current) {
        addUserLinkRef.current.click();
      }
    }
  }, [currentUserId, forceUpdate]);

  useEffect(() => {
    if (currentUser) {
      reset({
        fullName: currentUser?.fullName || "",
        profilId: currentUser?.profilId || "",
        status: currentUser?.status || "",
      });
    }
  }, [currentUser, reset]);

  useEffect(() => {
    if (socket) {
      socket.on("user_created", refreshUserList);
      socket.on("user_updated", refreshUserList);
      socket.on("user_deleted", refreshUserList);
      return () => {
        socket.off("user_created", refreshUserList);
        socket.off("user_updated", refreshUserList);
        socket.off("user_deleted", refreshUserList);
      };
    }
  }, [socket, refreshUserList]);

  return (
    <div className="row">
      <a
        ref={addUserLinkRef}
        className="modal-effect btn btn-primary d-grid mb-3 "
        data-bs-effect="effect-rotate-bottom"
        data-bs-toggle="modal"
        href="#modaldemo8"
        style={{ cursor: "pointer", visibility: "hidden" }}
        disabled
      >
        Ajouter un utilisateur
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
                Modification
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
                className="row gy-4 formCustom"
              >
                <div className="form-group">
                  <label htmlFor="fullName" className="form-label text-default">
                    Nom & Prénom
                  </label>
                  <span className="tw-text-red-600 tw-text-lg">*</span>
                  <input
                    type="text"
                    className="form-control form-control-lg"
                    id="fullName"
                    placeholder="Saisir l'intitulé"
                    {...register("fullName", {
                      required: "L'intitulé est requis",
                    })}
                    disabled
                  />
                  {errors.fullName && (
                    <span className="tw-text-red-500">
                      {errors.fullName.message}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="profilId" className="form-label text-default">
                    Rôle
                  </label>
                  <span className="tw-text-red-600 tw-text-lg">*</span>
                  <select
                    id="profilId"
                    className="form-control form-control-lg"
                    {...register("profilId", {
                      required: "Le rôle est requis",
                    })}
                  >
                    <option value="2">Admin</option>
                    <option value="3">Employé</option>
                    <option value="4">Sécrétaire</option>
                  </select>
                  {errors.profilId && (
                    <span className="tw-text-red-500">
                      {errors.profilId.message}
                    </span>
                  )}
                </div>

                <div className="form-check tw-flex tw-justify-center tw-items-center">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="status"
                    {...register("status")}
                  />
                  <label className="form-check-label tw-ml-2" htmlFor="status">
                    Statut
                  </label>
                </div>

                <div className="d-flex justify-content-between tw-mt-5">
                  <button
                    type="submit"
                    className="btn tw-bg-green-600 tw-text-white"
                    disabled={createUser.isLoading || updateUser.isLoading}
                    style={{ cursor: "pointer" }}
                  >
                    {createUser.isLoading || updateUser.isLoading
                      ? "Chargement..."
                      : "Valider"}
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

CreateUser.propTypes = {
  currentUserId: PropTypes.number,
  forceUpdate: PropTypes.bool,
  refreshUserList: PropTypes.func,
};

export default CreateUser;

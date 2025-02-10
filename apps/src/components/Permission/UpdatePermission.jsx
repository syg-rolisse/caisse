import { useMutation } from "@tanstack/react-query";
import PropTypes from "prop-types";
import { useContext, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import axiosInstance from "../../config/axiosConfig";
import { SocketContext } from "../../context/socket";

function UpdatePermission({ currentPermissionId, refreshPermissionList }) {
  const [currentPermission, setCurrentPermission] = useState();
  const prevPermissionIdRef = useRef();
  const addPermissionLinkRef = useRef();
  const user = JSON.parse(localStorage.getItem("user"));

  const socket = useContext(SocketContext);

  const { register, handleSubmit, reset } = useForm();

  const handleError = (error) => {
    const validationErrors = error?.response?.data?.error;
    if (validationErrors && Array.isArray(validationErrors)) {
      validationErrors.forEach((err) => {
        toast.error(err.message, { duration: 12000 });
      });
    } else {
      addPermissionLinkRef.current.click();
      toast.error(
        error?.response?.data?.error ||
          error?.response?.data?.message ||
          error?.response?.data,
        { duration: 12000 }
      );
    }
  };

  const updatePermission = useMutation(
    ({ data, currentPermissionId }) =>
      axiosInstance.put(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/v1/permission?userConnectedId=${
          user.id
        }&permissionId=${currentPermissionId}`,
        data
      ),
    {
      onSuccess: (response) => {
        socket.emit("user_updated");
        toast.success(response?.data?.message);
        refreshPermissionList();
        reset();
        addPermissionLinkRef.current.click();
      },
      onError: handleError,
    }
  );

  const getPermission = useMutation(
    (param) =>
      axiosInstance.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/permission?permissionId=${
          param.currentPermissionId
        }`
      ),
    {
      onSuccess: (response) => {
        setCurrentPermission(response?.data?.permission);
      },
      onError: handleError,
    }
  );

  const onSubmit = (data) => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      console.log(data);

      if (currentPermissionId) {
        updatePermission.mutate({ data, currentPermissionId });
      }
    } else {
      toast.error("Utilisateur non trouvé dans le stockage local");
    }
  };

  useEffect(() => {
    if (
      currentPermissionId &&
      currentPermissionId !== prevPermissionIdRef.current
    ) {
      prevPermissionIdRef.current = currentPermissionId;
      getPermission.mutate({ currentPermissionId });
      if (addPermissionLinkRef.current) {
        addPermissionLinkRef.current.click();
      }
    }
  }, [currentPermissionId]);

  useEffect(() => {
    if (currentPermission) {
      reset({
        profilId: currentPermission?.Profil?.id,
        readUser: currentPermission?.readUser || false,
        createUser: currentPermission?.createUser || false,
        updateUser: currentPermission?.updateUser || false,
        deleteUser: currentPermission?.deleteUser || false,
        readAppro: currentPermission?.readAppro || false,
        createAppro: currentPermission?.createAppro || false,
        updateAppro: currentPermission?.updateAppro || false,
        deleteAppro: currentPermission?.deleteAppro || false,
        readDepense: currentPermission?.readDepense || false,
        createDepense: currentPermission?.createDepense || false,
        updateDepense: currentPermission?.updateDepense || false,
        deleteDepense: currentPermission?.deleteDepense || false,
        readSortie: currentPermission?.readSortie || false,

        readTypeDeDepense: currentPermission?.readTypeDeDepense || false,
        createTypeDeDepense: currentPermission?.createTypeDeDepense || false,
        updateTypeDeDepense: currentPermission?.updateTypeDeDepense || false,
        deleteTypeDeDepense: currentPermission?.deleteTypeDeDepense || false,

        bloqueDepense: currentPermission?.bloqueDepense || false,
        dechargeDepense: currentPermission?.dechargeDepense || false,
        rejectDepense: currentPermission?.rejectDepense || false,
        payeDepense: currentPermission?.payeDepense || false,

        updatePermission: currentPermission?.updatePermission || false,

        readDashboard: currentPermission?.readDashboard || false,

        readPermission: currentPermission?.readPermission || false,
      });
    }
  }, [currentPermission, reset]);

  useEffect(() => {
    if (socket) {
      socket.on("user_updated", refreshPermissionList);
      return () => {
        socket.off("user_updated", refreshPermissionList);
      };
    }
  }, [socket, refreshPermissionList]);

  return (
    <div className="row">
      <a
        ref={addPermissionLinkRef}
        className="modal-effect btn btn-primary d-grid mb-3"
        data-bs-effect="effect-rotate-bottom"
        data-bs-toggle="modal"
        href="#modaldemo8"
        style={{ cursor: "pointer", visibility: "hidden" }}
        disabled
      >
        Modification de la permission
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
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="row gy-4 formCustom"
              >
                {/* Utilisateurs accès */}
                <div className="tw-border tw-p-4 tw-rounded-lg">
                  <h6 className="text-xl font-semibold mb-3">
                    Permissions sur les accès
                  </h6>

                  <input
                    type="number"
                    className="form-control tw-absolute tw-top-0 tw-hidden"
                    id="profilId"
                    {...register("profilId")}
                  />

                  <div className="form-check tw-flex tw-justify-start">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="readPermission"
                      {...register("readPermission")}
                    />
                    <label
                      className="form-check-label tw-ml-2"
                      htmlFor="readPermission"
                    >
                      Lire les permissions
                    </label>
                  </div>
                  <div className="form-check tw-flex tw-justify-start">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="updatePermission"
                      {...register("updatePermission")}
                    />
                    <label
                      className="form-check-label tw-ml-2"
                      htmlFor="updatePermission"
                    >
                      Modifier une permission
                    </label>
                  </div>
                </div>

                <div className="tw-border tw-p-4 tw-rounded-lg">
                  <h6 className="text-xl font-semibold mb-3">
                    Tableau de board
                  </h6>
                  <div className="form-check tw-flex tw-justify-start">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="readDashboard"
                      {...register("readDashboard")}
                    />
                    <label
                      className="form-check-label tw-ml-2"
                      htmlFor="readDashboard"
                    >
                      Voir le tableau de board
                    </label>
                  </div>
                </div>

                <div className="tw-border tw-p-4 tw-rounded-lg">
                  <h6 className="text-xl font-semibold mb-3">
                    Permissions Utilisateurs
                  </h6>

                  <div className="form-check tw-flex tw-justify-start">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="readUser"
                      {...register("readUser")}
                    />
                    <label
                      className="form-check-label tw-ml-2"
                      htmlFor="readUser"
                    >
                      Lire Utilisateur
                    </label>
                  </div>
                  <div className="form-check tw-flex tw-justify-start">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="createUser"
                      {...register("createUser")}
                    />
                    <label
                      className="form-check-label tw-ml-2"
                      htmlFor="createUser"
                    >
                      Créer Utilisateur
                    </label>
                  </div>
                  <div className="form-check tw-flex tw-justify-start">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="updateUser"
                      {...register("updateUser")}
                    />
                    <label
                      className="form-check-label tw-ml-2"
                      htmlFor="updateUser"
                    >
                      Modifier Utilisateur
                    </label>
                  </div>
                  <div className="form-check tw-flex tw-justify-start">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="deleteUser"
                      {...register("deleteUser")}
                    />
                    <label
                      className="form-check-label tw-ml-2"
                      htmlFor="deleteUser"
                    >
                      Supprimer Utilisateur
                    </label>
                  </div>
                </div>

                {/* Appro Permissions */}

                <div className="tw-border tw-p-4 tw-rounded-lg">
                  <h6 className="text-xl font-semibold mb-3">Sortie</h6>
                  <div className="form-check tw-flex tw-justify-start">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="bloqueDepense"
                      {...register("bloqueDepense")}
                    />
                    <label
                      className="form-check-label tw-ml-2"
                      htmlFor="bloqueDepense"
                    >
                      Bloquer une dépense
                    </label>
                  </div>
                  <div className="form-check tw-flex tw-justify-start">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="dechargeDepense"
                      {...register("dechargeDepense")}
                    />
                    <label
                      className="form-check-label tw-ml-2"
                      htmlFor="dechargeDepense"
                    >
                      Mettre unde décharge
                    </label>
                  </div>
                  <div className="form-check tw-flex tw-justify-start">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="payeDepense"
                      {...register("payeDepense")}
                    />
                    <label
                      className="form-check-label tw-ml-2"
                      htmlFor="payeDepense"
                    >
                      Décaissé
                    </label>
                  </div>
                  <div className="form-check tw-flex tw-justify-start">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="rejectDepense"
                      {...register("rejectDepense")}
                    />
                    <label
                      className="form-check-label tw-ml-2"
                      htmlFor="rejectDepense"
                    >
                      Rejeter une dépense
                    </label>
                  </div>
                </div>

                <div className="tw-border tw-p-4 tw-rounded-lg">
                  <h6 className="text-xl font-semibold mb-3">
                    Approvisionnement
                  </h6>
                  <div className="form-check tw-flex tw-justify-start">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="readAppro"
                      {...register("readAppro")}
                    />
                    <label
                      className="form-check-label tw-ml-2"
                      htmlFor="readAppro"
                    >
                      Lire
                    </label>
                  </div>
                  <div className="form-check tw-flex tw-justify-start">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="createAppro"
                      {...register("createAppro")}
                    />
                    <label
                      className="form-check-label tw-ml-2"
                      htmlFor="createAppro"
                    >
                      Créer
                    </label>
                  </div>
                  <div className="form-check tw-flex tw-justify-start">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="updateAppro"
                      {...register("updateAppro")}
                    />
                    <label
                      className="form-check-label tw-ml-2"
                      htmlFor="updateAppro"
                    >
                      Modifier
                    </label>
                  </div>
                  <div className="form-check tw-flex tw-justify-start">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="deleteAppro"
                      {...register("deleteAppro")}
                    />
                    <label
                      className="form-check-label tw-ml-2"
                      htmlFor="deleteAppro"
                    >
                      Supprimer
                    </label>
                  </div>
                </div>

                {/* Depense Permissions */}
                <div className="tw-border tw-p-4 tw-rounded-lg">
                  <h6 className="text-xl font-semibold mb-3">
                    Permissions Depense
                  </h6>
                  <div className="form-check tw-flex tw-justify-start">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="readDepense"
                      {...register("readDepense")}
                    />
                    <label
                      className="form-check-label tw-ml-2"
                      htmlFor="readDepense"
                    >
                      Lire Depense
                    </label>
                  </div>
                  <div className="form-check tw-flex tw-justify-start">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="createDepense"
                      {...register("createDepense")}
                    />
                    <label
                      className="form-check-label tw-ml-2"
                      htmlFor="createDepense"
                    >
                      Créer Depense
                    </label>
                  </div>
                  <div className="form-check tw-flex tw-justify-start">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="updateDepense"
                      {...register("updateDepense")}
                    />
                    <label
                      className="form-check-label tw-ml-2"
                      htmlFor="updateDepense"
                    >
                      Modifier Depense
                    </label>
                  </div>
                  <div className="form-check tw-flex tw-justify-start">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="deleteDepense"
                      {...register("deleteDepense")}
                    />
                    <label
                      className="form-check-label tw-ml-2"
                      htmlFor="deleteDepense"
                    >
                      Supprimer Depense
                    </label>
                  </div>
                  <div className="form-check tw-flex tw-justify-start">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="readSortie"
                      {...register("readSortie")}
                    />
                    <label
                      className="form-check-label tw-ml-2"
                      htmlFor="readSortie"
                    >
                      Voir les sorties
                    </label>
                  </div>
                </div>

                {/* TypeDeDepense Permissions */}
                <div className="tw-border tw-p-4 tw-rounded-lg">
                  <h6 className="text-xl font-semibold mb-3">
                    Permissions TypeDeDepense
                  </h6>
                  <div className="form-check tw-flex tw-justify-start">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="readTypeDeDepense"
                      {...register("readTypeDeDepense")}
                    />
                    <label
                      className="form-check-label tw-ml-2"
                      htmlFor="readTypeDeDepense"
                    >
                      Lire
                    </label>
                  </div>
                  <div className="form-check tw-flex tw-justify-start">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="createTypeDeDepense"
                      {...register("createTypeDeDepense")}
                    />
                    <label
                      className="form-check-label tw-ml-2"
                      htmlFor="createTypeDeDepense"
                    >
                      Créer
                    </label>
                  </div>
                  <div className="form-check tw-flex tw-justify-start">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="updateTypeDeDepense"
                      {...register("updateTypeDeDepense")}
                    />
                    <label
                      className="form-check-label tw-ml-2"
                      htmlFor="updateTypeDeDepense"
                    >
                      Modifier
                    </label>
                  </div>
                  <div className="form-check tw-flex tw-justify-start">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="deleteTypeDeDepense"
                      {...register("deleteTypeDeDepense")}
                    />
                    <label
                      className="form-check-label tw-ml-2"
                      htmlFor="deleteTypeDeDepense"
                    >
                      Supprimer
                    </label>
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={updatePermission.isLoading}
                  >
                    {updatePermission.isLoading
                      ? "Mise à jour en cours..."
                      : "Mettre à jour"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-light"
                    data-bs-dismiss="modal"
                  >
                    Annuler
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

UpdatePermission.propTypes = {
  currentPermissionId: PropTypes.string,
  refreshPermissionList: PropTypes.func.isRequired,
};

export default UpdatePermission;

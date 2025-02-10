import { useMutation } from "@tanstack/react-query";
import PropTypes from "prop-types";
import { useEffect, useRef } from "react";
import toast from "react-hot-toast";
import axiosInstance from "../../config/axiosConfig";

function DeleteUser({ currentDeleteUserId, refreshUserList }) {
  const prevDomainIdRef = useRef();
  const addDomainLinkRef = useRef();

  const createDomain = useMutation(
    (param) =>
      axiosInstance.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/user?userId=${param}`
      ),
    {
      onSuccess: (response) => {
        toast.success(response?.data?.message);
        refreshUserList();
        currentDeleteUserId = "";
        const closeButton = document.querySelector("#deleteModal .btn-close");
        if (closeButton) {
          closeButton.click();
        }
      },

      onError: (error) => {
        console.log(error?.response?.data?.error);

        const validationErrors = error?.response?.data?.error;

        if (validationErrors && Array.isArray(validationErrors)) {
          validationErrors.forEach((error) => {
            toast.error(error.message, { duration: 12000 });
          });
        } else {
          toast.error(
            error?.response?.data?.error ||
              error?.response?.data?.message ||
              error?.response?.data,
            { duration: 12000 }
          );
        }
      },
    }
  );

  const deleteEntrie = () => {
    // Lancer la mutation pour supprimer le domaine
    if (currentDeleteUserId) {
      createDomain.mutate(currentDeleteUserId);
    }
  };

  useEffect(() => {
    if (
      currentDeleteUserId &&
      currentDeleteUserId !== prevDomainIdRef.current
    ) {
      prevDomainIdRef.current = currentDeleteUserId;
      if (addDomainLinkRef.current) {
        addDomainLinkRef.current.click();
      }
    }
  }, [currentDeleteUserId]);

  return (
    <div className="row">
      <a
        ref={addDomainLinkRef}
        data-bs-effect="effect-rotate-bottom"
        data-bs-toggle="modal"
        href="#deleteModal"
        style={{ cursor: "pointer" }}
      ></a>

      <div
        className="modal fade"
        id="deleteModal"
        tabIndex="-1"
        data-bs-backdrop="static"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content tw-rounded-lg tw-border tw-p-2">
            <div className="modal-header">
              <h1 className="modal-title tw-text-lg text-danger">
                ACTION IRREVERSIBLE{" "}
              </h1>
              <button
                aria-label="Close"
                className="btn-close"
                data-bs-dismiss="modal"
              ></button>
            </div>
            <div className="modal-body text-start">
              <div className="">
                <div className="tw-flex tw-items-center tw-justify-center">
                  <svg
                    className="custom-alert-icon svg-danger"
                    xmlns="http://www.w3.org/2000/svg"
                    height="3rem"
                    viewBox="0 0 24 24"
                    width="3rem"
                    fill="#000000"
                  >
                    <path d="M0 0h24v24H0z" fill="none" />
                    <path d="M15.73 3H8.27L3 8.27v7.46L8.27 21h7.46L21 15.73V8.27L15.73 3zM12 17.3c-.72 0-1.3-.58-1.3-1.3 0-.72.58-1.3 1.3-1.3.72 0 1.3.58 1.3 1.3 0 .72-.58 1.3-1.3 1.3zm1-4.3h-2V7h2v6z" />
                  </svg>
                  <h5 className="tw-text-2xl text-danger">Danger</h5>
                </div>
              </div>

              <div className="my-3 max-w-full">
                <div className="text-center">
                  <p className="tw-text-lg">
                    Cet utilisateur sera supprimée ainsi que <br /> toutes les
                    dépendances. Voulez-vous continuer ?
                  </p>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <div className="">
                <button
                  onClick={deleteEntrie}
                  className="btn btn-sm btn-outline-success m-1"
                >
                  Oui
                </button>
                <button
                  data-bs-dismiss="modal"
                  className="btn btn-sm btn-danger m-1 "
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

DeleteUser.propTypes = {
  currentDeleteUserId: PropTypes.number,
  refreshUserList: PropTypes.func,
};

export default DeleteUser;

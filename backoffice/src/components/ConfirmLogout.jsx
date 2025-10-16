import { useMutation } from "@tanstack/react-query";
import PropTypes from "prop-types";
import { useEffect, useRef } from "react";
import toast from "react-hot-toast";
import axiosInstance from "../config/axiosConfig";

function ConfirmLogout({ userId, token, onCancel }) {
  const prevDomainIdRef = useRef();
  const addDomainLinkRef = useRef();

  // Mutation to handle the logout process
  const revoke = useMutation(
    () =>
      axiosInstance.delete(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/v1/logout?token=${token}&userId=${userId}`
      ),
    {
      onSuccess: (response) => {
        toast.success(response?.data?.message); // Show success message
        userId = ""; // Clear the userId after successful logout
        const closeButton = document.querySelector("#deleteModal .btn-close");
        if (closeButton) {
          closeButton.click(); // Close the modal after logout
        }
      },

      onError: (error) => {
        const validationErrors = error?.response?.data?.error;

        if (validationErrors && Array.isArray(validationErrors)) {
          validationErrors.forEach((error) => {
            toast.error(error.message, { duration: 12000 }); // Show validation errors
          });
        } else {
          toast.error(error?.response?.data?.message, { duration: 12000 }); // Show general error
        }
      },
    }
  );

  const handleLogout = () => {
    if (userId && token) {
      revoke.mutate(); // Call the revoke mutation to log out the user
    }
  };

  useEffect(() => {
    if (userId && userId !== prevDomainIdRef.current) {
      prevDomainIdRef.current = userId;
      if (addDomainLinkRef.current) {
        addDomainLinkRef.current.click();
      }
    }
  }, [userId]);

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
                ACTION IRREVERSIBLE
              </h1>
              <button
                aria-label="Close"
                className="btn-close"
                data-bs-dismiss="modal"
              ></button>
            </div>
            <div className="modal-body text-start">
              <div className="tw-fixed tw-inset-0 tw-bg-black tw-bg-opacity-50 tw-flex tw-items-center tw-justify-center">
                <div className="tw-bg-white tw-p-4 tw-rounded-lg tw-shadow-lg">
                  <p className="tw-text-center tw-text-lg tw-font-semibold">
                    Êtes-vous sûr de vouloir vous déconnecter ?
                  </p>
                  <div className="tw-flex tw-space-x-4 tw-justify-center tw-mt-4">
                    <button
                      onClick={handleLogout}
                      className="tw-px-4 tw-py-2 tw-bg-red-600 tw-text-white tw-rounded-md hover:tw-bg-red-700"
                    >
                      Oui, Déconnexion
                    </button>
                    <button
                      onClick={onCancel}
                      className="tw-px-4 tw-py-2 tw-bg-gray-600 tw-text-white tw-rounded-md hover:tw-bg-gray-700"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <div className="">
                <button
                  onClick={handleLogout} // Trigger logout mutation
                  className="btn btn-sm btn-outline-success m-1"
                >
                  Oui
                </button>
                <button
                  data-bs-dismiss="modal"
                  className="btn btn-sm btn-danger m-1"
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

ConfirmLogout.propTypes = {
  userId: PropTypes.number.isRequired,
  token: PropTypes.string.isRequired,
  onConfirm: PropTypes.func,
  onCancel: PropTypes.func,
};

export default ConfirmLogout;

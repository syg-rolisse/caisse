import { useMutation } from "@tanstack/react-query";
import PropTypes from "prop-types";
import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../config/axiosConfig";
function ProfileComponent({ onClose, user }) {
  const [selectedImage, setSelectedImage] = useState(null); // Aperçu de l'image choisie
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    address: user?.address || "",
    phoneNumber: user?.phoneNumber || "",
    avatar: null, // Nouvelle variable pour le fichier image
  });

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      setFormData({ ...formData, avatar: file });
    }
  };

  const navigate = useNavigate();

  const { mutate } = useMutation(
    () =>
      axiosInstance.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/logout`,
        {}
      ),
    {
      onSuccess: () => {
        localStorage.removeItem("user");
        navigate("/");
      },
      onError: (err) => {
        console.error("Erreur lors de la déconnexion:", err);
      },
    }
  );

  const handleError = (error) => {
    const validationErrors = error?.response?.data?.error;
    if (validationErrors && Array.isArray(validationErrors)) {
      validationErrors.forEach((err) =>
        toast.error(err.message, { duration: 12000 })
      );
    } else {
      console.log(error?.response?.data);

      toast.error(
        error?.response?.data?.error ||
          error?.response?.data?.message ||
          error?.response?.data,
        {
          duration: 12000,
        }
      );
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Mutation pour envoyer les nouvelles données
  const updateUser = useMutation(
    ({ data }) =>
      axiosInstance.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/user?userId=${user.id}`,
        data
      ),
    {
      onSuccess: () => {
        toast.success(
          "Modification éffectuée avec succès. Vous serez déconnecté sous peu.",
          { duration: 3000 }
        );

        setIsEditing(false);
        onClose();

        // Delay logout after 3 seconds to match the toast duration
        setTimeout(() => {
          mutate(); // Trigger the logout mutation
        }, 3000);
      },

      onError: handleError,
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();

    const formDataToSend = new FormData();
    formDataToSend.append("fullName", formData.fullName);
    formDataToSend.append("profilId", user?.profilId);
    formDataToSend.append("email", formData.email);
    formDataToSend.append("address", formData.address);
    formDataToSend.append("phoneNumber", formData.phoneNumber);
    if (formData.avatar) {
      formDataToSend.append("avatar", formData.avatar);
    }

    updateUser.mutate({ data: formDataToSend });
  };

  return (
    <div className="modal-overlay tw-z-9 tw-fixed tw-top-0 tw-left-0 tw-w-full tw-h-full tw-flex tw-justify-center tw-items-center">
      <div className="tw-fixed tw-inset-0 tw-backdrop-blur-[10px]"></div>
      <div className="tw-w-[400px] max-sm:tw-w-[80%] tw-relative card tw-border-4 tw-border-zinc-600 tw-rounded-md tw-p-4">
       
        <div className="tw-flex tw-justify-between tw-items-center">
          <h5>
            E-mail : &nbsp;
            <span
              className={`badge badge-sm rounded-pill ${
                user.validEmail
                  ? "bg-success-transparent text-success"
                  : "bg-danger-transparent tw-text-red-500"
              }`}
            >
              {user.validEmail ? "Valide" : "Invalide"}
            </span>
          </h5>
          <h5>
            Status : &nbsp;
            <span
              className={`badge badge-sm rounded-pill ${
                user.status
                  ? "bg-success-transparent text-success"
                  : "bg-danger-transparent tw-text-red-500"
              }`}
            >
              {user.status ? "Valide" : "Invalide"}
            </span>
          </h5>
          <button
            className="btn btn-secondary"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? "Annuler" : "Modifier"}
          </button>

          <button
          onClick={onClose}
          className="absolute bg-danger tw-rounded-md tw-p-1 tw-top-2 tw-right-2 tw-text-xl tw-text-gray-500 hover:tw-text-gray-700"
        >
          <i className="bi bi-x-circle tw-text-white tw-opacity-50"></i> {/* Icône de fermeture */}
        </button>
        </div>

        {!isEditing ? (
          // Affichage statique
          <div className=" tw-p-4 tw-w-full">
            <div className="tw-flex tw-justify-center tw-items-center tw-mb-4">
              <div className="tw-relative tw-w-32 tw-h-32 tw-rounded-full tw-shadow-lg tw-mx-auto">
                <img
                  src={`${import.meta.env.VITE_BACKEND_URL}/uploads/${
                    user?.avatarUrl
                      ? user.avatarUrl
                      : "avatars/ri3uadefault.jpg"
                  }`}
                  alt="Avatar"
                  className="tw-w-full tw-h-full tw-object-cover tw-rounded-full"
                />
                <button
                  type="button"
                  className="bi bi-camera tw-absolute tw-bottom-2 tw-right-2 tw-bg-black tw-rounded-full tw-text-white tw-p-2"
                  onClick={() => document.getElementById("fileInput").click()}
                ></button>
                <input
                  id="fileInput"
                  type="file"
                  className="tw-hidden"
                  onChange={handleFileChange}
                />
              </div>
            </div>
            <div className="tw-text-center">
              <h6 className="tw-text-lg tw-font-bold tw-mt-2">
                {user?.fullName}
              </h6>
              <p className="tw-text-gray-600">Web Designer</p>
            </div>
            <div className="tw-mt-4">
              <div className="tw-flex tw-items-center tw-mb-3">
                <i className="bi bi-envelope tw-text-lg tw-mr-2"></i>
                <span className="tw-font-semibold">Email:</span>
                <span className="tw-ml-2">{user?.email}</span>
              </div>
              <div className="tw-flex tw-items-center tw-mb-3">
                <i className="bi bi-geo-alt tw-text-lg tw-mr-2"></i>
                <span className="tw-font-semibold">Adresse:</span>
                <span className="tw-ml-2">{user?.address}</span>
              </div>
              <div className="tw-flex tw-items-center tw-mb-3">
                <i className="bi bi-phone tw-text-lg tw-mr-2"></i>
                <span className="tw-font-semibold">Téléphone:</span>
                <span className="tw-ml-2">{user?.phoneNumber}</span>
              </div>
            </div>
          </div>
        ) : (
          // Formulaire d'édition
          <form className="tw-space-y-4" onSubmit={handleSubmit}>
            <div className="tw-relative tw-w-32 tw-h-32 tw-rounded-full tw-mx-auto tw-bg-gray-200">
              <img
                src={
                  selectedImage
                    ? selectedImage
                    : `${import.meta.env.VITE_BACKEND_URL}/uploads/${
                        user?.avatarUrl
                          ? user.avatarUrl
                          : "avatars/ri3uadefault.jpg"
                      }`
                }
                alt="Avatar"
                style={{
                  width: "130px",
                  height: "130px",
                  objectFit: "cover",
                  borderRadius: "50%",
                }}
              />
              <button
                type="button"
                className="bi bi-camera tw-absolute tw-bottom-0 tw-right-0 tw-bg-black tw-rounded-full tw-text-white tw-p-2"
                onClick={() => document.getElementById("fileInput").click()}
              ></button>
              <input
                id="fileInput"
                type="file"
                className="tw-hidden"
                onChange={handleFileChange}
              />
            </div>

            <div className="form-group tw-mt-3">
              <label className="tw-mb-2">Nom complet</label>
              <input
                type="text"
                name="fullName"
                className="form-control"
                value={formData.fullName}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group tw-mt-3">
              <label className="tw-mb-2">Email</label>
              <input
                type="email"
                name="email"
                className="form-control"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group tw-mt-3">
              <label className="tw-mb-2">Adresse</label>
              <input
                type="text"
                name="address"
                className="form-control"
                value={formData.address}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group tw-mt-3">
              <label className="tw-mb-2">Téléphone</label>
              <input
                type="text"
                name="phoneNumber"
                className="form-control"
                value={formData.phoneNumber}
                onChange={handleInputChange}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary tw-w-full tw-mt-3"
              disabled={updateUser.isLoading}
            >
              {updateUser.isLoading ? "Mise à jour..." : "Sauvegarder"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

ProfileComponent.propTypes = {
  onClose: PropTypes.func.isRequired,
  user: PropTypes.object.isRequired,
};

export default function Profile() {
  const [isModalOpen, setModalOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem("user")); // Récupérer l'utilisateur

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  return (
    <div>
      <a
        href="#"
        onClick={openModal}
        className="tw-block tw-px-4 tw-py-2 tw-text-sm tw-text-gray-700 tw-hover:bg-gray-100"
      >
        Profil
      </a>

      {isModalOpen && <ProfileComponent onClose={closeModal} user={user} />}
    </div>
  );
}

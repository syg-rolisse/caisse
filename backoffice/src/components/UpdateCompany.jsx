import { useMutation } from "@tanstack/react-query";
import PropTypes from "prop-types";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../config/axiosConfig";
import { useForm } from "react-hook-form";
function UpdateCompanyComponent({ onClose, currentCompanyId }) {
  const [selectedImage, setSelectedImage] = useState(null); // Aperçu de l'image choisie
  const [isEditing, setIsEditing] = useState(false);
  const [company, setCurrentCompany] = useState();

  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      companyName: "",
      address: "",
      phoneNumber: "",
      avatar: null,
    },
  });

  const prevTypeDepenseIdRef = useRef();
  const addTypeDepenseLinkRef = useRef();

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      reset({ avatar: file });
    }
  };

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

  const fetchCompany = useMutation(
    (companieId) =>
      axiosInstance.get(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/v1/company?companieId=${companieId}`
      ),
    {
      onSuccess: (response) => {
        setCurrentCompany(response.data.companie);
      },
      onError: handleError,
    }
  );

  useEffect(() => {
    if (company) {
      reset({
        companyName: company.companyName || "",
        address: company.address || "",
        phoneNumber: company.phoneNumber || "",
      });
    }
  }, [company, reset]);

  useEffect(() => {
    if (currentCompanyId && currentCompanyId !== prevTypeDepenseIdRef.current) {
      prevTypeDepenseIdRef.current = currentCompanyId;
      fetchCompany.mutate(currentCompanyId);
      addTypeDepenseLinkRef.current?.click();
    }
  }, [currentCompanyId]);

  // Mutation pour envoyer les nouvelles données
  const updateCompany = useMutation(
    ({ data }) =>
      axiosInstance.put(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/v1/company?companieId=${currentCompanyId}`,
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

  const onSubmit = (data) => {
    console.log(data);

    const formDataToSend = new FormData();
    formDataToSend.append("companyName", data.companyName);
    formDataToSend.append("address", data.address);
    formDataToSend.append("phoneNumber", data.phoneNumber);
    if (data.avatar) {
      formDataToSend.append("avatar", data.avatar);
    }

    updateCompany.mutate({ data: formDataToSend });
  };

  // const handleSubmit = (event) => {
  //   event.preventDefault(); // Empêche le comportement par défaut de la soumission du formulaire

  //   const formData = new FormData(event.target);

  //   console.log(...formData); // Affiche toutes les paires clé/valeur pour débogage

  //   const formDataToSend = new FormData();
  //   formDataToSend.append("fullName", formData.get("fullName"));
  //   formDataToSend.append("email", formData.get("email"));
  //   formDataToSend.append("address", formData.get("address"));
  //   formDataToSend.append("phoneNumber", formData.get("phoneNumber"));
  //   if (formData.get("avatar")) {
  //     formDataToSend.append("avatar", formData.get("avatar"));
  //   }

  //   console.log(formDataToSend);

  //   updateCompany.mutate({ data: formDataToSend });
  // };

  return (
    <div className="modal-overlay tw-z-9 tw-fixed tw-top-0 tw-left-0 tw-w-full tw-h-full tw-flex tw-justify-center tw-items-center">
      <div className="tw-fixed tw-inset-0 tw-backdrop-blur-[10px]"></div>
      <div className="tw-w-[400px] max-sm:tw-w-[80%] tw-relative card tw-border-4 tw-border-zinc-600 tw-rounded-md tw-p-4">
        <div className="tw-flex tw-justify-end tw-gap-3 tw-items-center tw-mb-4">
          <h5>
            Status : &nbsp;
            <span
              className={`badge badge-sm rounded-pill ${
                company?.status
                  ? "bg-success-transparent text-success"
                  : "bg-danger-transparent tw-text-red-500"
              }`}
            >
              {company?.status ? "Valide" : "Invalide"}
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
            <i className="bi bi-x-circle tw-text-white tw-opacity-50"></i>{" "}
            {/* Icône de fermeture */}
          </button>
        </div>

        {!isEditing ? (
          // Affichage statique
          <div className=" tw-p-4 tw-w-full">
            <div className="tw-flex tw-justify-center tw-items-center tw-mb-4">
              <div className="tw-relative tw-w-32 tw-h-32 tw-rounded-full tw-shadow-lg tw-mx-auto">
                <img
                  src={`${import.meta.env.VITE_BACKEND_URL}/uploads/${
                    company?.logoUrl
                      ? company.logoUrl
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
                {company?.fullName}
              </h6>
              <p className="tw-text-gray-600">Web Designer</p>
            </div>
            <div className="tw-mt-4">
              <div className="tw-flex tw-items-center tw-mb-3">
                <i className="bi bi-envelope tw-text-lg tw-mr-2"></i>
                <span className="tw-font-semibold">ENTITE:</span>
                <span className="tw-ml-2">{company?.companyName}</span>
              </div>
              <div className="tw-flex tw-items-center tw-mb-3">
                <i className="bi bi-geo-alt tw-text-lg tw-mr-2"></i>
                <span className="tw-font-semibold">Adresse:</span>
                <span className="tw-ml-2">{company?.address}</span>
              </div>
              <div className="tw-flex tw-items-center tw-mb-3">
                <i className="bi bi-phone tw-text-lg tw-mr-2"></i>
                <span className="tw-font-semibold">Téléphone:</span>
                <span className="tw-ml-2">{company?.phoneNumber}</span>
              </div>
            </div>
          </div>
        ) : (
          // Formulaire d'édition
          <form className="tw-space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="tw-relative tw-w-32 tw-h-32 tw-rounded-full tw-mx-auto tw-bg-gray-200">
              <img
                src={
                  selectedImage
                    ? selectedImage
                    : `${import.meta.env.VITE_BACKEND_URL}/uploads/${
                        company?.logoUrl
                          ? company.logoUrl
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
              <label className="tw-mb-2">Nom de l&apos;entreprise</label>
              <input
                type="text"
                className={`form-control form-control-lg ${
                  errors.companyName ? "is-invalid" : ""
                }`}
                id="companyName"
                placeholder="Entrer votre nom et prénoms..."
                {...register("companyName", {
                  required: "Le nom est obligatoire...",
                })}
              />

              {errors.companyName && (
                <span className="tw-text-red-500">
                  {errors.companyName.message}
                </span>
              )}
            </div>

            <div className="col-xl-12 mt-3">
              <label htmlFor="address" className="form-label text-default">
                Adresse de l&apos;entreprise
              </label>
              <input
                type="text"
                className={`form-control form-control-lg ${
                  errors.address ? "is-invalid" : ""
                }`}
                id="address"
                placeholder="Entrer le nom de l'entreprise..."
                {...register("address", {
                  required: "Le nom est obligatoire...",
                })}
              />

              {errors.address && (
                <span className="tw-text-red-500">
                  {errors.address.message}
                </span>
              )}
            </div>

            <div className="form-group tw-mt-3">
              <label className="tw-mb-2">Téléphone</label>
              <input
                type="text"
                className={`form-control form-control-lg ${
                  errors.phoneNumber ? "is-invalid" : ""
                }`}
                id="phoneNumber"
                placeholder="Entrer contact..."
                {...register("phoneNumber", {
                  required: "Le contact est obligatoire...",
                })}
              />

              {errors.phoneNumber && (
                <span className="tw-text-red-500">
                  {errors.phoneNumber.message}
                </span>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary tw-w-full tw-mt-3"
              disabled={updateCompany.isLoading}
            >
              {updateCompany.isLoading ? "Mise à jour..." : "Sauvegarder"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

UpdateCompanyComponent.propTypes = {
  onClose: PropTypes.func.isRequired,
  currentCompanyId: PropTypes.number.isRequired,
  user: PropTypes.object.isRequired,
};

export default function UpdateCompany() {
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
        Entreprise
      </a>

      {isModalOpen && (
        <UpdateCompanyComponent
          currentCompanyId={user?.company.id} // Assure-toi que `companyId` est un nombre/chaîne
          onClose={closeModal}
          user={user}
        />
      )}
    </div>
  );
}

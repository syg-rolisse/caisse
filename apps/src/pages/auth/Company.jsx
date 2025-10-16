import { useMutation } from "@tanstack/react-query";
import PropTypes from "prop-types"; // Importer PropTypes
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { RiEyeLine, RiEyeOffLine } from "react-icons/ri";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import axiosInstance from "../../config/axiosConfig";

function Company({ onSwitch }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [phoneNumber, setPhone] = useState("");
  const [formData, setFormData] = useState({
    avatar: null,
  });

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm({ defaultValues: { phoneNumber: "" } });

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword((prev) => !prev);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      setFormData({ ...formData, avatar: file });
    }
  };

  const fetchCompany = useMutation(
    (data) =>
      axiosInstance.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/register`,
        data
      ),
    {
      onSuccess: (response) => {
        toast.success(response?.data?.message, { duration: 12000 });
        reset();
        onSwitch("login");
      },
      onError: (error) => {
        const validationErrors = error?.response?.data?.error;

        if (validationErrors && Array.isArray(validationErrors)) {
          validationErrors.forEach((error) => {
            toast.error(error.message, { duration: 12000 });
          });
        } else {
          toast.error(
            error?.response?.data?.message ||
              error?.response?.data?.error ||
              error?.response?.data,
            { duration: 12000 }
          );
        }

        //toast.error(error?.response?.data?.error, { autoClose: 1000 });
      },
    }
  );

  const onSubmit = (data) => {
    const formDataToSend = new FormData();
    formDataToSend.append("companyName", data.companyName);
    formDataToSend.append("fullName", data.fullName);
    formDataToSend.append("email", data.email);
    formDataToSend.append("address", data.address);
    formDataToSend.append("phoneNumber", data.phoneNumber);
    formDataToSend.append("password", data.password);

    if (formData.avatar) {
      formDataToSend.append("avatar", formData.avatar);
    }
    formDataToSend.append("profilId", 1);
    const datas = formDataToSend;

    console.log(datas);

    fetchCompany.mutate(datas);
  };

  return (
    <div className="tw-relative tw-h-screen tw-w-screen">
      <img
        src="assets/images/media/caisse.jpg"
        className="tw-absolute tw-inset-0 tw-w-full tw-h-full tw-object-cover"
        alt="Logo"
      />

      <div className="tw-fixed tw-inset-0 tw-backdrop-blur-[10px]"></div>

      <div className="row justify-content-center align-items-center tw-h-screen">
        <div className="col-xxl-3 tw-z-50 col-xl-4 col-lg-5 col-md-5 col-sm-8 col-10 max-sm:tw-mt-28">
          <div className="p-1 tw-rounded-lg gradient-border ">
            <div className="bg-white tw-rounded-lg p-3">
              <div className="p-3 tw-border tw-border-zinc-200 tw-rounded-lg tw-max-h-[70vh] tw-overflow-y-auto">
                <p className="h5 fw-semibold bariecito-policy">Inscription</p>
                <div className="tw-ml-3">
                  <li className="tw-my-2"> Créer votre entreprise</li>

                  <li className="tw-my-2">Un compte admin y sera associé.</li>
                </div>

                <div className="text-center my-4 authentication-barrier">
                  <span className="tw-text-orange-500 bariecito-policy">
                    GESTION CAISSE
                  </span>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="row gy-3">
                  <div className="tw-relative tw-w-32 tw-h-32 tw-rounded-full tw-mx-auto tw-bg-gray-200">
                    <img
                      src={
                        selectedImage
                          ? selectedImage
                          : "avatars/ri3uadefault.jpg"
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
                      onClick={() =>
                        document.getElementById("fileInput").click()
                      }
                    ></button>
                    <input
                      id="fileInput"
                      type="file"
                      className="tw-hidden"
                      onChange={handleFileChange}
                    />
                  </div>

                  <div className="col-xl-12 mb-3">
                    <label
                      htmlFor="companyName"
                      className="form-label text-default"
                    >
                      Nom de l&apos;entreprise
                    </label>
                    <input
                      type="text"
                      className={`form-control form-control-lg ${
                        errors.companyName ? "is-invalid" : ""
                      }`}
                      id="companyName"
                      placeholder="Entrer le nom de l'entreprise..."
                      {...register("companyName", {
                        required: "Le nom de l'entreprise est obligatoire...",
                      })}
                    />
                  </div>

                  <div className="col-xl-12 mt-0">
                    <label
                      htmlFor="fullName"
                      className="form-label text-default"
                    >
                      Nom & Prénoms
                    </label>
                    <input
                      type="text"
                      className={`form-control form-control-lg ${
                        errors.fullName ? "is-invalid" : ""
                      }`}
                      id="fullName"
                      placeholder="Entrer votre nom et prénoms..."
                      {...register("fullName", {
                        required: "Le nom est obligatoire...",
                      })}
                    />
                  </div>

                  <div className="col-xl-12">
                    <label htmlFor="email" className="form-label text-default">
                      Adresse mail de l&apos;entreprise
                    </label>
                    <input
                      type="text"
                      className={`form-control form-control-lg ${
                        errors.email ? "is-invalid" : ""
                      }`}
                      id="email"
                      placeholder="Adresse mail..."
                      {...register("email", {
                        required: "L'email est obligatoire",
                      })}
                    />
                  </div>

                  <div className="col-xl-12">
                    <label
                      htmlFor="phoneNumber"
                      className="form-label text-default"
                    >
                      Téléphone
                    </label>
                    <PhoneInput
                      name="phoneNumber"
                      country={"bj"}
                      value={phoneNumber}
                      regions={"africa"}
                      inputStyle={{
                        width: "100%",
                        height: "45px",
                        backgroundColor: "rgba(255, 255, 255, 1)",
                        border: "1px solid #ddd",
                      }}
                      enableSearch={true}
                      onChange={(phoneNumber, data) => {
                        setPhone(phoneNumber);
                        setValue("phoneNumber", phoneNumber);
                        setValue("countryCode", data.dialCode);
                      }}
                    />
                  </div>

                  <div className="col-xl-12 mt-3">
                    <label
                      htmlFor="address"
                      className="form-label text-default"
                    >
                      Adresse de l&apos;entreprise
                    </label>
                    <input
                      type="text"
                      className={`form-control form-control-lg ${
                        errors.address ? "is-invalid" : ""
                      }`}
                      id="address"
                      placeholder="Entrer votre nom et prénoms..."
                      {...register("address", {
                        required: "Le nom est obligatoire...",
                      })}
                    />
                  </div>

                  <div className="col-xl-12">
                    <label
                      htmlFor="signup-password"
                      className="form-label text-default"
                    >
                      Mot de passe
                    </label>
                    <div className="input-group">
                      <input
                        type={showPassword ? "text" : "password"}
                        className={`form-control form-control-lg ${
                          errors.password ? "is-invalid" : ""
                        }`}
                        id="password"
                        placeholder="Mot de passe"
                        {...register("password", {
                          required: "Le mot de passe est obligatoire",
                          minLength: {
                            value: 6,
                            message: "Au moins 06 caractères.",
                          },
                        })}
                      />
                      <button
                        className="btn btn-light"
                        type="button"
                        onClick={togglePasswordVisibility}
                      >
                        {showPassword ? <RiEyeLine /> : <RiEyeOffLine />}
                      </button>
                      {errors.password && (
                        <div className="invalid-feedback">
                          {errors.password.message}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="col-xl-12 mb-3">
                    <label
                      htmlFor="signup-confirm"
                      className="form-label text-default"
                    >
                      Confirmation
                    </label>
                    <div className="input-group">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        className={`form-control form-control-lg ${
                          errors.confirm ? "is-invalid" : ""
                        }`}
                        id="confirm"
                        placeholder="Confirmer le mot de passe"
                        {...register("confirm", {
                          required:
                            "La confirmation du mot de passe est obligatoire",
                          minLength: {
                            value: 6,
                            message: "Au moins 06 caractères.",
                          },
                          validate: (value) =>
                            value === watch("password") ||
                            "Les mots de passe ne correspondent pas.",
                        })}
                      />
                      <button
                        className="btn btn-light"
                        type="button"
                        onClick={toggleConfirmPasswordVisibility}
                      >
                        {showConfirmPassword ? <RiEyeLine /> : <RiEyeOffLine />}
                      </button>
                      {errors.confirm && (
                        <div className="invalid-feedback">
                          {errors.confirm.message}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="col-xl-12 d-grid mt-2">
                    <button
                      type="submit"
                      className="btn btn-success bariecito-policy"
                      disabled={fetchCompany.isLoading}
                    >
                      {fetchCompany.isLoading
                        ? "Chargement..."
                        : "Créer un compte"}
                    </button>
                  </div>
                </form>
                <div className="text-center">
                  <p className="fs-12 text-muted mt-4">
                    Vous avez déjà un compte ?
                    <a
                      href="#"
                      className="text-success tw-pl-1"
                      onClick={() => onSwitch("login")}
                    >
                      Connectez-vous
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Ajouter la validation des props
Company.propTypes = {
  onSwitch: PropTypes.func.isRequired,
};
export default Company;

import { useMutation } from "@tanstack/react-query";
import PropTypes from "prop-types"; // Importer PropTypes
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { RiEyeLine, RiEyeOffLine } from "react-icons/ri";
import "react-phone-input-2/lib/style.css";
import axiosInstance from "../../config/axiosConfig";

function Register({ onSwitch }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
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

  const fetchRegister = useMutation(
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
        console.log(error);

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
    const datas = { ...data, profilId: 3 };
    fetchRegister.mutate(datas);
  };

  return (
     <div className="p-3">
                <p className="h5 fw-semibold bariecito-policy tw-text-slate-50">Inscription</p>
                <p className="mb-3 tw-text-slate-50 fw-normal">
                  Créer un compte utilisateur gratuitement!
                </p>

                <div className="text-center my-4 authentication-barrier">
                  <span className="tw-text-orange-500 bariecito-policy">
                    CAISSE
                  </span>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="row gy-3">
                  <div className="col-xl-12 mt-0">
                    <label
                      htmlFor="fullName"
                      className="form-label tw-text-slate-50"
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
                    <label htmlFor="email" className="form-label tw-text-slate-50">
                      Adresse mail
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
                      htmlFor="signup-password"
                      className="form-label tw-text-slate-50"
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
                      className="form-label tw-text-slate-50"
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
                      disabled={fetchRegister.isLoading}
                    >
                      {fetchRegister.isLoading
                        ? "Chargement..."
                        : "Créer un compte"}
                    </button>
                  </div>
                </form>
                <div className="text-center">
                  <p className="fs-12 tw-text-slate-50 mt-4">
                    <span className="tw-border tw-border-slate-200 tw-p-2 tw-rounded">Vous avez déjà un compte ?
                    <a
                      href="#"
                      className="text-success tw-pl-1"
                      onClick={() => onSwitch("login")}
                    >
                      Connectez-vous
                    </a></span>
                  </p>
                </div>
              </div>
  );
}

// Ajouter la validation des props
Register.propTypes = {
  onSwitch: PropTypes.func.isRequired,
};
export default Register;

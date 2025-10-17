import { useMutation } from "@tanstack/react-query";
import PropTypes from "prop-types"; // Importer PropTypes
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { RiEyeLine, RiEyeOffLine } from "react-icons/ri";
import "react-phone-input-2/lib/style.css";
import axiosInstance from "../../config/axiosConfig";

function RestPassword({ token, email, userId, onSwitch }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm();

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword((prev) => !prev);
  };

  const changePassword = useMutation(
    (data) =>
      axiosInstance.post(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/v1/change_password?userId=${userId}&token=${token}&email=${email}`,
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
            error?.response?.data ||
              error?.response?.data?.message ||
              error?.response?.data?.error,
            { duration: 12000 }
          );
        }
      },
    }
  );
  const checkToken = useMutation(
    (params) =>
      axiosInstance.post(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/v1/verif_token_to_change_password?token=${params.token}&userId=${
          params.userId
        }&email=${params.email}`
      ),
    {
      onSuccess: (response) => {
        toast.success(response?.data?.message, { duration: 12000 });
        reset();
        //onSwitch("login");
      },
      onError: (error) => {
        console.log(error);

        const validationErrors = error?.response?.data?.error;

        if (validationErrors && Array.isArray(validationErrors)) {
          validationErrors.forEach((error) => {
            toast.error(error.message, { duration: 12000 });
          });
        } else {
          toast.error(error?.response?.data?.message, { duration: 12000 });
        }
      },
    }
  );

  useEffect(() => {
    //alert(`Token: ${token}\nEmail: ${email}\nUser ID: ${userId}`);

    // Vérifier le token
    checkToken.mutate({ token, email, userId });
  }, [token, email, userId]);

  const onSubmit = (data) => {
    console.log(data);

    changePassword.mutate(data);
  };

  return (
   <div className="tw-mt-28">
          <div className="tw-text-center tw-mb-12">
        <h3 className="tw-border tw-rounded tw-p-2 tw-border-slate-500 tw-text-2xl tw-text-slate-500">
          Nouveau mot de passe
        </h3>
      </div>

          <form onSubmit={handleSubmit(onSubmit)} className="row gy-3">
            <div className="col-xl-12">
              <label
                htmlFor="signup-password"
                className="form-label tw-text-slate-300"
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
                    minLength: { value: 6, message: "Au moins 06 caractères." },
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
                className="form-label tw-text-slate-300"
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
                    required: "La confirmation du mot de passe est obligatoire",
                    minLength: { value: 6, message: "Au moins 06 caractères." },
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
                disabled={changePassword.isLoading}
              >
                {changePassword.isLoading ? "Chargement..." : "Modifier"}
              </button>
            </div>
          </form>
          <div className="text-center">
            <p className="fs-12 text-muted mt-4">
              Vous avez déjà un compte ? 
              <a
                href="#"
                className="text-success"
                onClick={() => onSwitch("login")}
              >
                {" "}
                Connectez-vous
              </a>
            </p>
          </div>
   </div>
  );
}

// Ajouter la validation des props
RestPassword.propTypes = {
  token: PropTypes.string.isRequired,
  email: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired,
  onSwitch: PropTypes.func.isRequired,
};

export default RestPassword;

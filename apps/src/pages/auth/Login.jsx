import { useMutation } from "@tanstack/react-query";
import PropTypes from "prop-types";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { RiEyeLine, RiEyeOffLine } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../config/axiosConfig";
import { useAuth } from "../../context/AuthContext"; // 👈 1. Importer notre hook d'authentification

function Login({ onSwitch }) {
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth(); // 👈 2. Récupérer la fonction `login` du contexte
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleError = (error) => {
    const errorMessage =
      error?.response?.data?.error ||
      error?.response?.data?.message ||
      "Une erreur inattendue est survenue.";
    toast.error(errorMessage, { duration: 5000 });
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const { mutate: fetchLogin, isLoading } = useMutation({
    mutationFn: (data) =>
      axiosInstance.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/login`,
        data
      ),
    onSuccess: (response) => {
      const user = response?.data?.user;

      // 👇 3. C'EST TOUT ! On appelle la fonction du contexte.
      // C'est le contexte qui se chargera de mettre à jour son état ET le localStorage.
      login(user);

      toast.success("Connexion réussie ! Redirection...");

      setTimeout(() => {
        navigate("/dashboard"); // ou sur le dashboard
      }, 500);
    },
    onError: handleError,
  });

  const onSubmit = (data) => {
    fetchLogin(data);
  };

  return (
    <div className="tw-mt-28">
      <div className="tw-text-center tw-mb-12">
        <h3 className="tw-border tw-rounded tw-p-2 tw-border-slate-500 tw-text-2xl tw-text-slate-500">
          Connexion
        </h3>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="row gy-3 tw-mb-8">
        <div className="col-xl-12 mt-0">
          <label htmlFor="signin-username" className="form-label tw-text-slate-200">
            Nom d&apos;utilisateur
          </label>
          <input
            type="text"
            className={`form-control form-control-lg tw-text-slate-200 ${
              errors.email ? "is-invalid" : ""
            }`}
            id="signin-username"
            placeholder="Nom d'utilisateur"
            {...register("email", { required: "L'email est obligatoire" })}
          />
          {errors.email && (
            <div className="invalid-feedback">{errors.email.message}</div>
          )}
        </div>
        <div className="col-xl-12 mb-3">
          <label
            htmlFor="signin-password"
            className="form-label tw-text-slate-200 d-block"
          >
            Mot de passe
            <a
              href="#"
              className="float-end text-danger bariecito-policy"
              onClick={() => onSwitch("forgot")}
            >
              Mot de passe oublié ?
            </a>
          </label>
          <div className="input-group">
            <input
              type={showPassword ? "text" : "password"}
              className={`form-control form-control-lg tw-text-slate-200 ${
                errors.password ? "is-invalid" : ""
              }`}
              id="signin-password"
              placeholder="Mot de passe"
              {...register("password", {
                required: "Le mot de passe est obligatoire",
                minLength: { value: 6, message: "Au moins 6 caractères." },
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
              <div className="invalid-feedback">{errors.password.message}</div>
            )}
          </div>
        </div>
        <div className="col-xl-12 d-grid mt-2">
          <button
            type="submit"
            className="btn btn-success bariecito-policy"
            disabled={isLoading}
          >
            {isLoading ? "Chargement..." : "Se connecter"}
          </button>
        </div>
      </form>

      <div className="text-center ">
        <p className="fs-12 tw-text-slate-200 mt-4">
          <span className="tw-border tw-border-slate-200 tw-p-2 tw-rounded">
            Vous n&apos;avez pas de compte ?{" "}
            <a
              href="#"
              className="text-success"
              onClick={() => onSwitch("register")}
            >
              Inscrivez-vous
            </a>
          </span>
        </p>
      </div>
    </div>
  );
}

Login.propTypes = {
  onSwitch: PropTypes.func,
};

export default Login;

import { useMutation } from "@tanstack/react-query";
import PropTypes from "prop-types";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import axiosInstance from "../../config/axiosConfig";
import { showErrorToast } from "../../utils/showErrorToast";

function ForgotPassword({ onSwitch }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const fetchVerifEmail = useMutation(
    (data) =>
      axiosInstance.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/verif_email?email=${
          data.email
        }`
      ),
    {
      onSuccess: (response) => {
        toast.success(response?.data?.message, { duration: 12000 });
        reset();
        onSwitch("login");
      },
      onError: (error) => {
        showErrorToast(error);
      },
    }
  );

  const onSubmit = (data) => {
    fetchVerifEmail.mutate(data);
  };

  return (
    <div className="">
      <p className="h5 fw-semibold mb-2 bariecito-policy tw-text-slate-200">
        Mot de passe oublié
      </p>
      <p className="mb-3 fw-normal tw-text-slate-200">
        Entrez votre adresse email pour recevoir un lien de réinitialisation.
      </p>

      <div className="text-center my-3 authentication-barrier">
        <span className="tw-text-orange-500 bariecito-policy">CAISSE</span>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="row gy-3 tw-mb-8">
        <div className="col-xl-12 mb-3">
          <label htmlFor="email" className="form-label tw-text-slate-200">
            Adresse email
          </label>
          <input
            type="email"
            className={`form-control form-control-lg ${
              errors.email ? "is-invalid" : ""
            }`}
            id="email"
            placeholder="Votre adresse email..."
            {...register("email", {
              required: "Adresse email est obligatoire",
            })}
          />
        </div>
        <div className="col-xl-12 d-grid mt-2">
          <button
            type="submit"
            className="btn btn-success bariecito-policy"
            disabled={fetchVerifEmail.isLoading}
          >
            {fetchVerifEmail.isLoading ? "Chargement..." : "Envoyer le lien"}
          </button>
        </div>
      </form>
      <div className="text-center">
        <p className="fs-12 tw-text-slate-200 ">
          <span className="tw-border tw-border-slate-200 tw-p-2 tw-rounded">
            Retourner à la{" "}
            <a
              href="#"
              className="text-success"
              onClick={() => onSwitch("login")}
            >
              Connexion
            </a>
          </span>
        </p>
      </div>
    </div>
  );
}

ForgotPassword.propTypes = {
  onSwitch: PropTypes.func.isRequired,
};

export default ForgotPassword;

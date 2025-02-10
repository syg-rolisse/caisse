import { useMutation } from "@tanstack/react-query";
import PropTypes from "prop-types";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import TopBar from "../../components/TopBar";
import axiosInstance from "../../config/axiosConfig";

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
        // Appel de reset ici, supposant qu'il est défini ailleurs dans votre code
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
            {
              duration: 3000,
            }
          );
        }

        // toast.error(error?.response?.data?.error, { autoClose: 1000 });
      },
    }
  );

  const onSubmit = (data) => {
    console.log(data);

    fetchVerifEmail.mutate(data);
  };

  return (
    <div className="tw-relative tw-h-screen tw-w-screen">
      <div className="tw-absolute tw-top-0 tw-z-50">
        <TopBar />
      </div>

      <img
        src="assets/images/media/caisse.jpg"
        className="tw-absolute tw-inset-0 tw-w-full tw-h-full tw-object-cover"
        alt="Logo"
      />

      <div className="tw-fixed tw-inset-0 tw-backdrop-blur-[10px]"></div>

      <div className="row justify-content-center align-items-center tw-h-screen">
        <div className="col-xxl-3 tw-z-50 col-xl-4 col-lg-5 col-md-5 col-sm-8 col-10 max-sm:tw-mt-2">
          <div className="p-1 tw-rounded-lg gradient-border">
            <div className="bg-white tw-rounded-lg p-3">
              <div className="p-3 tw-border tw-border-zinc-200 tw-rounded-lg">
                <div className="mb-3">
                  <a href="index.html">
                    <img
                      src="../assets/images/brand-logos/desktop-logo.png"
                      alt=""
                      className="authentication-brand desktop-logo"
                    />
                    <img
                      src="../assets/images/brand-logos/desktop-white.png"
                      alt=""
                      className="authentication-brand desktop-dark"
                    />
                  </a>
                </div>
                <p className="h5 fw-semibold mb-2 bariecito-policy">
                  Mot de passe oublié
                </p>
                <p className="mb-3 text-muted op-7 fw-normal">
                  Entrez votre adresse email pour recevoir un lien de
                  réinitialisation.
                </p>

                <div className="text-center my-5 authentication-barrier">
                  <span className="tw-text-orange-500 bariecito-policy">
                    CAISSE
                  </span>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="row gy-3">
                  <div className="col-xl-12 mb-3">
                    <label htmlFor="email" className="form-label text-default">
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
                      {fetchVerifEmail.isLoading
                        ? "Chargement..."
                        : "Envoyer le lien"}
                    </button>
                  </div>
                </form>
                <div className="text-center">
                  <p className="fs-12 text-muted mt-4">
                    Retourner à la{" "}
                    <a
                      href="#"
                      className="text-success"
                      onClick={() => onSwitch("login")}
                    >
                      Connexion
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

ForgotPassword.propTypes = {
  onSwitch: PropTypes.func.isRequired,
};

export default ForgotPassword;

import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { CSSTransition, SwitchTransition } from "react-transition-group";
import axiosInstance from "../../config/axiosConfig";
import Company from "./Company";
import ForgotPassword from "./ForgotPassword";
import Login from "./Login";
import RestPassword from "./RestPassword";

const TailwindLoader = () => (
  <div className="tw-fixed tw-inset-0 tw-z-50 tw-flex tw-items-center tw-justify-center tw-bg-slate-900/80 tw-backdrop-blur-sm">
    <div className="tw-h-16 tw-w-16 tw-animate-spin tw-rounded-full tw-border-4 tw-border-blue-500 tw-border-t-transparent"></div>
  </div>
);

function AuthContainer() {
  const [activeComponent, setActiveComponent] = useState("login");
  const [token, setToken] = useState(null);
  const [email, setEmail] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const img = new Image();
    img.src = "assets/images/media/caisse.jpg";
    img.onload = () => {
      setIsLoading(true);
      const urlParams = new URLSearchParams(window.location.search);
      const tokenParam = urlParams.get("token");
      const emailParam = urlParams.get("email");
      const userIdParam = urlParams.get("userId");
      const renderParam = urlParams.get("render");

      if (tokenParam) setToken(tokenParam);
      if (emailParam) setEmail(emailParam);
      if (userIdParam) setUserId(userIdParam);

      if (renderParam === "register" && tokenParam && emailParam && userIdParam) {
        navigate(window.location.pathname, { replace: true });
        activeAccount.mutate({ token, email, userId });
      }

      if (renderParam === "reset-password" && tokenParam && emailParam && userIdParam) {
        setActiveComponent("reset-password");
      }

      setTimeout(() => setIsLoading(false), 500);
    };
  }, []);

  const activeAccount = useMutation(
    ({ token, email, userId }) =>
      axiosInstance.post(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/v1/activeAccount?token=${token}&email=${email}&userId=${userId}`
      ),
    {
      onSuccess: (response) => {
        toast.success(response?.data?.message, { duration: 7000 });
        setTimeout(() => setActiveComponent("login"), 2000);
      },
      onError: (error) => {
        const errorMessage = error?.response?.data?.error || error?.response?.data?.message;
        toast.error(errorMessage, { duration: 5000 });
      },
    }
  );

  const renderComponent = () => {
    switch (activeComponent) {
      case "login":
        return <Login onSwitch={setActiveComponent} />;
      case "register":
        return <Company onSwitch={setActiveComponent} />;
      case "forgot":
        return <ForgotPassword onSwitch={setActiveComponent} />;
      case "reset-password":
        return <RestPassword token={token} email={email} userId={userId} onSwitch={setActiveComponent} />;
      default:
        return <Login onSwitch={setActiveComponent} />;
    }
  };

  if (isLoading) {
    return <TailwindLoader />;
  }

  return (
    <>
      <style>{`
        .fade-enter { opacity: 0; transform: translateY(10px); }
        .fade-enter-active { opacity: 1; transform: translateY(0); transition: all 300ms ease-out; }
        .fade-exit { opacity: 1; transform: translateY(0); }
        .fade-exit-active { opacity: 0; transform: translateY(-10px); transition: all 200ms ease-in; }
      `}</style>

      <main className="tw-relative tw-min-h-screen tw-w-full tw-overflow-hidden tw-bg-slate-400 tw-font-sans tw-antialiased">
        <div className="tw-absolute tw-inset-0 tw-z-0">
          <img
            src="assets/images/media/caisse.jpg"
            className="tw-h-full tw-w-full tw-object-cover"
            alt="Arrière-plan"
          />
          <div className="tw-absolute tw-inset-0 tw-bg-black/50"></div>
        </div>

        <div className="tw-relative tw-z-10 tw-flex tw-min-h-screen tw-items-center tw-justify-center">
          <div className="tw-w-full tw-max-w-md max-sm:tw-max-w-[90%]">
            <div className="tw-overflow-hidden max-sm:tw-p-4 tw-rounded-2xl tw-border tw-border-slate-700  tw-shadow-2xl tw-backdrop-blur-xl">
              <div className="sm:tw-p-10">
                <div className="tw-flex tw-justify-center tw-absolute -tw-top-8 tw-left-0 tw-right-0">
                  <img
                    src="../assets/images/logo/bg_2.png"
                    alt="Logo"
                    className="tw-h-52 tw-w-auto tw-opacity-80 tw-object-contain"
                  />
                </div>

                {/* <div className="tw-mb-8 tw-text-center">
                  <h1 className="tw-text-2xl tw-font-bold tw-text-slate-100">
                    Bienvenue
                  </h1>
                  <p className="tw-mt-1 tw-text-sm tw-text-slate-400">
                    Connectez-vous pour accéder à votre espace.
                  </p>
                </div> */}

                <SwitchTransition mode="out-in">
                  <CSSTransition
                    key={activeComponent}
                    timeout={300}
                    classNames="fade"
                    unmountOnExit
                  >
                    <div>{renderComponent()}</div>
                  </CSSTransition>
                </SwitchTransition>
              </div>
            </div>

            <footer className="tw-mt-6 tw-text-center tw-text-xs tw-text-slate-200">
              © {new Date().getFullYear()} Votre Entreprise. Tous droits réservés.
            </footer>
          </div>
        </div>
      </main>
    </>
  );
}

export default AuthContainer;
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { CSSTransition, SwitchTransition } from "react-transition-group"; // Note: Utilisation de SwitchTransition pour une meilleure anim entre composants
import axiosInstance from "../../config/axiosConfig";
import { LockKeyhole, ServerCrash } from "lucide-react";

// import Company from "./Company";
import CreateUser from "./CreateUser";
import ForgotPassword from "./ForgotPassword";
import Login from "./Login";
import RestPassword from "./RestPassword";

// Petit composant Loader interne stylisé avec Tailwind
const TailwindLoader = () => (
  <div className="tw-fixed tw-inset-0 tw-z-50 tw-flex tw-items-center tw-justify-center tw-bg-gray-900/80 tw-backdrop-blur-sm">
    <div className="tw-h-16 tw-w-16 tw-animate-spin tw-rounded-full tw-border-4 tw-border-orange-500 tw-border-t-transparent"></div>
  </div>
);

function AuthContainer() {
  const [activeComponent, setActiveComponent] = useState("login");
  const [token, setToken] = useState(null);
  const [email, setEmail] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();
  // const nodeRef = useRef(null); // Plus nécessaire avec SwitchTransition de la manière dont je l'implémente ci-dessous

  useEffect(() => {
    // Simulation d'un chargement d'image de fond pour éviter le flash
    const img = new Image();
    img.src = "assets/images/media/caisse.jpg";
    img.onload = () => {
        // Logique existante
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
          navigate(window.location.pathname); // Nettoie l'URL sans recharger
          activeAccount.mutate({
            token: tokenParam,
            email: emailParam,
            userId: userIdParam,
          });
        }

        if (
          renderParam === "reset-password" &&
          tokenParam &&
          emailParam &&
          userIdParam
        ) {
          setActiveComponent("reset-password");
        }

        setTimeout(() => setIsLoading(false), 800);
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
        setTimeout(() => {
          setActiveComponent("login");
        }, 2000);
      },
      onError: (error) => {
        const errorMessage =
          error?.response?.data?.error || error?.response?.data?.message;
        toast.error(errorMessage, { autoClose: 5000 });
      },
    }
  );

  const renderComponent = () => {
    switch (activeComponent) {
      case "login":
        return <Login onSwitch={setActiveComponent} />;
      case "register":
        return <CreateUser onSwitch={setActiveComponent} />;
      case "forgot":
        return <ForgotPassword onSwitch={setActiveComponent} />;
      case "reset-password":
        return (
          <RestPassword
            token={token}
            email={email}
            userId={userId}
            onSwitch={setActiveComponent}
          />
        );
      default:
        return <Login onSwitch={setActiveComponent} />;
    }
  };

  if (isLoading) {
    return <TailwindLoader />;
  }

  return (
    <>
      {/* CSS pour l'animation de transition entre les formulaires */}
      <style>
        {`
          .fade-enter { opacity: 0; transform: translateY(10px); }
          .fade-enter-active { opacity: 1; transform: translateY(0); transition: opacity 300ms, transform 300ms; }
          .fade-exit { opacity: 1; }
          .fade-exit-active { opacity: 0; transition: opacity 200ms; }
        `}
      </style>

      <div className="tw-relative tw-min-h-screen tw-w-full tw-overflow-hidden tw-bg-gray-900 tw-text-white tw-antialiased">
        
        {/* --- Background Image & Overlays --- */}
        <div className="tw-absolute tw-inset-0 tw-z-0">
          <img
            src="assets/images/media/caisse.jpg"
            className="tw-h-full tw-w-full tw-object-cover tw-scale-105 tw-filter tw-blur-[2px]"
            alt="Background"
          />
          {/* Overlay sombre dégradé pour la lisibilité */}
          <div className="tw-absolute tw-inset-0 tw-bg-gradient-to-b tw-from-gray-900/80 tw-via-gray-900/70 tw-to-black/90"></div>
          {/* Effet de motif optionnel (bruit ou grille) pour un look plus tech */}
          <div className="tw-absolute tw-inset-0 tw-bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDIiLz4KPC9zdmc+')]"></div>
        </div>

        {/* --- Main Container --- */}
        <div className="tw-relative tw-z-10 tw-flex tw-min-h-screen tw-flex-col tw-items-center tw-justify-center tw-px-4 tw-py-10">
          
          {/* --- Auth Card --- */}
          <div className="tw-w-full tw-max-w-[450px] tw-animate-fade-in-up">
            
            {/* Badge "Espace Privé" - Design haut de gamme */}
            <div className="tw-mx-auto tw-mb-6 tw-flex tw-w-max tw-items-center tw-gap-2 tw-rounded-full tw-border tw-border-orange-500/30 tw-bg-orange-950/60 tw-px-4 tw-py-1.5 tw-text-orange-400 tw-shadow-[0_0_15px_rgba(249,115,22,0.2)] tw-backdrop-blur-md">
              <ServerCrash size={16} className="tw-animate-pulse" />
              <span className="tw-text-xs tw-font-bold tw-uppercase tw-tracking-widest">
                Accès Privé & Sécurisé
              </span>
            </div>

            {/* Glassmorphism Card container */}
            <div className="tw-overflow-hidden tw-rounded-2xl tw-border tw-border-gray-700/50 tw-bg-gray-800/40 tw-shadow-2xl tw-backdrop-blur-xl hover:tw-shadow-orange-900/20 tw-transition-shadow tw-duration-500">
              
              {/* Decorative top border */}
              <div className="tw-h-1 tw-w-full tw-bg-gradient-to-r tw-from-transparent tw-via-orange-500 tw-to-transparent tw-opacity-70"></div>

              <div className="tw-p-2">
                {/* Logo Area */}
                <div className="tw-flex tw-justify-center">
                  <img
                    src="../assets/images/logo/bg_2.png"
                    alt="Logo"
                    className="tw-w-auto tw-h-52 tw-object-contain"
                  />
                </div>

                {/* Content Transition */}
                {/* Utilisation de SwitchTransition pour que l'ancien formulaire parte avant que le nouveau n'arrive */}
                <SwitchTransition mode="out-in">
                  <CSSTransition
                    key={activeComponent}
                    timeout={300}
                    classNames="fade"
                    unmountOnExit
                  >
                    <div className="auth-form-wrapper tw-p-4">
                      {renderComponent()}
                    </div>
                  </CSSTransition>
                </SwitchTransition>
              </div>
            </div>

            {/* Footer discret */}
            <div className="tw-mt-6 tw-text-center tw-text-xs tw-text-gray-500">
              <div className="tw-flex tw-items-center tw-justify-center tw-gap-1">
                <LockKeyhole size={12} /> Connexion chiffrée de bout en bout.
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}

export default AuthContainer;
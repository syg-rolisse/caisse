import { useMutation } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Transition } from "react-transition-group";
import axiosInstance from "../../config/axiosConfig";
import Company from "./Company";
import ForgotPassword from "./ForgotPassword";
import Login from "./Login";
import RestPassword from "./RestPassword";

function AuthContainer() {
  const [activeComponent, setActiveComponent] = useState("login");
  const [token, setToken] = useState(null);
  const [email, setEmail] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Ajouter l'état du loader

  //const user = JSON.parse(localStorage.getItem("user"));

  const navigate = useNavigate();
  const nodeRef = useRef(null);

  useEffect(() => {
    setIsLoading(true); // Démarrer le loader

    const urlParams = new URLSearchParams(window.location.search);

    const tokenParam = urlParams.get("token");
    const emailParam = urlParams.get("email");
    const userIdParam = urlParams.get("userId");
    const renderParam = urlParams.get("render");

    if (tokenParam) setToken(tokenParam);
    if (emailParam) setEmail(emailParam);
    if (userIdParam) setUserId(userIdParam);

    if (renderParam === "register" && tokenParam && emailParam && userIdParam) {
      navigate("");
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

    // Simuler un délai pour montrer le loader (facultatif)
    setTimeout(() => setIsLoading(false), 1000); // Arrêter le loader après 1 seconde
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
        toast.error(errorMessage, { autoClose: 1000 });
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

  // Composant du loader
  if (isLoading) {
    return (
      <div className="loader-overlay">
        <div className="loader-spinner"></div>
      </div>
    );
  }

  return (
    <div
      className={` authentication mx-0 transition-opacity duration-700 ease-in-out ${
        isLoading ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="">
        <Transition
          in={activeComponent !== "login"}
          timeout={700}
          nodeRef={nodeRef}
        >
          {(state) => (
            <div
              ref={nodeRef}
              className={`transition-all transform duration-700 ease-in-out ${
                state === "entering"
                  ? "opacity-0 translate-y-5"
                  : state === "entered"
                  ? "opacity-100 translate-y-0"
                  : ""
              }`}
            >
              {renderComponent()}
            </div>
          )}
        </Transition>
      </div>
    </div>
  );
}

export default AuthContainer;

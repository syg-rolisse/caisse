import { useMutation } from "@tanstack/react-query";
// import { Link } from "react-router-dom";
import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import TopBar from "../components/TopBar";
import axiosInstance from "../config/axiosConfig";
function Aside() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [isOverlay, setOverlay] = useState(false);
  const handleFullOverlay = (value) => {
    setOverlay(value);
  };
  const handleError = (error) => {
    const validationErrors = error?.response?.data?.error;
    if (validationErrors && Array.isArray(validationErrors)) {
      validationErrors.forEach((err) =>
        toast.error(err.message, { duration: 12000 })
      );
    } else {
      toast.error(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.response?.data,
        {
          duration: 4000,
        }
      );
    }
  };

  // Fonction pour vérifier l'autorisation et naviguer
  const { mutate: checkAuthorization } = useMutation(
    async (route) => {
      const response = await axiosInstance.get(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/v1/authorizeToRead?userConnectedId=${user?.id}&route=${route}`
      );
      return response.data;
    },
    {
      onSuccess: (data, route) => {
        if (data?.isAuthorized) {
          navigate(route);
        } else {
          alert("Vous n'êtes pas autorisé à accéder à cette page.");
        }
      },
      onError: handleError,
    }
  );

  const handleNavigation = (route) => {
    checkAuthorization(route);
  };

  return (
    <div>
      <aside
        className={`app-sidebar sticky ${isOverlay ? "-tw-z-40" : ""}`}
        id="sidebar"
      >
        <div className="tw-p-3">
          <div>
            <a href="#" className="tw-absolute tw-opacity-85 tw-ml-4 -tw-top-10">
              <img
                src={`${import.meta.env.VITE_BACKEND_URL}/uploads/${
                  user?.company?.logoUrl
                    ? user?.company?.logoUrl
                    : "logo/ri3uadefault.jpg"
                }`}
                alt="Avatar"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: "50%",
                }}
              />
            </a>

            {user?.company?.showCompanyName && (
              <p className="bariecito-policy tw-text-center tw-mt-3 tw-font-semibold tw-text-xl">
                {user?.company?.companyName}
              </p>
            )}
          </div>
        </div>

        <div className="main-sidebar tw-mt-24" id="sidebar-scroll">
          <nav className="main-menu-container nav nav-pills flex-column sub-open">
            <ul className="main-menu">
              <li className="slide__category">
                <span className="category-name">PRINCIPALE</span>
              </li>
              <li className="slide">
                <button
                  className="side-menu__item"
                  onClick={() => handleNavigation("dashboard")}
                >
                  <i className="bx bx-category side-menu__icon"></i>
                  <span className="side-menu__label">Tableau de bord</span>
                </button>
                {/* <button
                  className="side-menu__item"
                  onClick={() => handleNavigation("old-dashboard")}
                >
                  <i className="bx bx-category side-menu__icon"></i>
                  <span className="side-menu__label">Old Tableau de bord</span>
                </button> */}
              </li>

              <li className="slide__category">
                <span className="category-name">Modules</span>
              </li>
              <li className="slide">
                <button
                  className="side-menu__item"
                  onClick={() => handleNavigation("approvisionnements")}
                >
                  <i className="bx bx-store side-menu__icon"></i>
                  <span className="side-menu__label">Approvisionnement</span>
                </button>
              </li>

              <li className="slide">
                <button
                  className="side-menu__item"
                  onClick={() => handleNavigation("type-de-depense")}
                >
                  <i className="bx bx-wallet side-menu__icon"></i>
                  <span className="side-menu__label">Type de dépenses</span>
                </button>
              </li>
              <li className="slide">
                <button
                  className="side-menu__item"
                  onClick={() => handleNavigation("depenses")}
                >
                  <i className="bx bx-money side-menu__icon"></i>
                  <span className="side-menu__label">Dépenses</span>
                </button>
              </li>
              <li className="slide">
                <button
                  className="side-menu__item"
                  onClick={() => handleNavigation("sorties")}
                >
                  <i className="bx bx-money-withdraw side-menu__icon"></i>
                  <span className="side-menu__label">Sortie</span>
                </button>
              </li>
              <li className="slide">
                <button
                  className="side-menu__item"
                  onClick={() => handleNavigation("editions")}
                >
                  <i className="bx bx-printer side-menu__icon"></i>
                  <span className="side-menu__label">Editions</span>
                </button>
              </li>

              <li className="slide__category">
                <span className="category-name">Rôles / Utilisateurs</span>
              </li>

              <li className="slide">
                <button
                  className="side-menu__item"
                  onClick={() => handleNavigation("utilisateurs")}
                >
                  <i className="bx bx-user side-menu__icon"></i>
                  <span className="side-menu__label">Utilisateurs</span>
                </button>
              </li>

              {/* {user?.email === "rolissecodeur@gmail.com" && (
                <li className="slide">
                  <Link to={"all_utilisateurs"} className="side-menu__item">
                    <i className="bx bx-user side-menu__icon"></i>
                    <span className="side-menu__label">
                      Tout les utilisateurs
                    </span>
                  </Link>
                </li>
              )} */}

              <li className="slide">
                <button
                  className="side-menu__item"
                  onClick={() => handleNavigation("permissions")}
                >
                  <i className="bx bx-key side-menu__icon"></i>
                  <span className="side-menu__label">Rôle & Permissions</span>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </aside>

      <div className="-tw-mt-3 tw-absolute tw-top-2 tw-right-0 tw-z-50">
        {user?.id && <TopBar fullOverlay={handleFullOverlay} />}
      </div>
    </div>
  );
}

export default Aside;

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
        <div className="tw-flex tw-flex-col tw-items-center tw-justify-center tw-space-y-4">
  {/* Conteneur avec un arrière-plan en dégradé pour simuler une bordure colorée */}
  <a
    href="#"
    className="
    
    "
  >
    {/* Div intérieur pour créer l'effet de bordure */}
    <div className="tw-bg-white tw-p-1 tw-rounded-full">
      <img
        src={`${import.meta.env.VITE_BACKEND_URL}/uploads/${user?.company?.logoUrl || `uploads/avatars/${(user?.id % 5) + 1}.png`}`}
        alt="Logo de l’entreprise"
        className="tw-w-44 tw-h-44 tw-object-cover tw-rounded-full"
      />
    </div>
  </a>

  {/* Affichage conditionnel du nom de l'entreprise */}
  {user?.company?.showCompanyName && (
    <p className="bariecito-policy tw-text-center tw-font-semibold tw-text-2xl tw-text-slate-700 tw-tracking-wide">
      {user?.company?.companyName}
    </p>
  )}
</div>

        <div className="main-sidebar -tw-mt-12" id="sidebar-scroll">
          <nav className="main-menu-container nav nav-pills flex-column sub-open">
            <ul className="main-menu">
             

              <li className="slide__category">
                <span className="category-name">Modules</span>
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

              <li className="slide">
                <button
                  className="side-menu__item"
                  onClick={() => handleNavigation("packs")}
                >
                  <i className="bx bx-user side-menu__icon"></i>
                  <span className="side-menu__label">Packs</span>
                </button>
              </li>

              <li className="slide">
                <button
                  className="side-menu__item"
                  onClick={() => handleNavigation("abonnements")}
                >
                  <i className="bx bx-user side-menu__icon"></i>
                  <span className="side-menu__label">Mes abonnements</span>
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

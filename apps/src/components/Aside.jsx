import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useNavigate, useLocation } from "react-router-dom";
import TopBar from "../components/TopBar";
import axiosInstance from "../config/axiosConfig";
import PropTypes from "prop-types";
import { useEffect } from "react";
import {
  X,
  LayoutDashboard,
  Warehouse,
  Landmark,
  CircleDollarSign,
  LogOut,
  Printer,
  Users,
  CreditCard,
  KeyRound,
} from "lucide-react";

function Aside({ isSidebarOpen, toggleSidebar }) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (isSidebarOpen) {
      document.body.classList.add("tw-overflow-hidden");
    } else {
      document.body.classList.remove("tw-overflow-hidden");
    }
    return () => {
      document.body.classList.remove("tw-overflow-hidden");
    };
  }, [isSidebarOpen]);

  const handleError = (error) => {
    const validationErrors = error?.response?.data?.error;
    if (validationErrors && Array.isArray(validationErrors)) {
      validationErrors.forEach((err) => toast.error(err.message, { duration: 12000 }));
    } else {
      toast.error(error?.response?.data?.message || error?.response?.data?.error || error?.response?.data, { duration: 4000 });
    }
  };

  const { mutate: checkAuthorization } = useMutation(
    async (route) => {
      const response = await axiosInstance.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/authorizeToRead?userConnectedId=${user?.id}&route=${route}`);
      return response.data;
    },
    {
      onSuccess: (data, route) => {
        if (data?.isAuthorized) { navigate(route); }
        else { alert("Vous n'êtes pas autorisé à accéder à cette page."); }
      },
      onError: handleError,
    }
  );

  const handleNavigation = (route) => {
    checkAuthorization(route);
  };

  // Gestion du style Orange (Hover, Focus, Active)
  const getNavItemClass = (route) => {
    const isActive = location.pathname.includes(route);
    const baseClass = "tw-w-full tw-flex tw-items-center tw-p-3 tw-rounded-lg tw-transition-all tw-duration-200 tw-outline-none tw-font-medium";
    const activeClass = "tw-bg-orange-100 tw-text-orange-700";
    const inactiveClass = "tw-text-slate-600 hover:tw-bg-orange-50 hover:tw-text-orange-600 focus:tw-ring-2 focus:tw-ring-orange-500";
    
    return `${baseClass} ${isActive ? activeClass : inactiveClass}`;
  };

  return (
    <>
      <aside
        className={`
          tw-fixed tw-top-0 tw-left-0 tw-h-full tw-z-40
          tw-w-64 tw-bg-white tw-border-r tw-border-gray-200
          tw-transition-transform tw-duration-300 ease-in-out
          tw-flex tw-flex-col
          ${isSidebarOpen ? 'tw-translate-x-0' : '-tw-translate-x-full'}
        `}
        id="sidebar"
      >
        {/* HEADER: Logo Circulaire sans padding */}
        <div className="tw-relative tw-flex tw-flex-col tw-items-center tw-justify-center tw-pt-8 tw-pb-6 tw-flex-shrink-0">
          <button 
            onClick={toggleSidebar} 
            className="tw-absolute tw-top-2 tw-right-2 tw-h-10 tw-w-10 tw-flex tw-items-center tw-justify-center tw-rounded-full hover:tw-bg-slate-100 lg:tw-hidden"
          >
            <X className="tw-h-6 tw-w-6 tw-text-slate-600" />
          </button>

          {/* Logo Circulaire pur */}
          <div className="tw-w-36 tw-h-36 tw-rounded-full tw-overflow-hidden tw-border-2 tw-border-slate-100 tw-shadow-md">
            <img
              src={`${import.meta.env.VITE_BACKEND_URL}/uploads/${user?.company?.logoUrl || `uploads/avatars/ri3uadefault.jpg`}`}
              alt="Logo"
              className="tw-w-full tw-h-full tw-object-cover"
            />
          </div>
        
          {user?.company?.showCompanyName && (
            <p className="tw-mt-4 tw-text-center tw-font-bold tw-text-lg tw-text-slate-800">
              {user?.company?.companyName}
            </p>
          )}
        </div>
        
        {/* CORPS SCROLLABLE */}
        <div className="tw-flex-grow tw-overflow-y-auto tw-py-4">
          <nav>
            <ul className="tw-px-4 tw-space-y-1">
              <li><span className="tw-px-3 tw-text-[10px] tw-font-bold tw-uppercase tw-text-gray-400 tw-tracking-widest">Principale</span></li>
              <li>
                <button onClick={() => handleNavigation("dashboard")} className={getNavItemClass("dashboard")}>
                  <LayoutDashboard className="tw-h-5 tw-w-5 tw-mr-3" />
                  <span>Tableau de bord</span>
                </button>
              </li>

              <li className="tw-pt-4"><span className="tw-px-3 tw-text-[10px] tw-font-bold tw-uppercase tw-text-gray-400 tw-tracking-widest">Modules</span></li>
              <li><button onClick={() => handleNavigation("approvisionnements")} className={getNavItemClass("approvisionnements")}><Warehouse className="tw-h-5 tw-w-5 tw-mr-3" /><span>Approvisionnement</span></button></li>
              <li><button onClick={() => handleNavigation("type-de-depense")} className={getNavItemClass("type-de-depense")}><Landmark className="tw-h-5 tw-w-5 tw-mr-3" /><span>Type de dépenses</span></button></li>
              <li><button onClick={() => handleNavigation("depenses")} className={getNavItemClass("depenses")}><CircleDollarSign className="tw-h-5 tw-w-5 tw-mr-3" /><span>Dépenses</span></button></li>
              <li><button onClick={() => handleNavigation("sorties")} className={getNavItemClass("sorties")}><LogOut className="tw-h-5 tw-w-5 tw-mr-3" /><span>Sortie</span></button></li>
              <li><button onClick={() => handleNavigation("editions")} className={getNavItemClass("editions")}><Printer className="tw-h-5 tw-w-5 tw-mr-3" /><span>Editions</span></button></li>

              <li className="tw-pt-4"><span className="tw-px-3 tw-text-[10px] tw-font-bold tw-uppercase tw-text-gray-400 tw-tracking-widest">Rôles / Utilisateurs</span></li>
              <li><button onClick={() => handleNavigation("utilisateurs")} className={getNavItemClass("utilisateurs")}><Users className="tw-h-5 tw-w-5 tw-mr-3" /><span>Utilisateurs</span></button></li>
              <li><button onClick={() => handleNavigation("abonnements")} className={getNavItemClass("abonnements")}><CreditCard className="tw-h-5 tw-w-5 tw-mr-3" /><span>Mes abonnements</span></button></li>
              <li><button onClick={() => handleNavigation("permissions")} className={getNavItemClass("permissions")}><KeyRound className="tw-h-5 tw-w-5 tw-mr-3" /><span>Rôle & Permissions</span></button></li>
            </ul>
          </nav>
        </div>
      </aside>
      
      <div className="-tw-mt-3 tw-absolute tw-top-2 tw-right-0 tw-z-50">
        {user?.id && <TopBar />}
      </div>
    </>
  );
}

Aside.propTypes = {
  isSidebarOpen: PropTypes.bool.isRequired,
  toggleSidebar: PropTypes.func.isRequired,
};

export default Aside;
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import TopBar from "../components/TopBar";
import axiosInstance from "../config/axiosConfig";
import PropTypes from "prop-types";
import { useEffect } from "react"; // ⭐ Import de useEffect ajouté

// Import de la nouvelle liste complète d'icônes modernes de Lucide
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
  const user = JSON.parse(localStorage.getItem("user"));

  // ⭐ NOUVEAU useEffect pour empêcher le défilement du body
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.classList.add("tw-overflow-hidden");
    } else {
      document.body.classList.remove("tw-overflow-hidden");
    }

    // Fonction de nettoyage
    return () => {
      document.body.classList.remove("tw-overflow-hidden");
    };
  }, [isSidebarOpen]);
  // Fin du NOUVEAU useEffect
  
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

  return (
    <>
      {/* Si vous utilisez un overlay (arrière-plan sombre derrière la sidebar) 
        il faut l'inclure ici pour les écrans mobiles 
      */}

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
        {/* HEADER: Fixe en haut */}
        <div className="tw-relative tw-flex tw-flex-col tw-items-center tw-justify-center tw-space-y-4 tw-p-4 tw-bg-slate-50 tw-border-b tw-flex-shrink-0">
          <button 
            onClick={toggleSidebar} 
            className="tw-absolute tw-top-2 tw-right-2 tw-h-10 tw-w-10 tw-flex tw-items-center tw-justify-center tw-rounded-full hover:tw-bg-slate-200 lg:tw-hidden"
            aria-label="Fermer le menu"
          >
            <X className="tw-h-6 tw-w-6 tw-text-slate-600" />
          </button>

          <div className="tw-p-1 tw-bg-gray-200 tw-rounded-full -tw-mt-6 tw-mb-2 tw-w-36 tw-h-36 ">
            <img
              src={`${import.meta.env.VITE_BACKEND_URL}/uploads/${user?.company?.logoUrl || `uploads/avatars/ri3uadefault.jpg`}`}
              alt="Logo de l’entreprise"
              className="tw-w-36 tw-h-36 tw-object-cover tw-rounded-full"
            />
          </div>
        
          {user?.company?.showCompanyName && (
            <p className="tw-text-center tw-font-semibold tw-text-lg tw-text-slate-800">
              {user?.company?.companyName}
            </p>
          )}
        </div>
        
        {/* CORPS DE LA SIDEBAR AVEC LE MENU COMPLET ET SCROLLABLE */}
        <div className="tw-flex-grow tw-overflow-y-auto tw-py-4">
          <nav>
            <ul className="tw-px-4 tw-space-y-1">
              {/* Catégorie PRINCIPALE */}
              <li><span className="tw-px-3 tw-text-xs tw-font-semibold tw-uppercase tw-text-gray-400">Principale</span></li>
              <li><button onClick={() => handleNavigation("dashboard")} className="tw-w-full tw-flex tw-items-center tw-p-3 tw-text-slate-700 tw-rounded-lg hover:tw-bg-slate-100 tw-transition-colors"><LayoutDashboard className="tw-h-5 tw-w-5 tw-mr-3" /><span>Tableau de bord</span></button></li>

              {/* Catégorie Modules */}
              <li className="tw-pt-2"><span className="tw-px-3 tw-text-xs tw-font-semibold tw-uppercase tw-text-gray-400">Modules</span></li>
              <li><button onClick={() => handleNavigation("approvisionnements")} className="tw-w-full tw-flex tw-items-center tw-p-3 tw-text-slate-700 tw-rounded-lg hover:tw-bg-slate-100 tw-transition-colors"><Warehouse className="tw-h-5 tw-w-5 tw-mr-3" /><span>Approvisionnement</span></button></li>
              <li><button onClick={() => handleNavigation("type-de-depense")} className="tw-w-full tw-flex tw-items-center tw-p-3 tw-text-slate-700 tw-rounded-lg hover:tw-bg-slate-100 tw-transition-colors"><Landmark className="tw-h-5 tw-w-5 tw-mr-3" /><span>Type de dépenses</span></button></li>
              <li><button onClick={() => handleNavigation("depenses")} className="tw-w-full tw-flex tw-items-center tw-p-3 tw-text-slate-700 tw-rounded-lg hover:tw-bg-slate-100 tw-transition-colors"><CircleDollarSign className="tw-h-5 tw-w-5 tw-mr-3" /><span>Dépenses</span></button></li>
              <li><button onClick={() => handleNavigation("sorties")} className="tw-w-full tw-flex tw-items-center tw-p-3 tw-text-slate-700 tw-rounded-lg hover:tw-bg-slate-100 tw-transition-colors"><LogOut className="tw-h-5 tw-w-5 tw-mr-3" /><span>Sortie</span></button></li>
              <li><button onClick={() => handleNavigation("editions")} className="tw-w-full tw-flex tw-items-center tw-p-3 tw-text-slate-700 tw-rounded-lg hover:tw-bg-slate-100 tw-transition-colors"><Printer className="tw-h-5 tw-w-5 tw-mr-3" /><span>Editions</span></button></li>

              {/* Catégorie Rôles / Utilisateurs */}
              <li className="tw-pt-2"><span className="tw-px-3 tw-text-xs tw-font-semibold tw-uppercase tw-text-gray-400">Rôles / Utilisateurs</span></li>
              <li><button onClick={() => handleNavigation("utilisateurs")} className="tw-w-full tw-flex tw-items-center tw-p-3 tw-text-slate-700 tw-rounded-lg hover:tw-bg-slate-100 tw-transition-colors"><Users className="tw-h-5 tw-w-5 tw-mr-3" /><span>Utilisateurs</span></button></li>
              <li><button onClick={() => handleNavigation("abonnements")} className="tw-w-full tw-flex tw-items-center tw-p-3 tw-text-slate-700 tw-rounded-lg hover:tw-bg-slate-100 tw-transition-colors"><CreditCard className="tw-h-5 tw-w-5 tw-mr-3" /><span>Mes abonnements</span></button></li>
              <li><button onClick={() => handleNavigation("permissions")} className="tw-w-full tw-flex tw-items-center tw-p-3 tw-text-slate-700 tw-rounded-lg hover:tw-bg-slate-100 tw-transition-colors"><KeyRound className="tw-h-5 tw-w-5 tw-mr-3" /><span>Rôle & Permissions</span></button></li>
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
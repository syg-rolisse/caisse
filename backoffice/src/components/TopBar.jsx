import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import toast from "react-hot-toast";

import { useAuth } from "../context/AuthContext";
import axiosInstance from "../config/axiosConfig";
import Profile from "./Profile";
import UpdateCompany from "./UpdateCompany";

import { ChevronDown, AlertTriangle, Loader2, LogOut } from "lucide-react";

export default function TopBar({ fullOverlay }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isConfirmLogoutOpen, setIsConfirmLogoutOpen] = useState(false);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  
  const avatarSrc = `${import.meta.env.VITE_BACKEND_URL}/${user?.avatarUrl || `uploads/avatars/default/${(user?.id % 5) + 1}.png`}`;

  const { mutate: serverLogout, isLoading } = useMutation({
    mutationFn: () => axiosInstance.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/logout`),
    onSuccess: () => {
      logout();
      navigate("/");
      toast.success("Vous avez été déconnecté.");
    },
    onError: (err) => {
      console.error("Erreur lors de la déconnexion serveur:", err);
      logout();
      navigate("/");
      toast.error("Session locale effacée suite à une erreur serveur.");
    },
    onSettled: () => {
      if (fullOverlay) fullOverlay(false);
      setIsConfirmLogoutOpen(false);
    }
  });

  const handleLogoutClick = () => {
    setIsMenuOpen(false);
    setIsConfirmLogoutOpen(true);
    if (fullOverlay) fullOverlay(true);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target) &&
        buttonRef.current && !buttonRef.current.contains(e.target)
      ) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <div className="tw-relative tw-flex tw-justify-end tw-items-center">
        {/* BOUTON PROFIL : Plus compact et élégant */}
        <button
          ref={buttonRef}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={`
            tw-group tw-mr-4 tw-flex tw-items-center tw-gap-2 tw-p-1 tw-pr-3 
            tw-rounded-full tw-bg-white tw-border tw-border-gray-200 
            tw-transition-all tw-duration-200 tw-shadow-sm
            ${isMenuOpen ? 'tw-ring-2 tw-ring-orange-500 tw-border-transparent' : 'hover:tw-border-orange-300'}
          `}
        >
          <div className="tw-w-8 tw-h-8 tw-rounded-full tw-overflow-hidden tw-border tw-border-gray-100">
            <img
              src={avatarSrc}
              alt="Avatar"
              className="tw-w-full tw-h-full tw-object-cover"
            />
          </div>
          <span className="tw-text-xs tw-font-bold tw-text-slate-700 max-sm:tw-hidden">
            Menu
          </span>
          <ChevronDown 
            size={14} 
            className={`tw-text-gray-400 tw-transition-transform tw-duration-200 ${isMenuOpen ? 'tw-rotate-180 tw-text-orange-500' : 'group-hover:tw-text-orange-500'}`} 
          />
        </button>

        {/* MENU DÉROULANT */}
        {isMenuOpen && (
          <div
            ref={menuRef}
            className="tw-absolute tw-right-4 tw-top-full tw-mt-2 tw-w-60 tw-bg-white tw-rounded-xl tw-shadow-2xl tw-border tw-border-gray-100 tw-py-2 tw-z-[100] tw-animate-in tw-fade-in tw-zoom-in-95 tw-duration-100"
          >
            {/* Infos utilisateur rapides */}
            <div className="tw-px-4 tw-py-2 tw-mb-1">
              <p className="tw-text-[10px] tw-font-bold tw-text-gray-400 tw-uppercase tw-tracking-widest">Compte</p>
              <p className="tw-text-sm tw-font-bold tw-text-slate-800 tw-truncate">{user?.fullName || "Utilisateur"}</p>
            </div>

            <div className="tw-px-2 tw-space-y-1">
              <div className="hover:tw-bg-orange-50 tw-rounded-lg tw-transition-colors">
                <Profile />
              </div>
              <div className="hover:tw-bg-orange-50 tw-rounded-lg tw-transition-colors">
                <UpdateCompany />
              </div>
            </div>

            <div className="tw-border-t tw-border-gray-100 tw-my-2"></div>
            
            <div className="tw-px-2">
              <button
                onClick={handleLogoutClick}
                className="tw-w-full tw-flex tw-items-center tw-gap-2 tw-px-3 tw-py-2.5 tw-text-sm tw-font-bold tw-text-red-500 hover:tw-bg-red-50 tw-rounded-lg tw-transition-colors"
              >
                <LogOut size={16} />
                Déconnexion
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL DE CONFIRMATION */}
      {isConfirmLogoutOpen && (
        <div className="tw-fixed tw-inset-0 tw-flex tw-items-center tw-justify-center tw-bg-slate-900/60 tw-backdrop-blur-sm tw-z-[1000]">
          <div className="tw-bg-white tw-rounded-2xl tw-shadow-2xl tw-w-full tw-max-w-sm tw-p-6 tw-mx-4 tw-animate-in tw-slide-in-from-bottom-4">
            <div className="tw-text-center">
              <div className="tw-mx-auto tw-flex tw-items-center tw-justify-center tw-h-14 tw-w-14 tw-rounded-full tw-bg-red-50 tw-mb-4">
                <AlertTriangle className="tw-h-7 tw-w-7 tw-text-red-500" />
              </div>
              <h3 className="tw-text-lg tw-font-bold tw-text-slate-900">
                Déconnexion
              </h3>
              <p className="tw-mt-2 tw-text-sm tw-text-slate-500">
                Souhaitez-vous vraiment quitter votre session ?
              </p>
            </div>
            
            <div className="tw-mt-8 tw-flex tw-flex-col tw-gap-2">
              <button
                onClick={() => serverLogout()}
                disabled={isLoading}
                className="tw-w-full tw-py-3 tw-bg-red-500 hover:tw-bg-red-600 tw-text-white tw-font-bold tw-rounded-xl tw-transition-colors tw-flex tw-items-center tw-justify-center tw-gap-2 disabled:tw-opacity-50"
              >
                {isLoading ? <Loader2 className="tw-animate-spin" size={20} /> : "Confirmer la déconnexion"}
              </button>
              <button
                onClick={() => { if (fullOverlay) fullOverlay(false); setIsConfirmLogoutOpen(false); }}
                disabled={isLoading}
                className="tw-w-full tw-py-3 tw-bg-slate-100 hover:tw-bg-slate-200 tw-text-slate-700 tw-font-bold tw-rounded-xl tw-transition-colors disabled:tw-opacity-50"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

TopBar.propTypes = {
  fullOverlay: PropTypes.func,
};
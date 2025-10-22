import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import toast from "react-hot-toast";

import { useAuth } from "../context/AuthContext";
import axiosInstance from "../config/axiosConfig";
import Profile from "./Profile";
import UpdateCompany from "./UpdateCompany";

import { ChevronDown, AlertTriangle, Loader2 } from "lucide-react";

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
      fullOverlay(false);
      setIsConfirmLogoutOpen(false);
    }
  });

  const handleLogoutClick = () => {
    setIsMenuOpen(false);
    setIsConfirmLogoutOpen(true);
    fullOverlay(true);
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
      <div className="tw-relative mt-2">
        <button
          ref={buttonRef}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="tw-mr-4 tw-flex tw-items-center tw-gap-2 tw-p-1.5 tw-rounded-full tw-bg-white/50 hover:tw-bg-white/80 tw-transition-colors tw-shadow-sm"
        >
          <img
            src={avatarSrc}
            alt="Avatar"
            className="tw-w-8 tw-h-8 tw-rounded-full tw-object-cover"
          />
          {/* <span className="tw-font-semibold tw-text-sm tw-text-gray-700 max-sm:tw-hidden">{user?.fullName}</span> */}
          <ChevronDown size={16} className={`tw-text-gray-600 tw-transition-transform ${isMenuOpen ? 'tw-rotate-180' : ''}`} />
        </button>

        {isMenuOpen && (
          <div
            ref={menuRef}
            className="tw-absolute tw-right-0 tw-mt-2 tw-w-56 tw-bg-white tw-rounded-lg tw-shadow-xl tw-py-1 tw-z-10"
          >
            <Profile />
            <UpdateCompany />
            <div className="tw-border-t tw-my-1"></div>
            <button
              onClick={handleLogoutClick}
              className="tw-w-full tw-text-left tw-px-4 tw-py-2 tw-text-sm tw-text-red-600 hover:tw-bg-red-50 tw-flex tw-items-center"
            >
              Déconnexion
            </button>
          </div>
        )}
      </div>

      {isConfirmLogoutOpen && (
        <div className="tw-fixed tw-inset-0 tw-flex tw-items-center tw-justify-center tw-bg-black/50 tw-z-50">
          <div className="tw-bg-white tw-rounded-xl tw-shadow-2xl tw-w-full tw-max-w-md tw-p-6">
            <div className="tw-text-center">
              <div className="tw-mx-auto tw-flex tw-items-center tw-justify-center tw-h-12 tw-w-12 tw-rounded-full tw-bg-red-100">
                <AlertTriangle className="tw-h-6 tw-w-6 tw-text-red-600" />
              </div>
              <h3 className="tw-mt-3 tw-text-lg tw-font-semibold tw-text-gray-900">
                Confirmation de déconnexion
              </h3>
              <p className="tw-mt-2 tw-text-sm tw-text-gray-500">
                Êtes-vous sûr de vouloir vous déconnecter ?
              </p>
            </div>
            <div className="tw-mt-5 tw-grid tw-grid-cols-2 tw-gap-3">
              <button
                onClick={() => { fullOverlay(false); setIsConfirmLogoutOpen(false); }}
                disabled={isLoading}
                className="btn btn-light"
              >
                Annuler
              </button>
              <button
                onClick={() => serverLogout()}
                disabled={isLoading}
                className="btn btn-danger tw-flex tw-items-center tw-justify-center"
              >
                {isLoading ? <Loader2 className="tw-animate-spin" size={20} /> : "Oui, déconnecter"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

TopBar.propTypes = {
  fullOverlay: PropTypes.func,
};
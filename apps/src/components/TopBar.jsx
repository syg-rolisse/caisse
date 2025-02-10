import { useMutation } from "@tanstack/react-query";
import PropTypes from "prop-types";
import { useEffect, useRef, useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../config/axiosConfig";
import Profile from "./Profile";
import UpdateCompany from "./UpdateCompany";

const TopBar = ({ userName, fullOverlay }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isConfirmLogoutOpen, setIsConfirmLogoutOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));
  const token = user?.token?.token;

  const navigate = useNavigate();

  const { mutate, isLoading, isError, error } = useMutation(
    () =>
      axiosInstance.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      ),
    {
      onSuccess: () => {
        localStorage.removeItem("user");
        setIsConfirmLogoutOpen(false);
        navigate("/");
      },
      onError: (err) => {
        console.error("Erreur lors de la déconnexion:", err);
      },
    }
  );

  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogoutClick = () => {
    setIsConfirmLogoutOpen(true);
    setIsMenuOpen(false);
    fullOverlay(true);
  };

  const handleClickOutside = (e) => {
    if (
      menuRef.current &&
      !menuRef.current.contains(e.target) &&
      !buttonRef.current.contains(e.target)
    ) {
      setIsMenuOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="tw-mt-4 tw-flex tw-justify-between tw-items-center tw-absolute tw-right-8">
      <div className="tw-text-xl tw-font-bold"></div>
      <div className="tw-relative">
        <button
          ref={buttonRef}
          onClick={toggleMenu}
          className="tw-flex tw-items-center tw-space-x-2 tw-bg-gray-200 tw-text-white tw-py-2 tw-px-4 tw-rounded-full"
        >
          <FaUserCircle className="tw-text-2xl" />
          <span>{userName}</span>
          <span className="tw-ml-2">⋮</span>
        </button>
        {isMenuOpen && (
          <div
            ref={menuRef}
            className="tw-absolute tw-right-0 tw-mt-2 tw-w-48 tw-bg-white tw-rounded-md tw-shadow-lg tw-py-2"
          >
            <Profile />
            <UpdateCompany />
            <button
              onClick={handleLogoutClick}
              className="tw-block tw-w-full tw-text-left tw-px-4 tw-py-2 tw-text-sm tw-text-gray-700 tw-hover:bg-gray-100"
            >
              Déconnexion
            </button>
          </div>
        )}
      </div>

      {isConfirmLogoutOpen && (
        <div className="tw-fixed tw-inset-0 tw-flex tw-items-center tw-justify-center tw-bg-black/50 tw-z-50">
          <div className="tw-bg-white tw-rounded-xl tw-shadow-2xl tw-w-[420px]">
            <div className="tw-text-center tw-mb-6">
              <svg
                className="tw-w-16 tw-h-16 tw-mx-auto text-danger"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M0 0h24v24H0z" fill="none" />
                <path d="M15.73 3H8.27L3 8.27v7.46L8.27 21h7.46L21 15.73V8.27L15.73 3zM12 17.3c-.72 0-1.3-.58-1.3-1.3 0-.72.58-1.3 1.3-1.3.72 0 1.3.58 1.3 1.3 0 .72-.58 1.3-1.3 1.3zm1-4.3h-2V7h2v6z" />
              </svg>
              <h2 className="tw-text-2xl tw-font-bold text-danger tw-mt-4">
                Déconnexion
              </h2>
            </div>
            <p className="tw-text-gray-800 tw-text-center tw-text-lg tw-mb-6">
              Êtes-vous sûr de vouloir quitter le système ?
            </p>
            <div className="tw-flex tw-justify-center tw-gap-4 tw-bg-zinc-200 tw-py-4">
              <button
                onClick={() => {
                  fullOverlay(false);
                  mutate();
                }}
                disabled={isLoading}
                className="tw-px-6 tw-py-2 btn-danger tw-text-white tw-font-semibold tw-rounded-lg hover:tw-bg-red-700 disabled:tw-opacity-50"
              >
                Oui
              </button>
              <button
                onClick={() => {
                  fullOverlay(false);
                  setIsConfirmLogoutOpen(false);
                }}
                disabled={isLoading}
                className="tw-px-6 tw-py-2 tw-bg-gray-500 tw-text-white tw-font-semibold tw-rounded-lg hover:tw-bg-gray-700 disabled:tw-opacity-50"
              >
                Annuler
              </button>
            </div>

            {isError && (
              <p className="text-danger tw-text-center tw-mt-4">
                Erreur: {error?.message || "Impossible de se déconnecter"}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

TopBar.propTypes = {
  userName: PropTypes.string,
  fullOverlay: PropTypes.func,
};

export default TopBar;

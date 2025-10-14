import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useLocation } from "react-router-dom";

export default function WelcomeModal({ isActive, onClose, children }) {
  const location = useLocation();
  const [isQcr, setIsQcr] = useState(false);

  useEffect(() => {
    const pathParts = location.pathname.split("/");
    if (pathParts[1] === "qcr") {
      setIsQcr(true);
    }
  }, [location.pathname]);

  // Bloquer le scroll du body quand le modal est ouvert
  useEffect(() => {
    if (isActive) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isActive]);

  // Fermer avec la touche "Escape"
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  };

  const modalVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 300, damping: 25, mass: 0.7 },
    },
    exit: { opacity: 0, y: 20, scale: 0.95, transition: { duration: 0.2 } },
  };

  return (
    <AnimatePresence>
      {isActive && (
        <>
          {/* Backdrop avec un fond gris semi-transparent */}
          <motion.div
            key="backdrop"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            className="tw-fixed tw-inset-0 tw-z-[9999] tw-backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            key="modal"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            role="dialog"
            aria-modal="true"
            className="tw-fixed tw-inset-0 tw-z-[10000] tw-flex tw-items-center tw-justify-center tw-p-4"
          >
            <div
              className={`tw-relative tw-w-full tw-max-w-md tw-max-h-[90vh] tw-rounded-2xl tw-p-6 tw-shadow-2xl tw-backdrop-blur-xl ${
                isQcr
                  ? "tw-bg-transparent tw-border-transparent"
                  : "tw-bg-white/80 tw-border tw-border-gray-200"
              }`}
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "#fb923c #fed7aa", // Orange et orange clair
              }}
            >
              {/* Styles pour la scrollbar et le mode QCR */}
              <style>
                {`
                  ::-webkit-scrollbar {
                    width: 8px;
                  }
                  ::-webkit-scrollbar-track {
                    background: #fed7aa; /* Orange clair */
                    border-radius: 8px;
                  }
                  ::-webkit-scrollbar-thumb {
                    background-color: #fb923c; /* Orange principal */
                    border-radius: 8px;
                  }

                  /* Styles pour le mode QCR (texte blanc sur fond transparent) */
                  .qcr-mode label, 
                  .qcr-mode input,
                  .qcr-mode textarea,
                  .qcr-mode select,
                  .qcr-mode p,
                  .qcr-mode h1, .qcr-mode h2, .qcr-mode h3 {
                    color: white !important;
                  }
                  .qcr-mode input, 
                  .qcr-mode textarea, 
                  .qcr-mode select {
                    background-color: transparent !important;
                    border: 1px solid rgba(255, 255, 255, 0.5) !important;
                  }
                `}
              </style>

              {/* Bouton fermer (orange) */}
              <button
                onClick={onClose}
                aria-label="Fermer"
                className="tw-absolute tw-top-3 tw-right-3 tw-p-1 tw-rounded-full tw-bg-orange-500 tw-text-white hover:tw-bg-orange-600 tw-transition-colors"
              >
                <X size={20} />
              </button>

              {/* Contenu dynamique */}
              <div className={isQcr ? "qcr-mode" : ""}>{children}</div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

WelcomeModal.propTypes = {
  isActive: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node,
};
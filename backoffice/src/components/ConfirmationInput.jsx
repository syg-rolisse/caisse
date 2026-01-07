// src/components/ConfirmationInput.js
import { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import PropTypes from "prop-types";
import { Keyboard } from "lucide-react";

const generateRandomCode = (length) => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

// Modification de codeLength par défaut à 8
function ConfirmationInput({ onValidationChange, codeLength = 8 }) {
  const confirmationCode = useMemo(() => generateRandomCode(codeLength), [codeLength]);
  const [userInput, setUserInput] = useState("");

  useEffect(() => {
    const isValid = userInput === confirmationCode;
    onValidationChange(isValid);
  }, [userInput, confirmationCode, onValidationChange]);

  const preventPaste = (e) => {
    e.preventDefault();
    toast.error("Le copier-coller est désactivé.", {
      icon: "📋",
    });
  };

  const preventDrop = (e) => {
    e.preventDefault();
    toast.error("Le glisser-déposer est désactivé.", {
      icon: "💧",
    });
  };

  return (
    <div className="tw-bg-slate-50 tw-p-4 tw-rounded-lg tw-border tw-border-slate-200 tw-space-y-4">
      <div className="tw-flex tw-items-center tw-text-sm tw-text-slate-600">
        <Keyboard size={16} className="tw-mr-2" />
        <span>Veuillez recopier le code ci-dessous pour confirmer.</span>
      </div>
      
      <div className="tw-text-center tw-bg-white tw-p-3 tw-rounded-md tw-border-2 tw-border-dashed tw-border-slate-300 tw-select-none">
        <span 
          className="tw-text-red-500 tw-font-bold tw-tracking-[0.25em] tw-text-2xl"
          style={{
            // Style pour rendre le code un peu plus difficile à lire
            display: 'inline-block',
            fontFamily: 'serif',
            fontStyle: 'italic',
            transform: 'skewX(-10deg)',
            filter: 'blur(0.4px)',
            letterSpacing: '0.3em'
          }}
        >
          {confirmationCode}
        </span>
      </div>
      
      <input
        type="text"
        className="tw-w-full tw-p-2 tw-text-center tw-text-lg tw-font-medium tw-tracking-widest tw-rounded-md tw-border tw-border-slate-300 tw-bg-white tw-text-slate-800 focus:tw-outline-none focus:tw-ring-0.5 focus:tw-ring-orange-500 focus:tw-border-orange-500"
        placeholder="Recopier le code ici"
        value={userInput}
        onChange={(e) => setUserInput(e.target.value.toUpperCase().trim())}
        autoComplete="off"
        maxLength={codeLength}
        onPaste={preventPaste}
        onDrop={preventDrop}
      />
    </div>
  );
}

ConfirmationInput.propTypes = {
  onValidationChange: PropTypes.func.isRequired,
  codeLength: PropTypes.number,
};

export default ConfirmationInput;
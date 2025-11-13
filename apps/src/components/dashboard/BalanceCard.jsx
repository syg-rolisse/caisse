import PropTypes from 'prop-types';
import { useState, useRef, useEffect } from 'react';
import { Landmark, ArrowUpCircle, ArrowDownCircle, Eye } from 'lucide-react';
import { usePermissions } from '../../hook/usePermissions';
import toast from "react-hot-toast";

const BalanceCard = ({ solde = 0 }) => {
  const { can } = usePermissions();
  const isPositive = solde > 0;

  const [isBalanceVisible, setIsBalanceVisible] = useState(false);

  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      clearTimeout(timerRef.current);
    };
  }, []);

  const handleToggleVisibility = () => {
    const hasPermission = can('voirLeSolde');

    if (!hasPermission) {
      toast.error("Désolé, vous n'êtes pas autorisé à voir le solde de la caisse.");
      return;
    }

    if (isBalanceVisible) {
      return;
    }

    setIsBalanceVisible(true);

    clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      setIsBalanceVisible(false);
    }, 5000);
  };

  return (
    <div className="tw-bg-white tw-p-6 tw-rounded-xl tw-shadow-md tw-border tw-border-gray-100 tw-h-full tw-flex tw-flex-col">
      <div className="tw-flex-shrink-0">
        <div className="tw-flex tw-items-center tw-justify-between tw-mb-4">
          <h3 className="tw-text-lg tw-font-semibold tw-text-gray-700">Solde de la Caisse</h3>
          <div className="tw-p-2 tw-bg-green-100 tw-rounded-lg">
            <Landmark className="tw-w-6 tw-h-6 tw-text-green-600" />
          </div>
        </div>
      </div>
      <div className="tw-my-auto">
        {isBalanceVisible ? (
          <p className={`tw-text-4xl tw-font-bold ${isPositive ? 'tw-text-green-600' : 'tw-text-red-600'}`}>
            {solde?.toLocaleString() || 0} FCFA
          </p>
        ) : (
          <p className="tw-text-4xl tw-font-bold tw-text-gray-400 tw-blur-sm tw-select-none">
            ******** FCFA
          </p>
        )}
      </div>
      <div className="tw-mt-auto tw-flex-shrink-0 tw-flex tw-items-center tw-justify-between">
        <div className="tw-flex tw-items-center tw-gap-2 tw-mt-2 tw-text-sm">
          {isPositive ? (
            <span className="tw-flex tw-items-center tw-text-gray-500">
              <ArrowUpCircle className="tw-w-4 tw-h-4 tw-mr-1 tw-text-green-500" /> Cash Flow Positif
            </span>
          ) : (
            <span className="tw-flex tw-items-center tw-text-gray-500">
              <ArrowDownCircle className="tw-w-4 tw-h-4 tw-mr-1 tw-text-red-500" /> Cash Flow Négatif
            </span>
          )}
        </div>

        <button
          onClick={handleToggleVisibility}
          className="tw-mt-4"
        >
          <div className="tw-p-2 tw-bg-violet-100 hover:tw-bg-violet-200 tw-rounded-full tw-inline-block tw-transition-colors">
            <Eye className="tw-w-4 tw-h-4 tw-text-violet-600" />
          </div>
        </button>
      </div>
    </div>
  );
};

BalanceCard.propTypes = { solde: PropTypes.number };

export default BalanceCard;
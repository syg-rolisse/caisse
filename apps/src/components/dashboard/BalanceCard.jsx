// src/components/dashboard/BalanceCard.js
import PropTypes from 'prop-types';
import { Landmark, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

const BalanceCard = ({ solde = 0 }) => {
  const isPositive = solde > 0;

  return (
    <div className=" tw-bg-white tw-p-6 tw-rounded-xl tw-shadow-md tw-border tw-border-gray-100">
      <div className="tw-flex tw-items-center tw-justify-between tw-mb-4">
        <h3 className="tw-text-lg tw-font-semibold tw-text-gray-700">Solde de la Caisse</h3>
        <div className="tw-p-2 tw-bg-green-100 tw-rounded-lg">
          <Landmark className="tw-w-6 tw-h-6 tw-text-green-600" />
        </div>
      </div>
      <p className={`tw-text-4xl tw-font-bold ${isPositive ? 'tw-text-green-600' : 'tw-text-red-600'}`}>
        {solde?.toLocaleString() || 0} FCFA
      </p>
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
    </div>
  );
};

BalanceCard.propTypes = {
  solde: PropTypes.number,
};

export default BalanceCard;
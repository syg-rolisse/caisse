import { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { ShieldCheck, AlertTriangle, CalendarClock } from 'lucide-react';

const calculateTimeLeft = (endDate) => {
  if (!endDate) return null;
  const difference = +new Date(endDate) - +new Date();
  if (difference <= 0) return { jours: 0, heures: 0, minutes: 0, secondes: 0 };
  return {
    jours: Math.floor(difference / (1000 * 60 * 60 * 24)),
    heures: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    secondes: Math.floor((difference / 1000) % 60),
  };
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('fr-FR', options);
};

export default function SubscriptionCountdownCard({ abonnements = [] }) {
  const latestSubscription = useMemo(() => {
    if (!abonnements || abonnements.length === 0) return null;
    return abonnements.reduce((latest, current) => 
      new Date(current.dateFin) > new Date(latest.dateFin) ? current : latest
    );
  }, [abonnements]);

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(latestSubscription?.dateFin));

  useEffect(() => {
    if (!latestSubscription) return;
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft(latestSubscription.dateFin)), 1000);
    return () => clearInterval(timer);
  }, [latestSubscription]);

  if (!latestSubscription) {
    return (
      <div className="card custom-card fade-in tw-h-full tw-flex tw-items-center tw-justify-center">
        <div className="card-body">
          <div className="tw-flex tw-items-center">
            <div className="tw-bg-red-100 tw-p-3 tw-rounded-lg tw-mr-4">
              <AlertTriangle className="tw-w-6 tw-h-6 tw-text-red-500" />
            </div>
            <div>
              <p className="tw-font-semibold tw-text-lg tw-text-gray-700">Aucun Abonnement Actif</p>
              <span className="tw-text-sm tw-text-gray-500">Veuillez souscrire à un pack.</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isExpired = Object.values(timeLeft).every(val => val === 0);

  return (
    <div className="card custom-card fade-in tw-h-full tw-flex tw-flex-col">
      <div className="card-body tw-flex tw-flex-col tw-flex-grow">
        <div className="tw-flex-shrink-0">
          <div className="tw-flex tw-justify-between tw-items-start">
            <div>
              <h3 className="tw-font-semibold tw-text-lg tw-text-gray-700">Abonnement Actif</h3>
              <span className="tw-text-sm tw-text-gray-500">{latestSubscription.packLibelle}</span>
            </div>
            <div className={`tw-p-3 tw-rounded-lg ${isExpired ? 'tw-bg-red-100' : 'tw-bg-green-100'}`}>
              {isExpired ? <AlertTriangle className="tw-w-6 tw-h-6 tw-text-red-500" /> : <ShieldCheck className="tw-w-6 tw-h-6 tw-text-green-500" />}
            </div>
          </div>
        </div>
        
        <div className="tw-py-4 tw-flex-grow tw-flex tw-items-center tw-justify-center">
          {isExpired ? (
            <div className="tw-text-center">
              <p className="tw-text-lg tw-font-bold tw-text-red-600">Expiré</p>
              <p className="tw-text-sm tw-text-gray-500">Le {formatDate(latestSubscription.dateFin)}</p>
            </div>
          ) : (
            <div className="tw-grid tw-grid-cols-4 tw-gap-2 tw-text-center">
              {Object.entries(timeLeft).map(([unit, value]) => (
                <div key={unit}>
                  <p className="tw-text-2xl tw-font-bold tw-text-gray-800">{String(value).padStart(2, '0')}</p>
                  <span className="tw-text-xs tw-text-gray-500 tw-uppercase">{unit}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {!isExpired && (
          <div className="tw-flex tw-items-center tw-justify-center tw-gap-2 tw-w-full tw-p-2 tw-rounded-lg tw-bg-red-100 tw-text-red-700 tw-text-xs tw-font-semibold tw-flex-shrink-0">
            <CalendarClock size={14} className="tw-flex-shrink-0" />
            <span>Expire le {formatDate(latestSubscription.dateFin)}</span>
          </div>
        )}
      </div>
    </div>
  );
}

SubscriptionCountdownCard.propTypes = {
  abonnements: PropTypes.array,
};
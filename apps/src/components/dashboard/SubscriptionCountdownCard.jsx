import { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { ShieldCheck, AlertTriangle } from 'lucide-react';

// Fonction utilitaire pour calculer le temps restant
const calculateTimeLeft = (endDate) => {
  if (!endDate) return null;

  const difference = +new Date(endDate) - +new Date();
  let timeLeft = {};

  if (difference > 0) {
    timeLeft = {
      jours: Math.floor(difference / (1000 * 60 * 60 * 24)),
      heures: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      secondes: Math.floor((difference / 1000) % 60),
    };
  } else {
    return { jours: 0, heures: 0, minutes: 0, secondes: 0 };
  }
  return timeLeft;
};

export default function SubscriptionCountdownCard({ abonnements = [] }) {
  // 1. Trouver l'abonnement qui expire le plus tard
  const latestSubscription = useMemo(() => {
    if (!abonnements || abonnements.length === 0) {
      return null;
    }
    // On trie par date de fin et on prend le plus récent
    return abonnements.reduce((latest, current) => 
      new Date(current.dateFin) > new Date(latest.dateFin) ? current : latest
    );
  }, [abonnements]);

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(latestSubscription?.dateFin));

  // 2. Mettre en place le décompte toutes les secondes
  useEffect(() => {
    if (!latestSubscription) return;

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(latestSubscription.dateFin));
    }, 1000);

    // Nettoyer l'intervalle quand le composant est démonté
    return () => clearInterval(timer);
  }, [latestSubscription]);

  // 3. Rendu du composant
  if (!latestSubscription) {
    return (
       <div className="card custom-card fade-in">
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
    <div className="card custom-card fade-in">
      <div className="card-body">
        <div className="tw-flex tw-justify-between tw-items-start">
          <div>
            <p className="tw-font-semibold tw-text-lg tw-text-gray-700">Abonnement Actif</p>
            <span className="tw-text-sm tw-text-gray-500">{latestSubscription.packLibelle}</span>
          </div>
          <div className={`tw-p-3 tw-rounded-lg ${isExpired ? 'tw-bg-red-100' : 'tw-bg-green-100'}`}>
            {isExpired ? (
              <AlertTriangle className="tw-w-6 tw-h-6 tw-text-red-500" />
            ) : (
              <ShieldCheck className="tw-w-6 tw-h-6 tw-text-green-500" />
            )}
          </div>
        </div>
        
        <div className="tw-mt-4">
          {isExpired ? (
            <div className="tw-text-center">
              <p className="tw-text-lg tw-font-bold tw-text-red-600">Expiré</p>
              <span className="tw-text-sm tw-text-gray-500">Veuillez renouveler votre abonnement.</span>
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
      </div>
    </div>
  );
}

SubscriptionCountdownCard.propTypes = {
  abonnements: PropTypes.array,
};
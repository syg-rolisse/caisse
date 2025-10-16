import PropTypes from 'prop-types';
// 👇 CORRECTION : 'Package' et 'Info' ont été retirés de la liste d'imports
import { ShieldCheck, CalendarClock, User, DollarSign, CheckCircle, XCircle } from 'lucide-react';
import { DateTime } from 'luxon';

export default function AbonnementCard({ item }) {
  const dateDebut = DateTime.fromISO(item.dateDebut).toLocaleString(DateTime.DATE_FULL);
  const dateFin = DateTime.fromISO(item.dateFin).toLocaleString(DateTime.DATE_FULL);
  const joursRestants = Math.ceil(DateTime.fromISO(item.dateFin).diffNow('days').days);

  const getStatusInfo = () => {
    if (joursRestants <= 0) {
      return { text: 'Expiré', icon: <XCircle size={14} />, color: 'tw-text-red-600' };
    }
    if (joursRestants <= 7) {
      return { text: `Expire dans ${joursRestants} j`, icon: <CalendarClock size={14} />, color: 'tw-text-orange-600' };
    }
    return { text: 'Actif', icon: <CheckCircle size={14} />, color: 'tw-text-green-600' };
  };
  
  const statusInfo = getStatusInfo();

  return (
    <div className="tw-bg-white tw-rounded-xl tw-shadow-md tw-border tw-border-gray-200 tw-flex tw-flex-col">
      <div className="tw-p-4 tw-flex-grow">
        <div className="tw-flex tw-justify-between tw-items-start tw-gap-4">
          <div className="tw-flex-1">
            <h3 className="tw-font-bold tw-text-lg tw-text-gray-800 tw-break-words">{item.packLibelle}</h3>
            <div className={`tw-flex tw-items-center tw-text-sm tw-font-semibold ${statusInfo.color}`}>
              {statusInfo.icon}
              <span className="tw-ml-1">{statusInfo.text}</span>
            </div>
          </div>
          <div className="tw-flex-shrink-0 tw-bg-blue-100 tw-p-3 tw-rounded-lg">
            <ShieldCheck className="tw-w-6 tw-h-6 tw-text-blue-600" />
          </div>
        </div>
        
        <p className="tw-text-sm tw-text-gray-600 tw-mt-2">{item.packDescription}</p>

        <div className="tw-mt-4 tw-space-y-2 tw-text-sm tw-border-t tw-pt-4">
          <div className="tw-flex tw-items-center tw-text-gray-700">
            <DollarSign size={14} className="tw-mr-2" />
            <span>Prix : <span className="tw-font-bold">{item.packMontant?.toLocaleString()} F</span></span>
          </div>
           <div className="tw-flex tw-items-center tw-text-gray-700">
            <CalendarClock size={14} className="tw-mr-2" />
            <span>Du <span className="tw-font-medium">{dateDebut}</span> au <span className="tw-font-medium">{dateFin}</span></span>
          </div>
          <div className="tw-flex tw-items-center tw-text-gray-700">
            <User size={14} className="tw-mr-2" />
            <span>Activé par : <span className="tw-font-medium">{item.Users?.fullName}</span></span>
          </div>
        </div>
      </div>
    </div>
  );
};

AbonnementCard.propTypes = {
  item: PropTypes.object.isRequired,
};
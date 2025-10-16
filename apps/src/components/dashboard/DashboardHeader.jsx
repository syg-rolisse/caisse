// src/components/dashboard/DashboardHeader.js

import { FileDown, CalendarDays } from 'lucide-react';

const DashboardHeader = () => {
  return (
    <header className="tw-mb-6 md:tw-mb-8">
      <div className="tw-flex tw-flex-col md:tw-flex-row md:tw-items-center md:tw-justify-between tw-gap-4">
        {/* Titre et sous-titre */}
        <div>
          <h1 className="tw-text-3xl tw-font-bold tw-tracking-tight tw-text-gray-800 dark:tw-text-gray-100">
            Tableau de Bord
          </h1>
          <p className="tw-mt-1 tw-text-md tw-text-gray-500 dark:tw-text-gray-400">
            Vue d&apos;ensemble de l&apos;activité de votre caisse.
          </p>
        </div>

        {/* Boutons d'action */}
        <div className="tw-flex tw-items-center tw-gap-2">
          <button className="tw-flex tw-items-center tw-justify-center tw-gap-2 tw-px-4 tw-py-2 tw-text-sm tw-font-semibold tw-text-gray-700 tw-bg-white tw-border tw-border-gray-300 tw-rounded-lg tw-shadow-sm hover:tw-bg-gray-50 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-offset-2 focus:tw-ring-violet-500 tw-transition-colors">
            <CalendarDays size={16} />
            <span>Période : 30 jours</span>
          </button>
          
          <button className="tw-flex tw-items-center tw-justify-center tw-gap-2 tw-px-4 tw-py-2 tw-text-sm tw-font-semibold tw-text-gray-700 tw-bg-white tw-border tw-border-gray-300 tw-rounded-lg tw-shadow-sm hover:tw-bg-gray-50 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-offset-2 focus:tw-ring-violet-500 tw-transition-colors">
            <FileDown size={16} />
            <span>Exporter</span>
          </button>

          {/* <button className="tw-flex tw-items-center tw-justify-center tw-gap-2 tw-px-4 tw-py-2 tw-text-sm tw-font-semibold tw-text-white tw-bg-violet-600 tw-rounded-lg tw-shadow-sm hover:tw-bg-violet-700 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-offset-2 focus:tw-ring-violet-500 tw-transition-colors">
            <PlusCircle size={16} />
            <span>Nouvelle Opération</span>
          </button> */}
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
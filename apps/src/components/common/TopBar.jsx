
import PropTypes from "prop-types"; // 2. Ajout de l'import pour les PropTypes

// 1. Imports nettoyés : seules les icônes réellement utilisées sont importées.
import { Landmark, ChevronRight, ChevronDown } from 'lucide-react';

const user = JSON.parse(localStorage.getItem("user"));

/**
 * TopBar est la barre de navigation supérieure de l'application.
 * Elle affiche le contexte de la page et les informations de l'utilisateur.
 */
function TopBar({ pageTitle }) {
  // Vous pouvez récupérer le vrai nom de l'utilisateur depuis votre contexte ou vos props
  const userName = user?.fullName;
  const userRole = user?.profil?.wording;

  return (
    <div className="tw-bg-slate-700 tw-w-[100%] px-4 tw-py-4 tw-rounded-md tw-border-b tw-border-slate-200 tw-flex tw-items-center tw-justify-between">
      
      {/* --- Côté Gauche : Contexte de la page --- */}
      <div className="tw-flex tw-items-center tw-gap-4">
        {/* Logo de l'app */}
        <div className="tw-flex tw-items-center tw-gap-2">
          <div className="tw-p-2 tw-bg-orange-500 tw-rounded-lg">
            <Landmark size={20} className="tw-text-white" />
          </div>
          <span className="tw-font-bold tw-text-slate-100 tw-hidden md:tw-block">
            Caisse Pratique
          </span>
        </div>
        
        {/* Séparateur et Fil d'Ariane (Breadcrumb) */}
        <div className="tw-w-px tw-h-6 tw-bg-slate-200 tw-hidden sm:tw-block"></div>
        <nav className="tw-hidden sm:tw-flex tw-items-center tw-gap-2 tw-text-sm tw-text-slate-500">
          <span>Paramètres</span>
          <ChevronRight size={16} />
          {/* Utilisation de la prop pageTitle */}
          <span className="tw-font-semibold tw-text-slate-700">{pageTitle}</span>
        </nav>
      </div>

      {/* --- Côté Droit : Actions et Utilisateur --- */}
      <div className="tw-flex tw-items-center tw-gap-4">
        {/* Indicateur d'activité temps réel */}
        <div className="tw-flex tw-items-center tw-gap-3 tw-px-3 tw-py-2 tw-rounded-lg tw-bg-slate-50">
          <span className="tw-relative tw-flex tw-h-3 tw-w-3">
            <span className="tw-animate-ping tw-absolute tw-inline-flex tw-h-full tw-w-full tw-rounded-full tw-bg-green-400 tw-opacity-75"></span>
            <span className="tw-relative tw-inline-flex tw-rounded-full tw-h-3 tw-w-3 tw-bg-green-500"></span>
          </span>
          <span className="tw-text-sm tw-font-medium tw-text-slate-600 tw-hidden md:tw-inline">
            Activité Récente
          </span>
        </div>
        
        {/* Séparateur */}
        <div className="tw-w-px tw-h-6 tw-bg-slate-200"></div>

        {/* Menu Utilisateur */}
       <button className="tw-flex tw-items-center tw-gap-3 tw-p-2 tw-rounded-lg tw-transition-colors tw-duration-200 group hover:tw-bg-slate-100">
  <img 
    src={`https://ui-avatars.com/api/?name=${userName?.replace(' ', '+')}&background=random`} 
    alt="Avatar de l'utilisateur"
    className="tw-w-8 tw-h-8 tw-rounded-full"
  />
  <div className="tw-text-left tw-hidden md:tw-block">
    <p className="tw-font-semibold tw-text-sm tw-text-slate-100 tw-transition-colors tw-duration-200 hover:tw-text-slate-800">
      {userName}
    </p>
    <p className="tw-text-xs tw-text-slate-500 tw-transition-colors tw-duration-200">
      {userRole}
    </p>
  </div>
  <ChevronDown size={16} className="tw-text-slate-400 tw-hidden md:tw-block" />
</button>

      </div>
    </div>
  );
}

// 2. Ajout des PropTypes pour définir le type des props attendues.
// C'est une excellente pratique pour la robustesse du code.
TopBar.propTypes = {
  pageTitle: PropTypes.string,
};

// On peut aussi définir une valeur par défaut ici si on préfère
TopBar.defaultProps = {
  pageTitle: 'Tableau de bord',
};

export default TopBar;
import PropTypes from "prop-types";
import { Menu } from "lucide-react"; // On importe l'icône Menu

const Header = ({ toggleSidebar, isSidebarOpen }) => {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <header className="tw-sticky tw-top-0 tw-z-20 tw-w-full tw-bg-white tw-border-b tw-border-gray-200">
      <div className="tw-flex tw-items-center tw-justify-between tw-h-16 tw-px-4 sm:tw-px-6">
        
        <div className="tw-flex tw-items-center tw-gap-4">
          
          {/* BOUTON HAMBURGER AVEC ICÔNE MODERNE */}
          <button
            aria-label={isSidebarOpen ? "Cacher le menu" : "Afficher le menu"}
            onClick={toggleSidebar}
            // La zone de clic est toujours grande et confortable
            className="tw-h-10 tw-w-10 tw-flex tw-items-center tw-justify-center tw-rounded-md hover:tw-bg-gray-100"
          >
            {/* On remplace le <span> invisible par une icône Lucide visible et stylée */}
            <Menu className="tw-h-6 tw-w-6 tw-text-gray-600" />
          </button>

          <div className="header-element header-search tw-hidden sm:tw-block">
            <div className="tw-flex tw-items-center tw-justify-center">
              <span className="tw-inline-block tw-w-3 tw-h-3 tw-bg-green-600 tw-rounded-full tw-mr-2"></span>
              <span className="tw-text-green-600 tw-font-semibold tw-text-sm">en ligne</span>
              <span className="tw-text-gray-800 tw-font-semibold tw-text-sm tw-ml-2">{user?.fullName}</span>
            </div>
          </div>
        </div>
        
        <div className="header-content-right">
        </div>

      </div>
    </header>
  );
};

Header.propTypes = {
  toggleSidebar: PropTypes.func.isRequired,
  isSidebarOpen: PropTypes.bool.isRequired,
};

export default Header;
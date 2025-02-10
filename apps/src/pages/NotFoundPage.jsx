import PropTypes from "prop-types";
import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <div className="tw-flex tw-items-center tw-justify-center tw-h-screen tw-bg-gray-700">
      <div className="tw-p-8 tw-rounded-lg tw-shadow-lg tw-text-center tw-w-2/3 tw-lg:w-1/2">
        <div className="tw-p-3 tw-bg-gray-700">
          <Link to="/" className="tw-flex tw-justify-center tw-opacity-70">
            <div>
              <img
                src="assets/images/logo/ora.png"
                className="tw-w-80"
                alt="Logo"
              />
              <div className="tw-flex tw-justify-end">
                <p className="tw-font-bold tw-text-sm tw-text-green-600">
                  ADVICES
                </p>
              </div>
            </div>
          </Link>
        </div>

        <h1 className="tw-text-4xl tw-font-bold tw-text-red-600">404</h1>
        <p className="tw-text-xl tw-text-zinc-300 tw-mt-4">
          Oops! La page que vous recherchez n&apos;existe pas.
        </p>
        <p className="tw-text-gray-500 tw-mt-2">
          Il semble que vous ayez pris un mauvais chemin. Pas de panique !
        </p>
        <div className="tw-mt-6">
          <Link to="/" className="tw-text-green-600 tw-underline">
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </div>
  );
};

NotFoundPage.propTypes = {
  history: PropTypes.object,
};

export default NotFoundPage;

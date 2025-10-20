import { Phone, MapPin, BadgeCheck, BadgeX } from "lucide-react";
import PropTypes from "prop-types";

CompanyInfoCard.propTypes = {
  company: PropTypes.object.isRequired,
};

export default function CompanyInfoCard({ company }) {
  if (!company) return null;

  return (
    <div className="card custom-card tw-h-full tw-transform tw-transition-all hover:tw-shadow-lg hover:-tw-translate-y-1">
      <div className="card-body">
        <div className="tw-flex tw-flex-col tw-items-center tw-text-center">
          <img
            src={`${import.meta.env.VITE_BACKEND_URL}/uploads/${company.logoUrl || 'logo/company-logo.png'}`}
            alt={`Logo de ${company.companyName}`}
            className="tw-w-24 tw-h-24 tw-rounded-full tw-object-cover tw-mb-4 tw-shadow-md"
          />
          <h3 className="tw-text-lg tw-font-bold tw-text-gray-800">{company.companyName}</h3>
        </div>
        
        <hr className="tw-my-4" />

        <div className="tw-space-y-3 tw-text-sm">
          <div className="tw-flex tw-items-center">
            <Phone size={14} className="tw-mr-2 tw-text-gray-400 tw-flex-shrink-0" />
            <span className="tw-text-gray-600">{company.phoneNumber || "Non renseigné"}</span>
          </div>
          <div className="tw-flex tw-items-start">
            <MapPin size={14} className="tw-mr-2 tw-text-gray-400 tw-flex-shrink-0 tw-mt-0.5" />
            <span className="tw-text-gray-600">{company.address || "Non renseigné"}</span>
          </div>
          <div className="tw-flex tw-items-center">
            {company.status ? (
              <BadgeCheck size={14} className="tw-mr-2 tw-text-green-500 tw-flex-shrink-0" />
            ) : (
              <BadgeX size={14} className="tw-mr-2 tw-text-red-500 tw-flex-shrink-0" />
            )}
            <span className={`tw-font-medium ${company.status ? "tw-text-green-600" : "tw-text-red-600"}`}>
              {company.status ? "Actif" : "Inactif"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
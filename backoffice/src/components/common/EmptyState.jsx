import { PackageOpen } from 'lucide-react';
import PropTypes from 'prop-types';

export default function EmptyState({ title, description, Icon = PackageOpen, className = '' }) {
  return (
    <div
      className={`tw-flex tw-flex-col tw-items-center tw-justify-center tw-py-2 tw-text-center tw-animate-fade-in ${className}`}
    >
      <div className="tw-bg-gray-100 tw-p-5 tw-rounded-full tw-mb-5">
        <Icon
          className="tw-w-16 tw-h-16 tw-text-gray-400"
          strokeWidth={1.25}
        />
      </div>
      
      <h3 className="tw-text-xl tw-font-semibold tw-text-red-600">
        {title}
      </h3>
      
      {description && (
        <p className="tw-mt-2 tw-max-w-md tw-text-gray-500">
          {description}
        </p>
      )}
    </div>
  );
}

EmptyState.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  Icon: PropTypes.elementType,
  className: PropTypes.string,
};
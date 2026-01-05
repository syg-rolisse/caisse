import PropTypes from 'prop-types';
import { Ghost } from 'lucide-react';

const EmptyState = ({ message }) => {
  return (
    <div className="tw-flex tw-flex-col tw-items-center tw-justify-center tw-p-8 tw-border-2 tw-border-dashed tw-border-gray-200 tw-rounded-xl tw-bg-gray-50/50">
      <Ghost size={40} className="tw-text-red-300 tw-mb-3" />
      <p className="tw-text-gray-500 tw-font-medium tw-text-sm">{message}</p>
    </div>
  );
};

EmptyState.propTypes = {
  message: PropTypes.string,
};

export default EmptyState;
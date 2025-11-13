import PropTypes from 'prop-types';
import { SearchX  } from 'lucide-react';

const EmptyState = ({ message }) => {
  return (
    <div className="tw-flex tw-flex-col tw-items-center tw-justify-center tw-p-3 tw-text-center tw-text-gray-100 tw-bg-red-50">
      <SearchX  size={56} className="tw-text-red-500" />
      <p className="tw-text-md tw-text-red-500 tw-font-semibold tw-bg-red-100 tw-rounded-full tw-w-full tw-text-center">{message}</p>
    </div>
  );
};

EmptyState.propTypes = {
  message: PropTypes.string.isRequired,
};

export default EmptyState;
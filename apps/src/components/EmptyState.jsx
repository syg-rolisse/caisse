import PropTypes from 'prop-types';
import { SearchX  } from 'lucide-react';

const EmptyState = ({ message }) => {
  return (
    <div className="tw-flex tw-flex-col tw-items-center tw-justify-center tw-p-3 tw-text-center tw-text-gray-500">
      <SearchX  size={56} className="tw-text-gray-500" />
      <p className="tw-text-md tw-text-gray-500 tw-font-semibold tw-bg-gray-100 tw-rounded-full tw-text-center">{message}</p>
    </div>
  );
};

EmptyState.propTypes = {
  message: PropTypes.string.isRequired,
};

export default EmptyState;
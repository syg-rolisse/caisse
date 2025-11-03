import PropTypes from 'prop-types';
import { FolderSearch } from 'lucide-react';

const EmptyState = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center p-10 text-center text-gray-500">
      <FolderSearch size={48} className="mb-4" />
      <p className="text-lg">{message}</p>
    </div>
  );
};

EmptyState.propTypes = {
  message: PropTypes.string.isRequired,
};

export default EmptyState;
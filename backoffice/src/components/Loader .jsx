// src/components/Loader.jsx
import PropTypes from "prop-types";
import { ClipLoader } from "react-spinners";

const Loader = ({ loading }) => {
  return (
    <div className="loader-container">
      <ClipLoader color="#36d7b7" loading={loading} size={50} />
    </div>
  );
};

Loader.propTypes = {
  loading: PropTypes.bool.isRequired,
};

export default Loader;

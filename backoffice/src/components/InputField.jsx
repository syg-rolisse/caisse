import { forwardRef } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";

const InputField = forwardRef(({ id, label, type = "text", error, ...props }, ref) => {
  const inputClasses = clsx(
    "tw-mt-1 tw-block tw-w-full tw-rounded-md tw-h-10 tw-sm:tw-text-sm tw-px-3 tw-border",
    "dark:tw-bg-gray-700 dark:tw-text-white",
    {
      "tw-border-gray-300 focus:tw-border-purple-300 tw-outline-none": !error,
      "tw-border-red-500 focus:tw-border-red-500 tw-outline-none": error,
    }
  );

  return (
    <div>
      <label htmlFor={id} className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 dark:tw-text-gray-300">
        {label}
      </label>
      <input
        id={id}
        type={type}
        ref={ref}
        {...props}
        className={inputClasses}
      />
      {error && <p className="tw-mt-1 tw-text-sm tw-text-red-500">{error.message}</p>}
    </div>
  );
});

InputField.displayName = "InputField";

InputField.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  type: PropTypes.string,
  error: PropTypes.object,
};

export default InputField;

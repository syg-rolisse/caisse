// src/components/SearchableUserSelect.jsx

import { useState, useMemo, useRef, useEffect } from 'react';
import { Search, ChevronDown, X, UserX } from 'lucide-react';
import PropTypes from "prop-types";

export default function SearchableUserSelect({
  allUsers = [],
  value,
  onUserSelect,
  label = "Sélectionner un utilisateur",
  placeholder = "Rechercher un nom...",
  className = ''
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (value) {
      const selected = allUsers.find(user => user.id === value);
      if (selected) {
        setSearchTerm(selected.fullName);
      }
    } else {
      setSearchTerm('');
    }
  }, [value, allUsers]);

  const filteredUsers = useMemo(() => {
    if (!isFocused && value) {
        return allUsers;
    }
    
    const lowerCaseSearch = searchTerm.toLowerCase();
    
    const selectedUser = allUsers.find(user => user.id === value);
    if (selectedUser && lowerCaseSearch === (selectedUser.fullName || '').toLowerCase()) {
        return allUsers;
    }

    return allUsers.filter(user =>
      (user.fullName || '').toLowerCase().includes(lowerCaseSearch) ||
      (user.email || '').toLowerCase().includes(lowerCaseSearch)
    );
  }, [searchTerm, allUsers, value, isFocused]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
        const selected = allUsers.find(user => user.id === value);
        if (selected) {
          setSearchTerm(selected.fullName);
        } else {
          setSearchTerm('');
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef, value, allUsers]);

  const handleSelectUser = (user) => {
    setIsOpen(false);
    onUserSelect(user.id);
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    if (!isOpen) {
      setIsOpen(true);
    }
  };
  
  const handleClear = () => {
      onUserSelect(null);
      setSearchTerm('');
      setIsOpen(false);
  }

  return (
    <div ref={wrapperRef} className={`tw-relative tw-w-full ${className}`}>
      {label && <label className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 dark:tw-text-gray-300 tw-mb-1">{label}</label>}

      <div className="tw-relative">
        <Search className="tw-absolute tw-left-3 tw-top-1/2 -tw-translate-y-1/2 tw-text-gray-400" size={20} />
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => { setIsOpen(true); setIsFocused(true); }}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="tw-w-full tw-pl-10 tw-pr-10 tw-py-2 tw-border tw-border-gray-300 dark:tw-border-gray-600 tw-rounded-lg tw-bg-white dark:tw-bg-gray-700 focus:tw-outline-none focus:tw-ring-1 focus:tw-ring-orange-500"
        />
        <div className="tw-absolute tw-right-3 tw-top-1/2 -tw-translate-y-1/2">
          {value ? (
            <button type="button" onClick={handleClear} className="tw-text-gray-500 hover:tw-text-gray-800 dark:hover:tw-text-gray-200">
              <X size={20} />
            </button>
          ) : (
            <ChevronDown className="tw-text-gray-400" size={20} />
          )}
        </div>
      </div>

      {isOpen && (
        <div className="tw-absolute tw-z-50 tw-mt-1 tw-w-full tw-max-h-60 tw-overflow-y-auto tw-bg-white dark:tw-bg-gray-800 tw-border tw-border-gray-300 dark:tw-border-gray-600 tw-rounded-lg tw-shadow-lg">
          {filteredUsers.length > 0 ? (
            filteredUsers.map(user => (
              <div
                key={user.id}
                onClick={() => handleSelectUser(user)}
                className={`tw-flex tw-items-center tw-gap-3 tw-p-3 tw-cursor-pointer hover:tw-bg-orange-50 dark:hover:tw-bg-orange-900/50 ${value === user.id ? 'tw-bg-orange-100 dark:tw-bg-orange-900' : ''}`}
              >
                <img
                  className="tw-w-8 tw-h-8 tw-rounded-full tw-object-cover"
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || '')}&background=random`}
                  alt={`Avatar de ${user.fullName}`}
                />
                <div>
                  <p className="tw-font-semibold tw-text-sm tw-text-gray-800 dark:tw-text-gray-200">{user.fullName}</p>
                  <p className="tw-text-xs tw-text-gray-500 dark:tw-text-gray-400">{user.email}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="tw-flex tw-flex-col tw-items-center tw-justify-center tw-p-4 tw-text-center tw-text-gray-500">
              <UserX size={32} className="tw-mb-2" />
              <p className="tw-text-sm tw-font-medium">Aucun utilisateur trouvé.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

SearchableUserSelect.propTypes = {
  allUsers: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    fullName: PropTypes.string.isRequired,
    email: PropTypes.string
  })),
  value: PropTypes.number,
  onUserSelect: PropTypes.func.isRequired,
  label: PropTypes.string,
  placeholder: PropTypes.string,
  className: PropTypes.string,
};
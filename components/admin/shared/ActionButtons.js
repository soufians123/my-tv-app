import React from 'react';
import { FiPlus, FiDownload, FiRefreshCw, FiSettings } from 'react-icons/fi';

const ActionButtons = ({ 
  actions = [],
  className = ''
}) => {
  const getIconComponent = (iconName) => {
    const icons = {
      plus: FiPlus,
      download: FiDownload,
      refresh: FiRefreshCw,
      settings: FiSettings
    };
    return icons[iconName] || FiPlus;
  };

  const getButtonStyle = (variant) => {
    const styles = {
      primary: 'bg-blue-600 hover:bg-blue-700 text-white',
      secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
      success: 'bg-green-600 hover:bg-green-700 text-white',
      danger: 'bg-red-600 hover:bg-red-700 text-white',
      outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50'
    };
    return styles[variant] || styles.primary;
  };

  if (!actions || actions.length === 0) {
    return null;
  }

  return (
    <div className={`flex items-center space-x-3 space-x-reverse ${className}`}>
      {actions.map((action, index) => {
        const IconComponent = action.icon || getIconComponent(action.iconName);
        return (
          <button
            key={index}
            onClick={action.onClick}
            disabled={action.disabled}
            className={`
              inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors duration-200
              ${getButtonStyle(action.variant)}
            `}
            title={action.tooltip}
          >
            {IconComponent && <IconComponent className="w-4 h-4 ml-2" />}
            {action.label}
          </button>
        );
      })}
    </div>
  );
};

export default ActionButtons;
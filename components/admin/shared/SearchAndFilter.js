import React from 'react';
import { FiSearch, FiFilter } from 'react-icons/fi';

const SearchAndFilter = ({ 
  searchTerm, 
  onSearchChange, 
  filters = [], 
  onFilterChange,
  placeholder = 'البحث...',
  className = ''
}) => {
  return (
    <div className={`bg-white rounded-lg shadow mb-6 ${className}`}>
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4 md:space-x-reverse">
          {/* البحث */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="block w-full pr-10 pl-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder={placeholder}
            />
          </div>

          {/* المرشحات */}
          {filters.length > 0 && (
            <div className="flex items-center space-x-4 space-x-reverse">
              <FiFilter className="h-5 w-5 text-gray-400" />
              {filters.map((filter, index) => (
                <select
                  key={index}
                  value={filter.value}
                  onChange={(e) => onFilterChange(filter.key, e.target.value)}
                  className="block px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  {filter.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchAndFilter;
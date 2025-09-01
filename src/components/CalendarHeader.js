import React from 'react';

const CalendarHeader = ({ monthName, searchQuery, setSearchQuery, selectedCategory, setSelectedCategory, categories }) => {
  return (
    <div className="fixed top-0 left-0 right-0 bg-white shadow-lg z-10 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="relative">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 text-center transform transition-transform duration-300 ease-in-out bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            Hair Care Calendar
          </h1>
          <h2 className="text-base sm:text-lg md:text-xl text-center mt-1 text-gray-600 font-medium">
            {monthName}
          </h2>
        </div>
        
        {/* Search and Filter Bar */}
        <div className="mt-4 flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center justify-center">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search entries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent shadow-sm transition-all duration-200 hover:border-pink-300"
            />
            <svg className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent shadow-sm transition-all duration-200 hover:border-pink-300 bg-white"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default React.memo(CalendarHeader);

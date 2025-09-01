import React from 'react';
import { ChevronLeft, ChevronRight, X, Star } from 'lucide-react';

const JournalCard = ({
  selectedEntry,
  selectedEntries,
  cardIndex,
  closeJournalCard,
  navigateToEntry,
  dragOffset,
  handleTouchStart,
  handleTouchMove,
  handleTouchEnd,
  journalEntries,
  parseDate
}) => {
  const renderStars = (rating) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity duration-300">
      <div className="relative w-full max-w-lg transform transition-all duration-300 scale-95 hover:scale-100">
        <button
          onClick={closeJournalCard}
          className="absolute -top-2 -right-2 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-all duration-200 hover:scale-110 hover:rotate-90"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
        
        {/* Navigation Buttons */}
        <button
          onClick={() => navigateToEntry('prev')}
          disabled={!selectedEntry || journalEntries.findIndex(e => e.id === selectedEntry.id) === 0}
          className={`absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full p-3 shadow-lg transition-all ${
            !selectedEntry || journalEntries.findIndex(e => e.id === selectedEntry.id) === 0
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-gray-100'
          }`}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <button
          onClick={() => navigateToEntry('next')}
          disabled={!selectedEntry || journalEntries.findIndex(e => e.id === selectedEntry.id) === journalEntries.length - 1}
          className={`absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full p-3 shadow-lg transition-all ${
            !selectedEntry || journalEntries.findIndex(e => e.id === selectedEntry.id) === journalEntries.length - 1
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-gray-100'
          }`}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
        
        <div className="relative overflow-hidden">
          <div
            className="flex transition-transform duration-300 ease-out"
            style={{
              transform: `translateX(${-cardIndex * 100 + (dragOffset / window.innerWidth) * 100}%)`,
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {selectedEntries.map((entry, index) => (
              <div
                key={entry.id}
                className="flex-shrink-0 w-full bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300"
              >
                <div className="relative h-72 sm:h-80">
                  <img
                    src={entry.imgUrl}
                    alt="Hair care treatment"
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <div className="text-sm sm:text-base font-medium mb-2">
                      {new Date(parseDate(entry.date)).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                    {renderStars(entry.rating)}
                  </div>
                </div>
                <div className="p-6 sm:p-8">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {entry.categories.map((category, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-pink-100 text-pink-800 rounded-full text-sm font-medium"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                  <p className="text-gray-800 leading-relaxed">{entry.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Dots Indicator */}
        {selectedEntries.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {selectedEntries.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === cardIndex ? 'bg-pink-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        )}
        
        {/* Entry Info */}
        {selectedEntry && (
          <div className="absolute top-4 left-4 z-10 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
            {journalEntries.findIndex(e => e.id === selectedEntry.id) + 1} of {journalEntries.length}
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(JournalCard);

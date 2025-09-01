import React from 'react';
import { Star } from 'lucide-react';

const CalendarDay = ({ day, entries, openJournalCard }) => {
  const hasEntries = entries.length > 0;

  return (
    <div
      className={`min-h-[80px] sm:min-h-[120px] md:min-h-[140px] relative cursor-pointer transition-all duration-300 ${
        hasEntries 
          ? 'bg-gradient-to-br from-pink-50/90 to-purple-50/90 hover:from-pink-100 hover:to-purple-100 shadow-sm hover:shadow-md border border-pink-200/50' 
          : 'bg-white hover:bg-gray-50/80 border border-gray-100'
      } flex flex-col rounded-xl transform hover:scale-[1.03] hover:z-20 group`}
      onClick={() => hasEntries && openJournalCard(entries, 0)}
    >
      {/* Day number with circle background on hover */}
      <div className={`absolute top-2 left-2 z-10 w-6 h-6 flex items-center justify-center rounded-full transition-all duration-300 ${
        hasEntries 
          ? 'bg-white/80 group-hover:bg-pink-100' 
          : 'bg-transparent group-hover:bg-gray-100'
      }`}>
        <span className={`text-sm font-semibold ${
          hasEntries ? 'text-pink-900' : 'text-gray-700'
        }`}>
          {day}
        </span>
      </div>

      {/* Entry content */}
      {hasEntries && (
        <div className="flex-1 flex flex-col justify-center items-center p-1">
          <div 
            className="relative w-full h-full rounded-lg overflow-hidden shadow-sm group-hover:shadow-md transition-all duration-300"
          >
            {/* Image with gradient overlay */}
            <div className="absolute inset-0">
              <img
                src={entries[0].imgUrl}
                alt="Hair care treatment"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                loading="lazy"
                onError={(e) => {
                  e.target.src = 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
            </div>

            {/* Rating stars (show only on larger screens) */}
            <div className="absolute top-2 right-2 hidden sm:flex space-x-0.5">
              {[...Array(Math.round(entries[0].rating))].map((_, i) => (
                <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
              ))}
            </div>

            {/* Multiple entries indicator */}
            {entries.length > 1 && (
              <div className="absolute bottom-2 right-2 bg-pink-500 text-white text-xs px-2 py-0.5 rounded-full font-medium backdrop-blur-sm">
                +{entries.length - 1}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(CalendarDay);

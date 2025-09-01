import React from 'react';
import CalendarDay from './CalendarDay';

const CalendarMonth = ({ year, month, journalEntries, filterEntries, openJournalCard }) => {
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const formatDate = (year, month, day) => {
    return `${String(day).padStart(2, '0')}/${String(month + 1).padStart(2, '0')}/${year}`;
  };

  const getEntriesForDate = (year, month, day) => {
    const dateStr = formatDate(year, month, day);
    const entriesForDate = journalEntries.filter(entry => entry.date === dateStr);
    return filterEntries(entriesForDate);
  };

  const renderMonth = () => {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const monthName = new Date(year, month).toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });

    const days = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 md:h-32"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const entries = getEntriesForDate(year, month, day);
      days.push(
        <CalendarDay
          key={day}
          day={day}
          entries={entries}
          openJournalCard={openJournalCard}
        />
      );
    }

    return (
      <div className="mb-12">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden transform transition-all duration-300 hover:shadow-xl">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-pink-50 to-purple-50">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 text-center">{monthName}</h3>
          </div>
          <div className="p-6">
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-2 sm:gap-4 mb-4 border-b border-gray-100 pb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center font-medium text-gray-600 py-2 hidden sm:block">
                  <span className="text-sm tracking-wide">{day}</span>
                </div>
              ))}
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                <div key={day} className="text-center font-medium text-gray-600 py-2 sm:hidden">
                  <span className="text-xs tracking-wide">{day}</span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2 sm:gap-4">
              {days}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return renderMonth();
};

export default React.memo(CalendarMonth);

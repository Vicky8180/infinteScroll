import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { ChevronLeft, ChevronRight, X, Star } from 'lucide-react';

const InfiniteScrollableCalendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [journalEntries, setJournalEntries] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [selectedEntries, setSelectedEntries] = useState([]);
  const [cardIndex, setCardIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  
  const scrollContainerRef = useRef(null);
  const monthRefs = useRef({});
  const cardRef = useRef(null);

  // Hair care journal data
  const hairCareJournalData = [
    {
      id: 1,
      imgUrl: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg",
      rating: 4.8,
      categories: [
        "Deep Conditioning",
        "Moisture",
        "Hair Growth",
        "Natural Products"
      ],
      date: "05/08/2025",
      description: "Finally tried the coconut oil deep conditioning treatment. My hair feels incredibly soft and manageable. Noticed significantly less breakage during combing."
    },
    {
      id: 2,
      imgUrl: "https://images.pexels.com/photos/33669506/pexels-photo-33669506.jpeg",
      rating: 3.5,
      categories: ["Protein Treatment", "Hair Repair", "Salon Visit"],
      date: "12/08/2025",
      description: "Protein treatment at the salon. Hair feels a bit stiff - might have been too much protein. Need to balance with more moisture next time."
    },
    {
      id: 3,
      imgUrl: "https://images.pexels.com/photos/33653029/pexels-photo-33653029.jpeg",
      rating: 4.5,
      categories: ["Protective Style", "Braids", "Scalp Care"],
      date: "20/08/2025",
      description: "Got box braids installed. Used tea tree oil on scalp before installation. Feeling confident about this protective style for the next few weeks."
    },
    {
      id: 4,
      imgUrl: "https://images.pexels.com/photos/33659051/pexels-photo-33659051.png",
      rating: 4.2,
      categories: ["Hair Mask", "DIY Treatment", "Hydration"],
      date: "28/08/2025",
      description: "Made a DIY avocado and honey hair mask. Hair feels incredibly nourished. Will definitely repeat this treatment next month."
    },
    {
      id: 5,
      imgUrl: "https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg",
      rating: 5.0,
      categories: ["New Product", "Leave-in Conditioner", "Curl Definition"],
      date: "03/09/2025",
      description: "Tried the new curl-defining leave-in conditioner. Amazing results! Perfect curl definition without any crunch. Found my holy grail product!"
    },
    {
      id: 6,
      imgUrl: "https://images.pexels.com/photos/33699867/pexels-photo-33699867.jpeg",
      rating: 3.8,
      categories: ["Trim", "Hair Health", "Split Ends"],
      date: "10/09/2025",
      description: "Got a much-needed trim today. Removed about an inch of damaged ends. Hair looks healthier but shorter than expected."
    },
    {
      id: 7,
      imgUrl: "https://images.pexels.com/photos/33703919/pexels-photo-33703919.jpeg",
      rating: 4.6,
      categories: ["Oil Treatment", "Scalp Massage", "Growth"],
      date: "15/09/2025",
      description: "Weekly scalp massage with rosemary oil blend. Starting to notice new growth at temples. Consistent routine is paying off!"
    },
    {
      id: 8,
      imgUrl: "https://images.pexels.com/photos/33681810/pexels-photo-33681810.jpeg",
      rating: 4.0,
      categories: ["Wash Day", "Detangling", "Deep Clean"],
      date: "20/09/2025",
      description: "Thorough wash day with clarifying shampoo. Took time to properly section and detangle. Hair feels clean and refreshed."
    }
  ];

  useEffect(() => {
    setJournalEntries(hairCareJournalData);
  }, []);

  // Generate months for infinite scrolling
  const generateMonths = useCallback(() => {
    const months = [];
    const startYear = new Date().getFullYear() - 2;
    const endYear = new Date().getFullYear() + 2;
    
    for (let year = startYear; year <= endYear; year++) {
      for (let month = 0; month < 12; month++) {
        months.push({ year, month });
      }
    }
    return months;
  }, []);

  const months = useMemo(() => generateMonths(), [generateMonths]);

  // Get days in month
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Get first day of month (0 = Sunday, 1 = Monday, etc.)
  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  // Parse date from DD/MM/YYYY format
  const parseDate = (dateStr) => {
    const [day, month, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day);
  };

  // Format date for comparison
  const formatDate = (year, month, day) => {
    return `${String(day).padStart(2, '0')}/${String(month + 1).padStart(2, '0')}/${year}`;
  };

  // Get journal entries for a specific date
  const getEntriesForDate = (year, month, day) => {
    const dateStr = formatDate(year, month, day);
    return journalEntries.filter(entry => entry.date === dateStr);
  };

  // Handle scroll to update current month
  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return;

    const scrollTop = scrollContainerRef.current.scrollTop;
    const containerHeight = scrollContainerRef.current.clientHeight;
    const midPoint = scrollTop + containerHeight / 2;

    let maxVisibility = 0;
    let mostVisibleMonth = { year: currentYear, month: currentMonth };

    Object.entries(monthRefs.current).forEach(([key, element]) => {
      if (!element) return;
      
      const rect = element.getBoundingClientRect();
      const containerRect = scrollContainerRef.current.getBoundingClientRect();
      
      const elementTop = rect.top - containerRect.top + scrollTop;
      const elementBottom = elementTop + rect.height;
      
      const visibleTop = Math.max(elementTop, scrollTop);
      const visibleBottom = Math.min(elementBottom, scrollTop + containerHeight);
      const visibility = Math.max(0, visibleBottom - visibleTop);
      
      if (visibility > maxVisibility) {
        maxVisibility = visibility;
        const [year, month] = key.split('-').map(Number);
        mostVisibleMonth = { year, month };
      }
    });

    if (mostVisibleMonth.year !== currentYear || mostVisibleMonth.month !== currentMonth) {
      setCurrentYear(mostVisibleMonth.year);
      setCurrentMonth(mostVisibleMonth.month);
    }
  }, [currentYear, currentMonth]);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  // Render calendar grid for a month
  const renderMonth = (year, month) => {
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
      const hasEntries = entries.length > 0;
      
      days.push(
        <div
          key={day}
          className={`h-24 md:h-32 border border-gray-200 p-1 relative cursor-pointer transition-all duration-200 ${
            hasEntries ? 'bg-pink-50 hover:bg-pink-100 border-pink-200' : 'hover:bg-gray-50'
          } flex flex-col`}
          onClick={() => hasEntries && openJournalCard(entries, 0)}
          style={{ overflow: 'hidden' }}
        >
          <div className={`text-xs font-medium mb-1 ${hasEntries ? 'text-pink-900' : 'text-gray-900'}`}>
            {day}
          </div>
          {hasEntries && (
            <div className="flex-1 flex flex-col justify-center items-center">
              {entries.slice(0, 1).map((entry, index) => (
                <div key={entry.id} className="relative flex-1 w-full h-full flex items-center justify-center" style={{ overflow: 'hidden', minHeight: '60px', minWidth: '100%' }}>
                  <img
                    src={entry.imgUrl}
                    alt="Hair care treatment"
                    className="w-full h-full object-cover rounded-sm shadow-sm"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    onError={(e) => {
                      e.target.src = 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg';
                    }}
                  />
                  {entries.length > 1 && (
                    <div className="absolute bottom-0 right-0 bg-pink-600 text-white text-xs px-1 rounded-tl-sm font-medium">
                      +{entries.length - 1}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <div
        key={`${year}-${month}`}
        ref={el => monthRefs.current[`${year}-${month}`] = el}
        className="mb-8"
      >
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">{monthName}</h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {days}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Open journal card modal
  const openJournalCard = (entries, initialIndex = 0) => {
    // Get all entries from the same date
    setSelectedEntries(entries);
    setSelectedEntry(entries[initialIndex]);
    setCardIndex(initialIndex);
  };

  // Close journal card modal
  const closeJournalCard = () => {
    setSelectedEntry(null);
    setSelectedEntries([]);
    setCardIndex(0);
    setDragOffset(0);
  };

  // Navigate to adjacent entries (by date, not just same day)
  const getAdjacentEntry = (direction) => {
    const currentEntry = selectedEntry;
    const currentIndex = journalEntries.findIndex(entry => entry.id === currentEntry.id);
    
    if (direction === 'next' && currentIndex < journalEntries.length - 1) {
      return journalEntries[currentIndex + 1];
    } else if (direction === 'prev' && currentIndex > 0) {
      return journalEntries[currentIndex - 1];
    }
    return null;
  };

  // Navigate to next/prev entry globally
  const navigateToEntry = (direction) => {
    const nextEntry = getAdjacentEntry(direction);
    if (nextEntry) {
      setSelectedEntry(nextEntry);
      setSelectedEntries([nextEntry]);
      setCardIndex(0);
    }
  };

  // Handle touch events for swiping
  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const currentTouch = e.touches[0].clientX;
    const diff = touchStart - currentTouch;
    setDragOffset(-diff);
  };

  const handleTouchEnd = (e) => {
    if (!isDragging) return;
    setTouchEnd(e.changedTouches[0].clientX);
    setIsDragging(false);
    
    const swipeThreshold = 50;
    const diff = touchStart - e.changedTouches[0].clientX;
    
    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0 && cardIndex < selectedEntries.length - 1) {
        setCardIndex(cardIndex + 1);
        setSelectedEntry(selectedEntries[cardIndex + 1]);
      } else if (diff < 0 && cardIndex > 0) {
        setCardIndex(cardIndex - 1);
        setSelectedEntry(selectedEntries[cardIndex - 1]);
      }
    }
    
    setDragOffset(0);
  };

  // Navigate cards with buttons (within same date)
  const nextCard = () => {
    if (cardIndex < selectedEntries.length - 1) {
      setCardIndex(cardIndex + 1);
      setSelectedEntry(selectedEntries[cardIndex + 1]);
    }
  };

  const prevCard = () => {
    if (cardIndex > 0) {
      setCardIndex(cardIndex - 1);
      setSelectedEntry(selectedEntries[cardIndex - 1]);
    }
  };

  // Render star rating
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

  const monthName = new Date(currentYear, currentMonth).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 bg-white shadow-sm z-10 transition-all duration-300">
        <div className="px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900 text-center">
            Hair Care Calendar - {monthName}
          </h1>
        </div>
      </div>

      {/* Calendar Container */}
      <div
        ref={scrollContainerRef}
        className="pt-20 pb-8 px-4 h-screen overflow-y-auto scroll-smooth"
        style={{ scrollBehavior: 'smooth' }}
      >
        <div className="max-w-4xl mx-auto">
          {months.map(({ year, month }) => renderMonth(year, month))}
        </div>
      </div>

      {/* Journal Card Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-md">
            <button
              onClick={closeJournalCard}
              className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            {/* Global Navigation Buttons */}
            <button
              onClick={() => navigateToEntry('prev')}
              disabled={!getAdjacentEntry('prev')}
              className={`absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full p-3 shadow-lg transition-all ${
                !getAdjacentEntry('prev')
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-gray-100'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => navigateToEntry('next')}
              disabled={!getAdjacentEntry('next')}
              className={`absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full p-3 shadow-lg transition-all ${
                !getAdjacentEntry('next')
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-gray-100'
              }`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            
            <div className="relative overflow-hidden">
              <div
                ref={cardRef}
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
                    className="flex-shrink-0 w-full bg-white rounded-lg shadow-xl overflow-hidden"
                  >
                    <div className="relative h-64">
                      <img
                        src={entry.imgUrl}
                        alt="Hair care treatment"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg';
                        }}
                      />
                    </div>
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-sm text-gray-600">
                          {new Date(parseDate(entry.date)).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                        {renderStars(entry.rating)}
                      </div>
                      
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
                      
                      <p className="text-gray-800 leading-relaxed">
                        {entry.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Same-Date Navigation (only show if multiple entries on same date) */}
            {selectedEntries.length > 1 && (
              <>
                {/* Dots Indicator */}
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
              </>
            )}
            
            {/* Entry Info */}
            <div className="absolute top-4 left-4 z-10 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
              {journalEntries.findIndex(e => e.id === selectedEntry.id) + 1} of {journalEntries.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InfiniteScrollableCalendar;
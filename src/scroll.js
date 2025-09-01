import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { ChevronLeft, ChevronRight, X, Star } from 'lucide-react';
import { parseDate } from './components/utils';

const InfiniteScrollableCalendar = () => {
  // State for calendar navigation and display
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  
  // State for journal entries and filtering
  const [journalEntries, setJournalEntries] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  
  // State for journal card modal
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [selectedEntries, setSelectedEntries] = useState([]);
  const [cardIndex, setCardIndex] = useState(0);
  
  // State for touch interactions
  const [touchStart, setTouchStart] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Refs
  const scrollContainerRef = useRef(null);
  const monthRefs = useRef({});

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

  // Memoized values
  const calendarMonths = useMemo(() => {
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

  const monthName = useMemo(() => {
    return new Date(currentYear, currentMonth).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  }, [currentYear, currentMonth]);

  // Load journal entries
  useEffect(() => {
    const loadEntries = async () => {
      try {
        setIsLoading(true);
        const savedEntries = localStorage.getItem('journalEntries');
        if (savedEntries) {
          setJournalEntries(JSON.parse(savedEntries));
        } else {
          setJournalEntries(hairCareJournalData);
          localStorage.setItem('journalEntries', JSON.stringify(hairCareJournalData));
        }
      } catch (err) {
        setError('Failed to load journal entries. Please try refreshing the page.');
        console.error('Error loading entries:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadEntries();
  }, [hairCareJournalData]);

  // Handle scroll to update current month
  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return;

    const scrollTop = scrollContainerRef.current.scrollTop;
    const containerHeight = scrollContainerRef.current.clientHeight;

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

  // Set up scroll listener
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (scrollContainerRef.current) {
        const monthsInView = Math.floor(scrollContainerRef.current.clientHeight / 400) || 1;
        const scrollAmount = 400 * monthsInView;

        if (e.key === 'ArrowUp') {
          scrollContainerRef.current.scrollBy({ top: -scrollAmount, behavior: 'smooth' });
        } else if (e.key === 'ArrowDown') {
          scrollContainerRef.current.scrollBy({ top: scrollAmount, behavior: 'smooth' });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Touch handlers
  const handleTouchStart = useCallback((e) => {
    setTouchStart(e.touches[0].clientX);
    setIsDragging(true);
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!isDragging) return;
    const currentTouch = e.touches[0].clientX;
    const diff = touchStart - currentTouch;
    setDragOffset(-diff);
  }, [isDragging, touchStart]);

  const handleTouchEnd = useCallback((e) => {
    if (!isDragging) return;
    const swipeThreshold = 50;
    const diff = touchStart - e.changedTouches[0].clientX;
    
    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0 && cardIndex < selectedEntries.length - 1) {
        setCardIndex(prev => prev + 1);
        setSelectedEntry(selectedEntries[cardIndex + 1]);
      } else if (diff < 0 && cardIndex > 0) {
        setCardIndex(prev => prev - 1);
        setSelectedEntry(selectedEntries[cardIndex - 1]);
      }
    }
    
    setIsDragging(false);
    setDragOffset(0);
  }, [isDragging, touchStart, cardIndex, selectedEntries]);

  // Navigation handlers
  const navigateToEntry = useCallback((direction) => {
    const currentEntry = selectedEntry;
    const currentIndex = journalEntries.findIndex(entry => entry.id === currentEntry.id);
    
    if (direction === 'next' && currentIndex < journalEntries.length - 1) {
      const nextEntry = journalEntries[currentIndex + 1];
      setSelectedEntry(nextEntry);
      setSelectedEntries([nextEntry]);
      setCardIndex(0);
    } else if (direction === 'prev' && currentIndex > 0) {
      const prevEntry = journalEntries[currentIndex - 1];
      setSelectedEntry(prevEntry);
      setSelectedEntries([prevEntry]);
      setCardIndex(0);
    }
  }, [selectedEntry, journalEntries]);

  const closeJournalCard = useCallback(() => {
    setSelectedEntry(null);
    setSelectedEntries([]);
    setCardIndex(0);
    setDragOffset(0);
  }, []);

  // Get entries for a date
  const getEntriesForDate = useCallback((year, month, day) => {
    const dateStr = `${String(day).padStart(2, '0')}/${String(month + 1).padStart(2, '0')}/${year}`;
    return journalEntries.filter(entry => entry.date === dateStr);
  }, [journalEntries]);

  // Render star rating
  const renderStars = (rating) => (
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-red-600 text-xl mb-4">Error</h2>
          <p className="text-gray-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {isLoading && (
        <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
        </div>
      )}

      {/* Fixed Header */}
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
              {Array.from(new Set(journalEntries.flatMap(entry => entry.categories))).map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Calendar Container */}
      <div
        ref={scrollContainerRef}
        className="pt-36 sm:pt-32 pb-8 px-4 sm:px-6 lg:px-8 h-screen overflow-y-auto scroll-smooth"
        style={{ scrollBehavior: 'smooth' }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="space-y-12">
            {calendarMonths.map(({ year, month }) => (
              <div
                key={`${year}-${month}`}
                ref={el => monthRefs.current[`${year}-${month}`] = el}
                className="mb-12"
              >
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden transform transition-all duration-300 hover:shadow-xl">
                  <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-pink-50 to-purple-50">
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 text-center">
                      {new Date(year, month).toLocaleDateString('en-US', { 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </h3>
                  </div>
                  <div className="p-6">
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
                      {Array(new Date(year, month, 1).getDay()).fill(null).map((_, i) => (
                        <div key={`empty-${i}`} className="h-24 md:h-32" />
                      ))}
                      {Array(new Date(year, month + 1, 0).getDate()).fill(null).map((_, i) => {
                        const day = i + 1;
                        const entries = getEntriesForDate(year, month, day);
                        const hasEntries = entries.length > 0;
                        
                        return (
                          <div
                            key={day}
                            className={`min-h-[80px] sm:min-h-[120px] md:min-h-[140px] relative cursor-pointer transition-all duration-300 ${
                              hasEntries 
                                ? 'bg-gradient-to-br from-pink-50/90 to-purple-50/90 hover:from-pink-100 hover:to-purple-100 shadow-sm hover:shadow-md border border-pink-200/50' 
                                : 'bg-white hover:bg-gray-50/80 border border-gray-100'
                            } flex flex-col rounded-xl transform hover:scale-[1.03] hover:z-20 group`}
                            onClick={() => hasEntries && (() => {
                              setSelectedEntries(entries);
                              setSelectedEntry(entries[0]);
                              setCardIndex(0);
                            })()}
                          >
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

                            {hasEntries && (
                              <div className="flex-1 flex flex-col justify-center items-center p-1">
                                <div className="relative w-full h-full rounded-lg overflow-hidden shadow-sm group-hover:shadow-md transition-all duration-300">
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

                                  <div className="absolute top-2 right-2 hidden sm:flex space-x-0.5">
                                    {renderStars(entries[0].rating)}
                                  </div>

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
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Journal Card Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity duration-300">
          <div className="relative w-full max-w-lg transform transition-all duration-300 scale-95 hover:scale-100">
            <button
              onClick={closeJournalCard}
              className="absolute -top-2 -right-2 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-all duration-200 hover:scale-110 hover:rotate-90"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
            
            <button
              onClick={() => navigateToEntry('prev')}
              disabled={journalEntries.findIndex(e => e.id === selectedEntry.id) === 0}
              className={`absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full p-3 shadow-lg transition-all ${
                journalEntries.findIndex(e => e.id === selectedEntry.id) === 0
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-gray-100'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => navigateToEntry('next')}
              disabled={journalEntries.findIndex(e => e.id === selectedEntry.id) === journalEntries.length - 1}
              className={`absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full p-3 shadow-lg transition-all ${
                journalEntries.findIndex(e => e.id === selectedEntry.id) === journalEntries.length - 1
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
                {selectedEntries.map((entry) => (
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
                      
                      <p className="text-gray-800 leading-relaxed">
                        {entry.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
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
            
            <div className="absolute top-4 left-4 z-10 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
              {journalEntries.findIndex(e => e.id === selectedEntry.id) + 1} of {journalEntries.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(InfiniteScrollableCalendar);

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import CalendarHeader from './components/CalendarHeader';
import CalendarMonth from './components/CalendarMonth';
import JournalCard from './components/JournalCard';
import { parseDate, generateMonths, filterEntries, getAllCategories, getAdjacentEntry } from './components/utils';

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
    const loadEntries = async () => {
      try {
        setIsLoading(true);
        // Try to load journal entries from localStorage first
        const savedEntries = localStorage.getItem('journalEntries');
        if (savedEntries) {
          setJournalEntries(JSON.parse(savedEntries));
        } else {
          // If no saved entries exist, use the default data
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
  }, []);

  // Add keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      const monthsInView = Math.floor(scrollContainerRef.current?.clientHeight / 400) || 1;
      const scrollAmount = 400 * monthsInView; // Approximate height of a month

      if (e.key === 'ArrowUp') {
        scrollContainerRef.current?.scrollBy({ top: -scrollAmount, behavior: 'smooth' });
      } else if (e.key === 'ArrowDown') {
        scrollContainerRef.current?.scrollBy({ top: scrollAmount, behavior: 'smooth' });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Generate months for infinite scrolling
  const calendarMonths = useMemo(() => generateMonths(), []);

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

  // Filter journal entries based on search query and category
  const filterEntries = useCallback((entries) => {
    return entries.filter(entry => {
      const matchesSearch = searchQuery === '' || 
        entry.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.categories.some(cat => cat.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === '' || 
        entry.categories.includes(selectedCategory);
      
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  // Get journal entries for a specific date
  const getEntriesForDate = (year, month, day) => {
    const dateStr = formatDate(year, month, day);
    const entriesForDate = journalEntries.filter(entry => entry.date === dateStr);
    return filterEntries(entriesForDate);
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
              {entries.slice(0, 1).map((entry) => (
                <div 
                  key={entry.id} 
                  className="relative w-full h-full rounded-lg overflow-hidden shadow-sm group-hover:shadow-md transition-all duration-300"
                >
                  {/* Image with gradient overlay */}
                  <div className="absolute inset-0">
                    <img
                      src={entry.imgUrl}
                      alt="Hair care treatment"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
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
        className="mb-12"
      >
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden transform transition-all duration-300 hover:shadow-xl">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-pink-50 to-purple-50">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 text-center">{monthName}</h3>
          </div>
          <div className="p-6">
            {/* Day headers with gradient bottom border */}
            <div className="grid grid-cols-7 gap-2 sm:gap-4 mb-4 border-b border-gray-100 pb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center font-medium text-gray-600 py-2 hidden sm:block">
                  <span className="text-sm tracking-wide">{day}</span>
                </div>
              ))}
              {/* Mobile day headers */}
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

  // Add a new journal entry
  const addJournalEntry = (newEntry) => {
    const updatedEntries = [...journalEntries, { ...newEntry, id: Date.now() }];
    setJournalEntries(updatedEntries);
    localStorage.setItem('journalEntries', JSON.stringify(updatedEntries));
  };

  // Edit an existing journal entry
  const editJournalEntry = (id, updatedEntry) => {
    const updatedEntries = journalEntries.map(entry =>
      entry.id === id ? { ...entry, ...updatedEntry } : entry
    );
    setJournalEntries(updatedEntries);
    localStorage.setItem('journalEntries', JSON.stringify(updatedEntries));
  };

  // Delete a journal entry
  const deleteJournalEntry = (id) => {
    const updatedEntries = journalEntries.filter(entry => entry.id !== id);
    setJournalEntries(updatedEntries);
    localStorage.setItem('journalEntries', JSON.stringify(updatedEntries));
    closeJournalCard(); // Close the modal if deleting the current entry
  };

  const monthName = new Date(currentYear, currentMonth).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

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

  // Memoized values
  const months = useMemo(() => generateMonths(), []);
  const categories = useMemo(() => getAllCategories(journalEntries), [journalEntries]);
  
  // Memoized filter function
  const filteredEntries = useCallback((entries) => {
    return filterEntries(entries, searchQuery, selectedCategory);
  }, [searchQuery, selectedCategory]);

  const monthName = new Date(currentYear, currentMonth).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  // Handle touch events
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

  const navigateToEntry = useCallback((direction) => {
    const nextEntry = getAdjacentEntry(direction, selectedEntry, journalEntries);
    if (nextEntry) {
      setSelectedEntry(nextEntry);
      setSelectedEntries([nextEntry]);
      setCardIndex(0);
    }
  }, [selectedEntry, journalEntries]);

  const closeJournalCard = useCallback(() => {
    setSelectedEntry(null);
    setSelectedEntries([]);
    setCardIndex(0);
    setDragOffset(0);
  }, []);

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

      <CalendarHeader
        monthName={monthName}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        categories={categories}
      />

      <div
        ref={scrollContainerRef}
        className="pt-36 sm:pt-32 pb-8 px-4 sm:px-6 lg:px-8 h-screen overflow-y-auto scroll-smooth"
        style={{ scrollBehavior: 'smooth' }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="space-y-12">
            {months.map(({ year, month }) => (
              <CalendarMonth
                key={`${year}-${month}`}
                year={year}
                month={month}
                journalEntries={journalEntries}
                filterEntries={filteredEntries}
                openJournalCard={(entries, index) => {
                  setSelectedEntries(entries);
                  setSelectedEntry(entries[index]);
                  setCardIndex(index);
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {selectedEntry && (
        <JournalCard
          selectedEntry={selectedEntry}
          selectedEntries={selectedEntries}
          cardIndex={cardIndex}
          closeJournalCard={closeJournalCard}
          navigateToEntry={navigateToEntry}
          dragOffset={dragOffset}
          handleTouchStart={handleTouchStart}
          handleTouchMove={handleTouchMove}
          handleTouchEnd={handleTouchEnd}
          journalEntries={journalEntries}
          parseDate={parseDate}
        />
      )}
    </div>
  );
};

export default InfiniteScrollableCalendar;
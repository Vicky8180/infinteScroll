import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { ChevronLeft, ChevronRight, X, Star } from 'lucide-react';
import { parseDate } from './components/utils';

// Throttle function for scroll performance
const throttle = (func, delay) => {
  let timeoutId;
  let lastExecTime = 0;
  return (...args) => {
    const currentTime = Date.now();
    
    if (currentTime - lastExecTime > delay) {
      func(...args);
      lastExecTime = currentTime;
    } else {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func(...args);
        lastExecTime = Date.now();
      }, delay - (currentTime - lastExecTime));
    }
  };
};

// Debounce function for search input
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

const InfiniteScrollableCalendar = () => {
  // State for calendar navigation and display
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  
  // State for journal entries and filtering
  const [journalEntries, setJournalEntries] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [filteredEntries, setFilteredEntries] = useState([]);
  
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
  
  // Performance optimization states
  const [visibleMonths, setVisibleMonths] = useState(new Set());
  const [scrollDirection, setScrollDirection] = useState('down');
  const lastScrollTop = useRef(0);
  
  // Refs
  const scrollContainerRef = useRef(null);
  const monthRefs = useRef({});
  const isScrolling = useRef(false);
  const scrollTimeout = useRef(null);

  // Hair care journal data - moved outside component for better performance
  const hairCareJournalData = useMemo(() => [
    {
      id: 1,
      imgUrl: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg",
      rating: 4.8,
      categories: ["Deep Conditioning", "Moisture", "Hair Growth", "Natural Products"],
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
  ], []);

  // Memoized calendar months with reduced range for better performance
  const calendarMonths = useMemo(() => {
    const months = [];
    const startYear = new Date().getFullYear() - 1;
    const endYear = new Date().getFullYear() + 1;
    
    for (let year = startYear; year <= endYear; year++) {
      for (let month = 0; month < 12; month++) {
        months.push({ year, month });
      }
    }
    return months;
  }, []);

  // Memoized month name
  const monthName = useMemo(() => {
    return new Date(currentYear, currentMonth).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  }, [currentYear, currentMonth]);

  // Memoized categories for better performance
  const categories = useMemo(() => {
    return Array.from(new Set(filteredEntries.flatMap(entry => entry.categories)));
  }, [filteredEntries]);

  // Optimized entry filtering with debouncing
  const filterEntries = useMemo(() => {
    return debounce((entries, query, category) => {
      const filtered = entries.filter(entry => {
        const matchesSearch = query === '' || 
          entry.description.toLowerCase().includes(query.toLowerCase()) ||
          entry.categories.some(cat => cat.toLowerCase().includes(query.toLowerCase()));
        
        const matchesCategory = category === '' || entry.categories.includes(category);
        
        return matchesSearch && matchesCategory;
      });
      setFilteredEntries(filtered);
    }, 300);
  }, []);

  // Apply filters when dependencies change
  useEffect(() => {
    filterEntries(journalEntries, searchQuery, selectedCategory);
  }, [journalEntries, searchQuery, selectedCategory, filterEntries]);

  // Load journal entries
  useEffect(() => {
    const loadEntries = async () => {
      try {
        setIsLoading(true);
        const savedEntries = localStorage.getItem('journalEntries');
        if (savedEntries) {
          const entries = JSON.parse(savedEntries);
          setJournalEntries(entries);
          setFilteredEntries(entries);
        } else {
          setJournalEntries(hairCareJournalData);
          setFilteredEntries(hairCareJournalData);
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

  // Optimized scroll handler with better performance
  const handleScroll = useCallback(
    throttle(() => {
      if (!scrollContainerRef.current) return;

      const scrollTop = scrollContainerRef.current.scrollTop;
      const containerHeight = scrollContainerRef.current.clientHeight;
      const scrollHeight = scrollContainerRef.current.scrollHeight;

      // Determine scroll direction
      const direction = scrollTop > lastScrollTop.current ? 'down' : 'up';
      if (direction !== scrollDirection) {
        setScrollDirection(direction);
      }
      lastScrollTop.current = scrollTop;

      // Set scrolling state
      isScrolling.current = true;
      clearTimeout(scrollTimeout.current);
      scrollTimeout.current = setTimeout(() => {
        isScrolling.current = false;
      }, 150);

      // Only calculate visibility for months near the viewport
      const buffer = containerHeight * 0.5; // 50% buffer
      const visibleTop = scrollTop - buffer;
      const visibleBottom = scrollTop + containerHeight + buffer;

      let maxVisibility = 0;
      let mostVisibleMonth = { year: currentYear, month: currentMonth };
      const newVisibleMonths = new Set();

      // Use requestAnimationFrame for smooth calculations
      requestAnimationFrame(() => {
        Object.entries(monthRefs.current).forEach(([key, element]) => {
          if (!element) return;
          
          const rect = element.getBoundingClientRect();
          const containerRect = scrollContainerRef.current.getBoundingClientRect();
          const elementTop = rect.top - containerRect.top + scrollTop;
          const elementBottom = elementTop + rect.height;
          
          // Check if month is in visible area
          if (elementBottom > visibleTop && elementTop < visibleBottom) {
            newVisibleMonths.add(key);
            
            const visibleStart = Math.max(elementTop, scrollTop);
            const visibleEnd = Math.min(elementBottom, scrollTop + containerHeight);
            const visibility = Math.max(0, visibleEnd - visibleStart);
            
            if (visibility > maxVisibility) {
              maxVisibility = visibility;
              const [year, month] = key.split('-').map(Number);
              mostVisibleMonth = { year, month };
            }
          }
        });

        // Only update state if there's a significant change
        if (newVisibleMonths.size !== visibleMonths.size || 
            !Array.from(newVisibleMonths).every(month => visibleMonths.has(month))) {
          setVisibleMonths(newVisibleMonths);
        }

        if (mostVisibleMonth.year !== currentYear || mostVisibleMonth.month !== currentMonth) {
          setCurrentYear(mostVisibleMonth.year);
          setCurrentMonth(mostVisibleMonth.month);
        }
      });
    }, 16), // ~60fps throttling
    [currentYear, currentMonth, scrollDirection, visibleMonths]
  );

  // Set up optimized scroll listener
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  // Optimized keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isScrolling.current || !scrollContainerRef.current) return;

      const monthsInView = Math.floor(scrollContainerRef.current.clientHeight / 400) || 1;
      const scrollAmount = 400 * monthsInView;

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        scrollContainerRef.current.scrollBy({ top: -scrollAmount, behavior: 'smooth' });
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        scrollContainerRef.current.scrollBy({ top: scrollAmount, behavior: 'smooth' });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Optimized touch handlers
  const handleTouchStart = useCallback((e) => {
    e.preventDefault();
    setTouchStart(e.touches[0].clientX);
    setIsDragging(true);
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!isDragging) return;
    e.preventDefault();
    const currentTouch = e.touches[0].clientX;
    const diff = touchStart - currentTouch;
    setDragOffset(-diff);
  }, [isDragging, touchStart]);

  const handleTouchEnd = useCallback((e) => {
    if (!isDragging) return;
    e.preventDefault();
    
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
    const currentIndex = filteredEntries.findIndex(entry => entry.id === currentEntry.id);
    
    if (direction === 'next' && currentIndex < filteredEntries.length - 1) {
      const nextEntry = filteredEntries[currentIndex + 1];
      setSelectedEntry(nextEntry);
      setSelectedEntries([nextEntry]);
      setCardIndex(0);
    } else if (direction === 'prev' && currentIndex > 0) {
      const prevEntry = filteredEntries[currentIndex - 1];
      setSelectedEntry(prevEntry);
      setSelectedEntries([prevEntry]);
      setCardIndex(0);
    }
  }, [selectedEntry, filteredEntries]);

  const closeJournalCard = useCallback(() => {
    setSelectedEntry(null);
    setSelectedEntries([]);
    setCardIndex(0);
    setDragOffset(0);
  }, []);

  // Optimized entry lookup with memoization
  const getEntriesForDate = useCallback((year, month, day) => {
    const dateStr = `${String(day).padStart(2, '0')}/${String(month + 1).padStart(2, '0')}/${year}`;
    return filteredEntries.filter(entry => entry.date === dateStr);
  }, [filteredEntries]);

  // Open journal card handler
  const openJournalCard = useCallback((entries, index = 0) => {
    setSelectedEntries(entries);
    setSelectedEntry(entries[index]);
    setCardIndex(index);
  }, []);

  // Optimized star rating component
  const StarRating = React.memo(({ rating }) => (
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
  ));

  // Optimized Calendar Day component
  const CalendarDay = React.memo(({ day, entries, year, month }) => {
    const hasEntries = entries.length > 0;

    return (
      <div
        className={`calendar-day ${hasEntries ? 'has-entries' : ''}`}
        onClick={() => hasEntries && openJournalCard(entries, 0)}
        style={{
          minHeight: '80px',
          position: 'relative',
          cursor: hasEntries ? 'pointer' : 'default',
          backgroundColor: hasEntries ? '#fdf2f8' : '#ffffff',
          border: hasEntries ? '1px solid #f9a8d4' : '1px solid #e5e7eb',
          borderRadius: '12px',
          transition: 'all 0.2s ease-in-out',
          willChange: 'transform',
        }}
      >
        <div 
          className="day-number"
          style={{
            position: 'absolute',
            top: '8px',
            left: '8px',
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            backgroundColor: hasEntries ? 'rgba(255, 255, 255, 0.8)' : 'transparent',
            fontSize: '14px',
            fontWeight: '600',
            color: hasEntries ? '#be185d' : '#374151',
            zIndex: 10,
          }}
        >
          {day}
        </div>

        {hasEntries && (
          <div style={{ padding: '4px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div 
              style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              }}
            >
              <img
                src={entries[0].imgUrl}
                alt="Hair care treatment"
                loading="lazy"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transition: 'transform 0.3s ease',
                }}
                onError={(e) => {
                  e.target.src = 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg';
                }}
              />
              <div 
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(0, 0, 0, 0.4), transparent)',
                  opacity: 0.6,
                }}
              />

              <div 
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  display: 'none',
                }}
                className="hidden sm:flex space-x-0.5"
              >
                <StarRating rating={entries[0].rating} />
              </div>

              {entries.length > 1 && (
                <div 
                  style={{
                    position: 'absolute',
                    bottom: '8px',
                    right: '8px',
                    backgroundColor: '#ec4899',
                    color: 'white',
                    fontSize: '12px',
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    fontWeight: '500',
                  }}
                >
                  +{entries.length - 1}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  });

  // Optimized Calendar Month component
  const CalendarMonth = React.memo(({ year, month }) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const monthKey = `${year}-${month}`;
    const isVisible = visibleMonths.has(monthKey);
    
    const monthName = new Date(year, month).toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });

    const days = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} style={{ height: '80px' }}></div>);
    }

    // Days of the month - only render if visible or near viewport
    for (let day = 1; day <= daysInMonth; day++) {
      const entries = isVisible ? getEntriesForDate(year, month, day) : [];
      days.push(
        <CalendarDay
          key={day}
          day={day}
          entries={entries}
          year={year}
          month={month}
        />
      );
    }

    return (
      <div
        ref={el => monthRefs.current[monthKey] = el}
        style={{ marginBottom: '48px' }}
      >
        <div 
          style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(229, 231, 235, 0.5)',
            overflow: 'hidden',
            transform: 'translateZ(0)', // Force GPU acceleration
          }}
        >
          <div 
            style={{
              padding: '24px',
              borderBottom: '1px solid #e5e7eb',
              background: 'linear-gradient(to right, #fdf2f8, #f3e8ff)',
            }}
          >
            <h3 
              style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#111827',
                textAlign: 'center',
                margin: 0,
              }}
            >
              {monthName}
            </h3>
          </div>
          <div style={{ padding: '24px' }}>
            <div 
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: '8px',
                marginBottom: '16px',
                borderBottom: '1px solid #f3f4f6',
                paddingBottom: '16px',
              }}
            >
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div 
                  key={day} 
                  style={{
                    textAlign: 'center',
                    fontWeight: '500',
                    color: '#6b7280',
                    padding: '8px 0',
                    fontSize: '14px',
                  }}
                  className="hidden sm:block"
                >
                  {day}
                </div>
              ))}
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                <div 
                  key={day} 
                  style={{
                    textAlign: 'center',
                    fontWeight: '500',
                    color: '#6b7280',
                    padding: '8px 0',
                    fontSize: '12px',
                  }}
                  className="sm:hidden"
                >
                  {day}
                </div>
              ))}
            </div>
            <div 
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: '8px',
              }}
            >
              {days}
            </div>
          </div>
        </div>
      </div>
    );
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

  return (
    <div className="min-h-screen bg-gray-100">
      {isLoading && (
        <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
        </div>
      )}

      {/* Fixed Header - Optimized */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          backgroundColor: 'white',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          zIndex: 10,
          transform: 'translateZ(0)',
        }}
      >
        <div 
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '16px 24px',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <h1 
              style={{
                fontSize: 'clamp(20px, 4vw, 32px)',
                fontWeight: 'bold',
                color: 'transparent',
                background: 'linear-gradient(to right, #db2777, #9333ea)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                margin: 0,
              }}
            >
              Hair Care Calendar
            </h1>
            <h2 
              style={{
                fontSize: 'clamp(16px, 3vw, 24px)',
                color: '#6b7280',
                fontWeight: '500',
                marginTop: '4px',
                margin: '4px 0 0 0',
              }}
            >
              {monthName}
            </h2>
          </div>
          
          {/* Search and Filter Bar - Optimized */}
          <div 
            style={{
              marginTop: '16px',
              display: 'flex',
              gap: '12px',
              alignItems: 'center',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ position: 'relative', maxWidth: '400px', flex: '1' }}>
              <input
                type="text"
                placeholder="Search entries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 40px 8px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s ease',
                }}
              />
              <svg 
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '20px',
                  height: '20px',
                  color: '#9ca3af',
                  pointerEvents: 'none',
                }}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                padding: '8px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                backgroundColor: 'white',
                fontSize: '14px',
                outline: 'none',
                cursor: 'pointer',
              }}
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

      {/* Calendar Container - Optimized */}
      <div
        ref={scrollContainerRef}
        style={{
          paddingTop: '144px',
          paddingBottom: '32px',
          paddingLeft: '16px',
          paddingRight: '16px',
          height: '100vh',
          overflowY: 'auto',
          overflowX: 'hidden',
          scrollBehavior: 'smooth',
          transform: 'translateZ(0)', // Force GPU acceleration
          WebkitOverflowScrolling: 'touch', // Smooth scrolling on iOS
        }}
      >
        <div 
          style={{
            maxWidth: '1024px',
            margin: '0 auto',
          }}
        >
          {calendarMonths.map(({ year, month }) => (
            <CalendarMonth
              key={`${year}-${month}`}
              year={year}
              month={month}
            />
          ))}
        </div>
      </div>

      {/* Journal Card Modal - Optimized */}
      {selectedEntry && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(4px)',
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          <div 
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '512px',
              transform: 'translateZ(0)',
            }}
          >
            <button
              onClick={closeJournalCard}
              style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                zIndex: 10,
                backgroundColor: 'white',
                borderRadius: '50%',
                padding: '8px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X style={{ width: '20px', height: '20px', color: '#6b7280' }} />
            </button>
            
            <button
              onClick={() => navigateToEntry('prev')}
              disabled={filteredEntries.findIndex(e => e.id === selectedEntry.id) === 0}
              style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 10,
                backgroundColor: 'white',
                borderRadius: '50%',
                padding: '12px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                border: 'none',
                cursor: filteredEntries.findIndex(e => e.id === selectedEntry.id) === 0 ? 'not-allowed' : 'pointer',
                opacity: filteredEntries.findIndex(e => e.id === selectedEntry.id) === 0 ? 0.5 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ChevronLeft style={{ width: '20px', height: '20px' }} />
            </button>
            
            <button
              onClick={() => navigateToEntry('next')}
              disabled={filteredEntries.findIndex(e => e.id === selectedEntry.id) === filteredEntries.length - 1}
              style={{
                position: 'absolute',
                right: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 10,
                backgroundColor: 'white',
                borderRadius: '50%',
                padding: '12px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                border: 'none',
                cursor: filteredEntries.findIndex(e => e.id === selectedEntry.id) === filteredEntries.length - 1 ? 'not-allowed' : 'pointer',
                opacity: filteredEntries.findIndex(e => e.id === selectedEntry.id) === filteredEntries.length - 1 ? 0.5 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ChevronRight style={{ width: '20px', height: '20px' }} />
            </button>
            
            <div style={{ position: 'relative', overflow: 'hidden' }}>
              <div
                style={{
                  display: 'flex',
                  transition: 'transform 0.3s ease-out',
                  transform: `translateX(${-cardIndex * 100 + (dragOffset / window.innerWidth) * 100}%)`,
                  willChange: 'transform',
                }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {selectedEntries.map((entry) => (
                  <div
                    key={entry.id}
                    style={{
                      flexShrink: 0,
                      width: '100%',
                      backgroundColor: 'white',
                      borderRadius: '16px',
                      boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
                      overflow: 'hidden',
                      transform: 'translateZ(0)',
                    }}
                  >
                    <div style={{ position: 'relative', height: '320px' }}>
                      <img
                        src={entry.imgUrl}
                        alt="Hair care treatment"
                        loading="lazy"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                        onError={(e) => {
                          e.target.src = 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg';
                        }}
                      />
                      <div 
                        style={{
                          position: 'absolute',
                          inset: 0,
                          background: 'linear-gradient(to top, rgba(0, 0, 0, 0.6), transparent)',
                        }}
                      />
                      <div 
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          padding: '24px',
                          color: 'white',
                        }}
                      >
                        <div 
                          style={{
                            fontSize: '16px',
                            fontWeight: '500',
                            marginBottom: '8px',
                          }}
                        >
                          {new Date(parseDate(entry.date)).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                        <StarRating rating={entry.rating} />
                      </div>
                    </div>
                    <div style={{ padding: '32px' }}>
                      <div 
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '8px',
                          marginBottom: '16px',
                        }}
                      >
                        {entry.categories.map((category, idx) => (
                          <span
                            key={idx}
                            style={{
                              padding: '4px 12px',
                              backgroundColor: '#fce7f3',
                              color: '#be185d',
                              borderRadius: '9999px',
                              fontSize: '14px',
                              fontWeight: '500',
                            }}
                          >
                            {category}
                          </span>
                        ))}
                      </div>
                      <p 
                        style={{
                          color: '#1f2937',
                          lineHeight: '1.6',
                          margin: 0,
                        }}
                      >
                        {entry.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {selectedEntries.length > 1 && (
              <div 
                style={{
                  position: 'absolute',
                  bottom: '16px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  display: 'flex',
                  gap: '8px',
                }}
              >
                {selectedEntries.map((_, index) => (
                  <div
                    key={index}
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: index === cardIndex ? '#ec4899' : '#d1d5db',
                      transition: 'background-color 0.2s ease',
                    }}
                  />
                ))}
              </div>
            )}
            
            <div 
              style={{
                position: 'absolute',
                top: '16px',
                left: '16px',
                zIndex: 10,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                color: 'white',
                padding: '4px 12px',
                borderRadius: '9999px',
                fontSize: '14px',
              }}
            >
              {filteredEntries.findIndex(e => e.id === selectedEntry.id) + 1} of {filteredEntries.length}
            </div>
          </div>
        </div>
      )}

      {/* Add some CSS for better scroll performance */}
      <style jsx>{`
        .calendar-day {
          will-change: transform;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          perspective: 1000px;
        }
        
        .calendar-day:hover {
          transform: scale(1.02) translateZ(0);
        }
        
        .has-entries:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        
        /* Smooth scrolling optimization */
        * {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        
        /* Reduce motion for users who prefer it */
        @media (prefers-reduced-motion: reduce) {
          .calendar-day {
            transition: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default React.memo(InfiniteScrollableCalendar);

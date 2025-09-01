// Helper functions for date manipulation and data handling

export const parseDate = (dateStr) => {
  const [day, month, year] = dateStr.split('/').map(Number);
  return new Date(year, month - 1, day);
};

export const generateMonths = () => {
  const months = [];
  const startYear = new Date().getFullYear() - 2;
  const endYear = new Date().getFullYear() + 2;
  
  for (let year = startYear; year <= endYear; year++) {
    for (let month = 0; month < 12; month++) {
      months.push({ year, month });
    }
  }
  return months;
};

export const filterEntries = (entries, searchQuery, selectedCategory) => {
  return entries.filter(entry => {
    const matchesSearch = searchQuery === '' || 
      entry.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.categories.some(cat => cat.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === '' || 
      entry.categories.includes(selectedCategory);
    
    return matchesSearch && matchesCategory;
  });
};

export const getAllCategories = (journalEntries) => {
  return Array.from(new Set(journalEntries.flatMap(entry => entry.categories)));
};

export const getAdjacentEntry = (direction, currentEntry, journalEntries) => {
  const currentIndex = journalEntries.findIndex(entry => entry.id === currentEntry.id);
  
  if (direction === 'next' && currentIndex < journalEntries.length - 1) {
    return journalEntries[currentIndex + 1];
  } else if (direction === 'prev' && currentIndex > 0) {
    return journalEntries[currentIndex - 1];
  }
  return null;
};

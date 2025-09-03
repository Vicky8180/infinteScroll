# Hair Care Journal - Infinite Scroll Calendar 💇‍♀️

A modern, responsive React application for tracking your hair care journey with an infinite scroll calendar interface. Keep track of your hair treatments, products, and progress with an intuitive and visually appealing interface.

## 🌟 Features

### 📅 Infinite Scroll Calendar
- Smooth infinite scrolling through months and years
- Responsive calendar layout that adapts to all screen sizes
- Touch-friendly navigation with swipe gestures
- Visual indicators for days with journal entries

### 📝 Hair Care Journal
- Track hair treatments, products, and results
- Rate your experiences (1-5 stars)
- Categorize entries (Deep Conditioning, Protein Treatment, Protective Styles, etc.)
- Add detailed descriptions and observations
- Image support for before/after photos

### 🔍 Advanced Filtering & Search
- Real-time search through journal entries
- Filter by categories and treatment types
- Date-based filtering and navigation
- Optimized search performance with debouncing

### 🎨 Modern UI/UX
- Beautiful, responsive design built with Tailwind CSS
- Smooth animations and transitions
- Touch/swipe gestures for mobile devices
- Card-based journal entry display
- Modal interface for detailed entry viewing

### ⚡ Performance Optimizations
- Virtualized rendering for smooth scrolling
- Throttled scroll events
- Debounced search input
- Optimized component re-rendering
- Efficient state management

## 🚀 Getting Started

### Prerequisites
Make sure you have the following installed on your system:
- **Node.js** (version 14.0 or higher)
- **npm** (comes with Node.js) or **yarn**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Vicky8180/infinteScroll.git
   cd infinteScroll
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```
   or
   ```bash
   yarn install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```
   or
   ```bash
   yarn start
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000) to view the application.

The page will automatically reload when you make changes, and you'll see any lint errors in the console.

## 📱 Usage

### Navigating the Calendar
- **Scroll** vertically to navigate through different months
- **Click** on any date to view journal entries for that day
- **Use navigation arrows** to quickly jump between months
- **Touch/swipe** on mobile devices for intuitive navigation

### Adding/Viewing Journal Entries
- **Click on a day** with entries (marked with indicators) to view details
- **Rate your experiences** using the 5-star rating system
- **Categorize entries** for better organization
- **Use search and filters** to find specific treatments or products

### Search & Filter
- **Search bar**: Type keywords to find specific entries
- **Category filter**: Filter by treatment types
- **Date navigation**: Jump to specific months/years

## 🛠️ Available Scripts

### Development
- **`npm start`** - Runs the app in development mode
- **`npm test`** - Launches the test runner in interactive watch mode
- **`npm run build`** - Builds the app for production
- **`npm run eject`** - Ejects from Create React App (one-way operation)

### Production Build
```bash
npm run build
```
Builds the app for production to the `build` folder. The build is minified and optimized for best performance.

## 🏗️ Project Structure

```
src/
├── App.js                 # Main application component
├── App.css               # Application styles
├── index.js              # Application entry point
├── optimized.css         # Optimized component styles
├── scroll.optimized.js   # Main infinite scroll calendar component
└── components/
    ├── CalendarDay.js    # Individual calendar day component
    ├── CalendarHeader.js # Calendar header with navigation
    ├── CalendarMonth.js  # Month view component
    ├── JournalCard.js    # Journal entry modal component
    └── utils.js          # Utility functions and helpers
```

## 🔧 Technologies Used

### Frontend Framework
- **React 19.1.1** - Modern React with latest features
- **React DOM 19.1.1** - React rendering engine

### Styling & UI
- **Tailwind CSS 3.4.17** - Utility-first CSS framework
- **Lucide React 0.542.0** - Beautiful, customizable icons
- **PostCSS 8.5.6** - CSS post-processing
- **Autoprefixer 10.4.21** - CSS vendor prefixing

### Development Tools
- **React Scripts 5.0.1** - Build tools and configuration
- **Web Vitals 2.1.4** - Performance monitoring

### Testing
- **@testing-library/react 16.3.0** - React component testing
- **@testing-library/jest-dom 6.8.0** - Custom Jest matchers
- **@testing-library/user-event 13.5.0** - User interaction simulation

### Additional Dependencies
- **Axios 1.11.0** - HTTP client for API requests
- **@react-google-maps/api 2.20.7** - Google Maps integration (if needed)
- **@vis.gl/react-google-maps 1.5.5** - Advanced Google Maps components

## 🎯 Key Components

### InfiniteScrollableCalendar (`scroll.optimized.js`)
- Main component handling infinite scroll functionality
- State management for calendar navigation and journal entries
- Performance optimizations with throttling and debouncing
- Touch gesture handling for mobile devices

### JournalCard (`components/JournalCard.js`)
- Modal component for displaying detailed journal entries
- Star rating system
- Image gallery functionality
- Navigation between multiple entries

### Calendar Components
- **CalendarMonth**: Renders individual month views
- **CalendarDay**: Handles individual day rendering and interactions
- **CalendarHeader**: Navigation controls and month/year display

## 🔧 Configuration

### Tailwind CSS
The project uses Tailwind CSS for styling. Configuration can be found in:
- `tailwind.config.js` - Tailwind configuration
- `postcss.config.js` - PostCSS configuration

### Build Configuration
- Built with Create React App
- Custom optimizations in component files
- Performance enhancements for scroll handling

## 📊 Performance Features

- **Virtualized Rendering**: Only renders visible months for better performance
- **Throttled Scroll Events**: Optimized scroll handling to prevent excessive re-renders
- **Debounced Search**: Smooth search experience without excessive API calls
- **Optimized State Updates**: Strategic use of React hooks for performance
- **Memoized Components**: Reduced unnecessary re-renders

## 🌐 Browser Support

- **Modern browsers** (Chrome, Firefox, Safari, Edge)
- **Mobile browsers** (iOS Safari, Chrome Mobile)
- **Progressive Web App** capabilities
- **Responsive design** for all screen sizes

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙋‍♀️ Support

If you have any questions or need help getting started:
- Create an issue in the GitHub repository
- Check the documentation above
- Review the component files for implementation details

---

**Happy Hair Care Tracking! 💁‍♀️✨**

// src/App.jsx
import { useState, useEffect } from 'react';
import NewsCard from './components/NewsCard';
import NewsCardList from './components/NewsCardList';

// API Keys from environment variables
const NEWSAPI_KEY = import.meta.env.VITE_NEWSAPI_API_KEY;
const GNEWS_API_KEY = import.meta.env.VITE_GNEWS_API_KEY;
const GUARDIAN_API_KEY = import.meta.env.VITE_GUARDIAN_API_KEY;

function App() {
  // State Management
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [bookmarks, setBookmarks] = useState([]);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [viewMode, setViewMode] = useState('grid');
  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Fetch news from multiple APIs
  useEffect(() => {
    const fetchAllNews = async () => {
      setLoading(true);
      
      const newsApiUrl = `https://newsapi.org/v2/everything?q=AI&language=en&apiKey=${NEWSAPI_KEY}`;
      const gnewsApiUrl = `https://gnews.io/api/v4/search?q=AI&lang=en&apikey=${GNEWS_API_KEY}`;
      const guardianApiUrl = `https://content.guardianapis.com/search?q=AI&api-key=${GUARDIAN_API_KEY}&show-fields=thumbnail,headline`;

      const results = await Promise.allSettled([
        fetch(newsApiUrl).then(res => res.json()),
        fetch(gnewsApiUrl).then(res => res.json()),
        fetch(guardianApiUrl).then(res => res.json())
      ]);

      let combinedArticles = [];

      // Process NewsAPI results
      if (results[0].status === 'fulfilled' && results[0].value.articles) {
        const normalized = results[0].value.articles.map(article => ({
          id: article.url,
          title: article.title,
          url: article.url,
          imageUrl: article.urlToImage,
          source: article.source.name,
          publishedAt: article.publishedAt,
          apiSource: 'NewsAPI'
        }));
        combinedArticles.push(...normalized);
      } else {
        console.error("Failed to fetch from NewsAPI:", results[0].reason);
      }
      
      // Process GNews results
      if (results[1].status === 'fulfilled' && results[1].value.articles) {
        const normalized = results[1].value.articles.map(article => ({
          id: article.url,
          title: article.title,
          url: article.url,
          imageUrl: article.image,
          source: article.source.name,
          publishedAt: article.publishedAt,
          apiSource: 'GNews'
        }));
        combinedArticles.push(...normalized);
      } else {
        console.error("Failed to fetch from GNews:", results[1].reason);
      }

      // Process Guardian API results
      if (results[2].status === 'fulfilled' && results[2].value.response?.results) {
        const normalized = results[2].value.response.results.map(article => ({
          id: article.id,
          title: article.webTitle,
          url: article.webUrl,
          imageUrl: article.fields?.thumbnail,
          source: 'The Guardian',
          publishedAt: article.webPublicationDate,
          apiSource: 'The Guardian'
        }));
        combinedArticles.push(...normalized);
      } else {
        console.error("Failed to fetch from The Guardian:", results[2].reason);
      }
      
      // Remove duplicates and sort by date
      const uniqueArticles = Array.from(new Map(combinedArticles.map(item => [item.id, item])).values());
      uniqueArticles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

      setArticles(uniqueArticles);
      setLoading(false);
    };

    fetchAllNews();
  }, []);

  // Load bookmarks from sessionStorage
  useEffect(() => {
    const savedBookmarks = JSON.parse(sessionStorage.getItem('newsBookmarks') || '[]');
    setBookmarks(savedBookmarks);
  }, []);

  // Load dark mode from localStorage
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
  }, []);

  // Save bookmarks to sessionStorage
  useEffect(() => {
    sessionStorage.setItem('newsBookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  // Save dark mode to localStorage and apply class
  useEffect(() => {
    localStorage.setItem('darkMode', darkMode.toString());
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Responsive items per page
  useEffect(() => {
    const updateItemsPerPage = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setItemsPerPage(6);
      } else if (width < 1024) {
        setItemsPerPage(8);
      } else {
        setItemsPerPage(12);
      }
    };

    updateItemsPerPage();
    window.addEventListener('resize', updateItemsPerPage);
    return () => window.removeEventListener('resize', updateItemsPerPage);
  }, []);

  // Reset page when changing views or search
  useEffect(() => {
    setCurrentPage(1);
  }, [showBookmarks, searchQuery, viewMode]);

  // Bookmark functions
  const addBookmark = (article) => {
    setBookmarks(prev => {
      const exists = prev.some(bookmark => bookmark.id === article.id);
      if (!exists) {
        return [...prev, { ...article, bookmarkedAt: new Date().toISOString() }];
      }
      return prev;
    });
  };

  const removeBookmark = (articleId) => {
    setBookmarks(prev => prev.filter(bookmark => bookmark.id !== articleId));
  };

  const isBookmarked = (articleId) => {
    return bookmarks.some(bookmark => bookmark.id === articleId);
  };

  const clearAllBookmarks = () => {
    setBookmarks([]);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Pagination logic
  const filteredArticles = showBookmarks 
    ? bookmarks.filter(article =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : articles.filter(article =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase())
      );

  const totalPages = Math.ceil(filteredArticles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentArticles = filteredArticles.slice(startIndex, startIndex + itemsPerPage);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <header className={`shadow-sm border-b sticky top-0 z-50 transition-colors duration-300 ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="max-w-8xl mx-auto px-2 sm:px-4 lg:px-6 xl:px-8">
          <div className="py-2 sm:py-3 lg:py-4">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <div className="flex items-center flex-shrink-0">
                <div className="flex items-center space-x-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-300 ${
                    darkMode ? 'bg-blue-600' : 'bg-blue-500'
                  }`}>
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                    </svg>
                  </div>
                  <h1 className={`text-lg sm:text-xl lg:text-2xl font-bold transition-colors duration-300 ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>AI News</h1>
                </div>
              </div>

              {/* Search Bar (Desktop/Tablet) */}
              <div className="hidden sm:flex flex-1 max-w-lg mx-4 lg:mx-8">
                <div className="relative w-full">
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search articles..."
                    className={`w-full pl-10 pr-10 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all duration-300 ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:bg-gray-600' 
                        : 'bg-gray-50 border-gray-300 focus:bg-white focus:shadow-sm'
                    }`}
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full transition-colors duration-300 ${
                        darkMode ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-600' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* Header Actions */}
              <div className="flex items-center space-x-2 sm:space-x-3">
                {/* Mobile Menu Toggle */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className={`sm:hidden p-2 rounded-lg transition-all duration-300 ${
                    darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>

                {/* Dark Mode Toggle */}
                <button
                  onClick={toggleDarkMode}
                  className={`p-2 lg:p-2.5 rounded-xl transition-all duration-300 ${
                    darkMode 
                      ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600 shadow-lg' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 shadow-sm'
                  }`}
                  title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {darkMode ? (
                    <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>

                {/* View Toggle (Desktop/Tablet) */}
                <div className={`hidden sm:flex items-center rounded-xl p-1 transition-colors duration-300 ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                  <button 
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-all duration-300 ${
                      viewMode === 'grid' 
                        ? darkMode ? 'text-white bg-gray-600 shadow-md' : 'text-gray-900 bg-white shadow-md'
                        : darkMode ? 'text-gray-300 hover:text-white hover:bg-gray-600' : 'text-gray-600 hover:text-gray-900 hover:bg-white'
                    }`}
                    title="Grid view"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-all duration-300 ${
                      viewMode === 'list' 
                        ? darkMode ? 'text-white bg-gray-600 shadow-md' : 'text-gray-900 bg-white shadow-md'
                        : darkMode ? 'text-gray-300 hover:text-white hover:bg-gray-600' : 'text-gray-600 hover:text-gray-900 hover:bg-white'
                    }`}
                    title="List view"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                  </button>
                </div>

                {/* Tab Navigation */}
                <div className={`hidden sm:flex rounded-xl p-1 transition-colors duration-300 ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                  <button
                    onClick={() => setShowBookmarks(false)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                      !showBookmarks 
                        ? darkMode ? 'bg-gray-600 shadow-md text-white' : 'bg-white shadow-md text-gray-900'
                        : darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    All News
                  </button>
                  <button
                    onClick={() => setShowBookmarks(true)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 relative ${
                      showBookmarks 
                        ? darkMode ? 'bg-gray-600 shadow-md text-white' : 'bg-white shadow-md text-gray-900'
                        : darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Bookmarks
                    {bookmarks.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                        {bookmarks.length > 99 ? '99+' : bookmarks.length}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile Search Bar */}
            <div className="sm:hidden mt-3">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search articles..."
                  className={`w-full pl-10 pr-10 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all duration-300 ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:bg-gray-600' 
                      : 'bg-gray-50 border-gray-300 focus:bg-white focus:shadow-sm'
                  }`}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full transition-colors duration-300 ${
                      darkMode ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-600' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className={`sm:hidden border-t transition-colors duration-300 ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="px-4 py-3 space-y-3">
              {/* Mobile Tab Navigation */}
              <div className={`flex rounded-lg p-1 transition-colors duration-300 ${
                darkMode ? 'bg-gray-700' : 'bg-gray-100'
              }`}>
                <button
                  onClick={() => {
                    setShowBookmarks(false);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-300 ${
                    !showBookmarks 
                      ? darkMode ? 'bg-gray-600 shadow-sm text-white' : 'bg-white shadow-sm text-gray-900'
                      : darkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}
                >
                  All News
                </button>
                <button
                  onClick={() => {
                    setShowBookmarks(true);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-300 relative ${
                    showBookmarks 
                      ? darkMode ? 'bg-gray-600 shadow-sm text-white' : 'bg-white shadow-sm text-gray-900'
                      : darkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}
                >
                  Bookmarks
                  {bookmarks.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-semibold">
                      {bookmarks.length > 99 ? '99+' : bookmarks.length}
                    </span>
                  )}
                </button>
              </div>

              {/* Mobile View Toggle */}
              <div className={`flex rounded-lg p-1 transition-colors duration-300 ${
                darkMode ? 'bg-gray-700' : 'bg-gray-100'
              }`}>
                <button 
                  onClick={() => {
                    setViewMode('grid');
                    setMobileMenuOpen(false);
                  }}
                  className={`flex-1 py-2 px-3 rounded-md transition-all duration-300 flex items-center justify-center space-x-2 ${
                    viewMode === 'grid' 
                      ? darkMode ? 'text-white bg-gray-600 shadow-sm' : 'text-gray-900 bg-white shadow-sm'
                      : darkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  <span className="text-sm font-medium">Grid</span>
                </button>
                <button 
                  onClick={() => {
                    setViewMode('list');
                    setMobileMenuOpen(false);
                  }}
                  className={`flex-1 py-2 px-3 rounded-md transition-all duration-300 flex items-center justify-center space-x-2 ${
                    viewMode === 'list' 
                      ? darkMode ? 'text-white bg-gray-600 shadow-sm' : 'text-gray-900 bg-white shadow-sm'
                      : darkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  <span className="text-sm font-medium">List</span>
                </button>
              </div>

              {/* Mobile Clear All Button */}
              {bookmarks.length > 0 && showBookmarks && (
                <button
                  onClick={() => {
                    clearAllBookmarks();
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-center px-4 py-2.5 text-sm font-medium border rounded-lg transition-all duration-300 ${
                    darkMode 
                      ? 'text-red-400 hover:text-red-300 hover:bg-red-900/20 border-red-800' 
                      : 'text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200'
                  }`}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Clear All Bookmarks
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-8xl mx-auto px-2 sm:px-4 lg:px-6 xl:px-8 py-3 sm:py-4 lg:py-6 xl:py-8">
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12 lg:py-20">
            <div className={`flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4 transition-colors duration-300 ${
              darkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              <div className={`w-8 h-8 border-3 rounded-full animate-spin transition-colors duration-300 ${
                darkMode ? 'border-gray-600 border-t-blue-400' : 'border-gray-300 border-t-blue-500'
              }`}></div>
              <div className="text-center sm:text-left">
                <span className="text-base sm:text-lg font-medium block">Loading articles...</span>
                <span className="text-sm text-opacity-75">Fetching from multiple sources</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Error State */}
        {error && (
          <div className={`border rounded-xl p-4 sm:p-6 mb-6 transition-colors duration-300 ${
            darkMode ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center space-x-3">
              <svg className={`w-5 h-5 flex-shrink-0 ${darkMode ? 'text-red-400' : 'text-red-500'}`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className={`text-sm sm:text-base font-medium transition-colors duration-300 ${
                darkMode ? 'text-red-400' : 'text-red-700'
              }`}>Error loading articles: {error}</p>
            </div>
          </div>
        )}
        
        {/* Content */}
        {!loading && !error && (
          <>
            {/* Stats Bar */}
            <div className={`rounded-xl shadow-sm border p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 transition-all duration-300 ${
              darkMode ? 'bg-gray-800 border-gray-700 shadow-gray-900/20' : 'bg-white border-gray-200 shadow-gray-100/50'
            }`}>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 lg:gap-6">
                {/* Results Info */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  <div className={`text-sm sm:text-base transition-colors duration-300 ${
                    darkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    <span className="flex items-center space-x-2">
                      <span>Showing</span>
                      <span className={`px-2 py-1 rounded-lg font-semibold text-sm transition-colors duration-300 ${
                        darkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700'
                      }`}>{currentArticles.length}</span>
                      <span>of</span>
                      <span className={`px-2 py-1 rounded-lg font-semibold text-sm transition-colors duration-300 ${
                        darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                      }`}>{filteredArticles.length}</span>
                      <span>articles</span>
                    </span>
                  </div>
                  
                  {/* Search Query Badge */}
                  {searchQuery && (
                    <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-300 ${
                      darkMode ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-100 text-purple-700'
                    }`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <span>"{searchQuery}"</span>
                      <button
                        onClick={() => setSearchQuery('')}
                        className="ml-1 hover:bg-purple-200 dark:hover:bg-purple-800 rounded-full p-0.5"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}

                  {/* Bookmarks Badge */}
                  {showBookmarks && (
                    <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-300 ${
                      darkMode ? 'bg-yellow-900/30 text-yellow-300' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z"/>
                      </svg>
                      <span>Bookmarks View</span>
                    </div>
                  )}
                </div>
                
                {/* Controls */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                  {/* Clear All Button (Desktop) */}
                  {bookmarks.length > 0 && showBookmarks && (
                    <button
                      onClick={clearAllBookmarks}
                      className={`hidden sm:inline-flex items-center px-4 py-2 text-sm font-medium border rounded-xl transition-all duration-300 hover-scale-105 ${
                        darkMode 
                          ? 'text-red-400 hover:text-red-300 hover:bg-red-900/20 border-red-800 hover:border-red-700' 
                          : 'text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300'
                      }`}
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Clear All
                    </button>
                  )}

                  {/* Items Per Page Selector */}
                  <div className="flex items-center space-x-3">
                    <label className={`text-sm font-medium whitespace-nowrap transition-colors duration-300 ${
                      darkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>Items per page:</label>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className={`border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600' 
                          : 'border-gray-300 hover:border-gray-400 focus:bg-white'
                      }`}
                    >
                      <option value={6}>6</option>
                      <option value={8}>8</option>
                      <option value={12}>12</option>
                      <option value={16}>16</option>
                      <option value={24}>24</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Articles Display */}
            {currentArticles.length > 0 ? (
              <>
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-5 lg:gap-6 mb-8 sm:mb-12">
                    {currentArticles.map((article, index) => (
                      <div 
                        key={article.id}
                        className="opacity-0 animate-fadeIn hover-scale-102 transition-all duration-300"
                        style={{
                          animationDelay: `${index * 100}ms`,
                          animationFillMode: 'forwards'
                        }}
                      >
                        <NewsCard
                          article={article}
                          isBookmarked={isBookmarked(article.id)}
                          onBookmark={() => addBookmark(article)}
                          onRemoveBookmark={() => removeBookmark(article.id)}
                          showBookmarkDate={showBookmarks}
                          darkMode={darkMode}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4 sm:space-y-6 mb-8 sm:mb-12">
                    {currentArticles.map((article, index) => (
                      <div 
                        key={article.id}
                        className="opacity-0 animate-fadeIn hover-scale-101 transition-all duration-300"
                        style={{
                          animationDelay: `${index * 75}ms`,
                          animationFillMode: 'forwards'
                        }}
                      >
                        <NewsCardList
                          article={article}
                          isBookmarked={isBookmarked(article.id)}
                          onBookmark={() => addBookmark(article)}
                          onRemoveBookmark={() => removeBookmark(article.id)}
                          showBookmarkDate={showBookmarks}
                          darkMode={darkMode}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex flex-col items-center space-y-6">
                    {/* Mobile Pagination */}
                    <div className="flex sm:hidden items-center justify-between w-full max-w-sm">
                      <button
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover-scale-105 ${
                          darkMode
                            ? 'border-gray-600 hover:bg-gray-700 text-gray-300 disabled:hover:bg-transparent'
                            : 'border-gray-300 hover:bg-gray-50 disabled:hover:bg-transparent'
                        }`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        <span>Prev</span>
                      </button>
                      
                      <div className={`flex items-center space-x-3 px-4 py-2 rounded-xl transition-colors duration-300 ${
                        darkMode ? 'bg-gray-800' : 'bg-gray-100'
                      }`}>
                        <span className={`text-sm font-medium transition-colors duration-300 ${
                          darkMode ? 'text-gray-300' : 'text-gray-600'
                        }`}>Page</span>
                        <span className={`text-lg font-bold transition-colors duration-300 ${
                          darkMode ? 'text-white' : 'text-gray-900'
                        }`}>{currentPage}</span>
                        <span className={`text-sm transition-colors duration-300 ${
                          darkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>of {totalPages}</span>
                      </div>
                      
                      <button
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover-scale-105 ${
                          darkMode
                            ? 'border-gray-600 hover:bg-gray-700 text-gray-300 disabled:hover:bg-transparent'
                            : 'border-gray-300 hover:bg-gray-50 disabled:hover:bg-transparent'
                        }`}
                      >
                        <span>Next</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>

                    {/* Desktop Pagination */}
                    <div className="hidden sm:flex items-center justify-center space-x-2">
                      <button
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`flex items-center space-x-2 px-5 py-3 text-sm font-medium border rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover-scale-105 ${
                          darkMode
                            ? 'border-gray-600 hover:bg-gray-700 text-gray-300 disabled:hover:bg-transparent'
                            : 'border-gray-300 hover:bg-gray-50 disabled:hover:bg-transparent'
                        }`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        <span>Previous</span>
                      </button>
                      
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: Math.min(9, totalPages) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 9) {
                            pageNum = i + 1;
                          } else {
                            if (currentPage <= 5) {
                              pageNum = i + 1;
                            } else if (currentPage >= totalPages - 4) {
                              pageNum = totalPages - 8 + i;
                            } else {
                              pageNum = currentPage - 4 + i;
                            }
                          }
                          
                          if (pageNum < 1 || pageNum > totalPages) return null;
                          
                          return (
                            <button
                              key={pageNum}
                              onClick={() => goToPage(pageNum)}
                              className={`w-12 h-12 text-sm font-medium rounded-xl transition-all duration-300 hover-scale-110 ${
                                currentPage === pageNum
                                  ? 'bg-blue-500 text-white shadow-lg transform scale-105'
                                  : darkMode
                                    ? 'border border-gray-600 hover:bg-gray-700 text-gray-300 hover:border-gray-500'
                                    : 'border border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>
                      
                      <button
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`flex items-center space-x-2 px-5 py-3 text-sm font-medium border rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover-scale-105 ${
                          darkMode
                            ? 'border-gray-600 hover:bg-gray-700 text-gray-300 disabled:hover:bg-transparent'
                            : 'border-gray-300 hover:bg-gray-50 disabled:hover:bg-transparent'
                        }`}
                      >
                        <span>Next</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                    
                    {/* Pagination Info */}
                    <div className={`text-center space-y-1 transition-colors duration-300 ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      <div className="text-sm font-medium">
                        Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredArticles.length)} of {filteredArticles.length} results
                      </div>
                      <div className="text-xs opacity-75">
                        Page {currentPage} of {totalPages}
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* Empty State */
              <div className={`rounded-xl border p-8 sm:p-12 lg:p-16 text-center transition-colors duration-300 ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <div className="max-w-lg mx-auto">
                  <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-colors duration-300 ${
                    darkMode ? 'bg-gray-700' : 'bg-gray-100'
                  }`}>
                    {showBookmarks ? (
                      <svg className={`w-8 h-8 sm:w-10 sm:h-10 transition-colors duration-300 ${
                        darkMode ? 'text-yellow-400' : 'text-yellow-500'
                      }`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z"/>
                      </svg>
                    ) : (
                      <svg className={`w-8 h-8 sm:w-10 sm:h-10 transition-colors duration-300 ${
                        darkMode ? 'text-gray-500' : 'text-gray-400'
                      }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    )}
                  </div>
                  
                  <h3 className={`text-xl sm:text-2xl font-bold mb-3 transition-colors duration-300 ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {showBookmarks 
                      ? bookmarks.length === 0 ? "No bookmarks yet" : "No bookmarks found"
                      : "No articles found"
                    }
                  </h3>
                  
                  <p className={`text-base sm:text-lg mb-6 transition-colors duration-300 ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {showBookmarks 
                      ? bookmarks.length === 0 
                        ? "Start bookmarking articles to build your reading list" 
                        : `No bookmarks match "${searchQuery}"`
                      : `No articles match "${searchQuery}"`
                    }
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className={`px-6 py-3 text-sm font-medium border rounded-xl transition-all duration-300 hover-scale-105 ${
                          darkMode 
                            ? 'text-blue-400 hover:text-blue-300 border-blue-800 hover:bg-blue-900/20' 
                            : 'text-blue-600 hover:text-blue-700 border-blue-200 hover:bg-blue-50'
                        }`}
                      >
                        Clear search
                      </button>
                    )}
                    
                    {showBookmarks && bookmarks.length === 0 && (
                      <button
                        onClick={() => setShowBookmarks(false)}
                        className={`px-6 py-3 text-sm font-medium border rounded-xl transition-all duration-300 hover-scale-105 ${
                          darkMode 
                            ? 'text-gray-300 hover:text-white border-gray-600 hover:bg-gray-700' 
                            : 'text-gray-600 hover:text-gray-900 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        Browse articles
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className={`border-t mt-12 sm:mt-16 lg:mt-20 transition-colors duration-300 ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors duration-300 ${
                darkMode ? 'bg-blue-600' : 'bg-blue-500'
              }`}>
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                </svg>
              </div>
              <span className={`font-bold text-lg transition-colors duration-300 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>AI News</span>
            </div>
            
            <p className={`text-sm sm:text-base max-w-2xl mx-auto transition-colors duration-300 ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Stay informed with the latest AI news from trusted sources worldwide. 
              Powered by <span className={`font-medium transition-colors duration-300 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>NewsAPI</span>, <span className={`font-medium transition-colors duration-300 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>GNews</span>, and <span className={`font-medium transition-colors duration-300 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>The Guardian API</span>.
            </p>
            
            <div className="flex items-center justify-center space-x-6 pt-4">
              <div className={`flex items-center space-x-2 text-xs transition-colors duration-300 ${
                darkMode ? 'text-gray-500' : 'text-gray-400'
              }`}>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                <span>Updated daily</span>
              </div>
              <div className={`flex items-center space-x-2 text-xs transition-colors duration-300 ${
                darkMode ? 'text-gray-500' : 'text-gray-400'
              }`}>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                <span>Real-time updates</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
// src/components/NewsCard.jsx
import { useState } from 'react';

function NewsCard({ article, isBookmarked, onBookmark, onRemoveBookmark, showBookmarkDate, darkMode }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const displayImage = article.imageUrl || 'https://via.placeholder.com/400x250/f3f4f6/6b7280?text=No+Image';

  const formattedDate = new Date(article.publishedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const formattedBookmarkDate = showBookmarkDate && article.bookmarkedAt 
    ? new Date(article.bookmarkedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    : null;

  const getApiSourceColor = (apiSource) => {
    switch(apiSource) {
      case 'NewsAPI':
        return 'bg-blue-500';
      case 'GNews':
        return 'bg-green-500';
      case 'The Guardian':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const handleBookmarkClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isBookmarked) {
      onRemoveBookmark();
    } else {
      onBookmark();
    }
  };

  return (
    <article className={`
      relative rounded-xl shadow-sm border overflow-hidden transition-all duration-300 
      hover:shadow-lg hover:-translate-y-0.5 group h-full flex flex-col
      ${darkMode 
        ? 'bg-gray-800 border-gray-700 hover:border-gray-600 hover:shadow-gray-900/25' 
        : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-gray-900/10'
      }
    `}>
      {/* Image Section */}
      <div className={`
        relative aspect-[16/10] sm:aspect-video overflow-hidden flex-shrink-0
        ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}
      `}>
        {!imageError && (
          <img 
            src={displayImage} 
            alt={article.title}
            className={`
              w-full h-full object-cover transition-all duration-500 
              ${imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'} 
              group-hover:scale-110
            `}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        )}
        
        {/* Placeholder/Loading State */}
        {(imageError || !imageLoaded) && (
          <div className={`
            absolute inset-0 flex items-center justify-center
            ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}
          `}>
            <div className="text-center">
              <svg className={`
                w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1 sm:mb-2 
                ${darkMode ? 'text-gray-500' : 'text-gray-300'}
              `} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div className={`
                text-xs sm:text-sm font-medium
                ${darkMode ? 'text-gray-400' : 'text-gray-400'}
              `}>
                {imageError ? 'No Image' : 'Loading...'}
              </div>
            </div>
          </div>
        )}

        {/* Gradient overlay for better text visibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Top overlay with source and bookmark */}
        <div className="absolute top-0 left-0 right-0 p-2 sm:p-3 flex items-start justify-between">
          {/* API Source Badge */}
          <span className={`
            px-2 py-1 sm:px-2.5 sm:py-1 text-xs font-semibold text-white 
            rounded-full shadow-lg backdrop-blur-sm bg-opacity-90
            ${getApiSourceColor(article.apiSource)}
          `}>
            {article.apiSource}
          </span>

          {/* Bookmark Button */}
          <button
            onClick={handleBookmarkClick}
            className={`
              w-7 h-7 sm:w-9 sm:h-9 backdrop-blur-md rounded-full shadow-lg 
              hover:scale-110 active:scale-95 transition-all duration-200 
              flex items-center justify-center group/bookmark focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
              ${darkMode 
                ? 'bg-gray-800/90 hover:bg-gray-700/95 border border-gray-600/50' 
                : 'bg-white/90 hover:bg-white/95 border border-gray-200/50'
              }
            `}
            aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
          >
            <svg 
              className={`
                w-3.5 h-3.5 sm:w-4 sm:h-4 transition-all duration-200
                ${isBookmarked 
                  ? 'text-blue-500 fill-current scale-110' 
                  : darkMode
                    ? 'text-gray-300 group-hover/bookmark:text-blue-400 group-hover/bookmark:scale-110'
                    : 'text-gray-600 group-hover/bookmark:text-blue-500 group-hover/bookmark:scale-110'
                }
              `} 
              viewBox="0 0 24 24"
              fill={isBookmarked ? 'currentColor' : 'none'}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-3 sm:p-4 lg:p-5 flex-1 flex flex-col min-h-0">
        {/* Title */}
        <h3 className={`
          font-semibold text-sm sm:text-base lg:text-lg leading-tight mb-3 lg:mb-4
          line-clamp-2 sm:line-clamp-3 flex-1 transition-colors duration-200
          ${darkMode 
            ? 'text-white group-hover:text-blue-300' 
            : 'text-gray-900 group-hover:text-blue-600'
          }
        `}>
          <a 
            href={article.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:underline focus:outline-none focus:underline focus:underline-offset-2 transition-all duration-200"
          >
            {article.title}
          </a>
        </h3>
        
        {/* Footer */}
        <div className="mt-auto space-y-2 sm:space-y-3">
          {/* Source and Date */}
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className={`
              font-medium truncate flex-1 mr-2 transition-colors duration-200
              ${darkMode ? 'text-gray-300' : 'text-gray-700'}
            `}>
              {article.source}
            </span>
            <time className={`
              flex-shrink-0 transition-colors duration-200 font-medium
              ${darkMode ? 'text-gray-400' : 'text-gray-500'}
            `} dateTime={article.publishedAt}>
              {formattedDate}
            </time>
          </div>

          {/* Bookmark Date */}
          {showBookmarkDate && formattedBookmarkDate && (
            <div className={`
              flex items-center text-xs rounded-full px-2.5 py-1.5 w-fit transition-all duration-200
              ${darkMode 
                ? 'text-blue-300 bg-blue-900/30 border border-blue-800/30' 
                : 'text-blue-600 bg-blue-50 border border-blue-200/50'
              }
            `}>
              <svg className="w-3 h-3 mr-1.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
              <span className="font-medium whitespace-nowrap">Bookmarked {formattedBookmarkDate}</span>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

export default NewsCard;
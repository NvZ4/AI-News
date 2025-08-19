// src/components/NewsCardList.jsx
import { useState } from 'react';

function NewsCardList({ article, isBookmarked, onBookmark, onRemoveBookmark, showBookmarkDate, darkMode }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const displayImage = article.imageUrl || 'https://via.placeholder.com/300x300/f3f4f6/6b7280?text=No+Image';

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
      rounded-xl shadow-sm border overflow-hidden transition-all duration-300 
      hover:shadow-lg hover:-translate-y-0.5 group
      ${darkMode 
        ? 'bg-gray-800 border-gray-700 hover:border-gray-600 hover:shadow-gray-900/25' 
        : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-gray-900/10'
      }
    `}>
      <div className="flex flex-col sm:flex-row min-h-0">
        {/* Image Section */}
        <div className={`
          relative flex-shrink-0 overflow-hidden
          w-full h-48 sm:h-auto sm:w-40 md:w-48 lg:w-56 xl:w-64
          aspect-video sm:aspect-square
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
                  w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1 
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

          {/* Gradient overlay for better visibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* API Source Badge */}
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3">
            <span className={`
              px-2 py-1 sm:px-2.5 sm:py-1 text-xs font-semibold text-white 
              rounded-full shadow-lg backdrop-blur-sm bg-opacity-90
              ${getApiSourceColor(article.apiSource)}
            `}>
              {article.apiSource}
            </span>
          </div>

          {/* Mobile Bookmark Button */}
          <div className="absolute top-2 right-2 sm:hidden">
            <button
              onClick={handleBookmarkClick}
              className={`
                w-7 h-7 backdrop-blur-md rounded-full shadow-lg 
                hover:scale-110 active:scale-95 transition-all duration-200 
                flex items-center justify-center group/bookmark 
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
                ${darkMode 
                  ? 'bg-gray-800/90 hover:bg-gray-700/95 border border-gray-600/50' 
                  : 'bg-white/90 hover:bg-white/95 border border-gray-200/50'
                }
              `}
              aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
            >
              <svg 
                className={`
                  w-3.5 h-3.5 transition-all duration-200
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
        <div className="flex-1 p-3 sm:p-4 md:p-5 lg:p-6 flex flex-col min-w-0 min-h-0">
          {/* Title */}
          <h3 className={`
            font-semibold leading-tight mb-3 sm:mb-4
            text-base sm:text-lg md:text-xl lg:text-xl
            line-clamp-2 sm:line-clamp-3 lg:line-clamp-4
            transition-colors duration-200 flex-1
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
            {/* Source, Date and Desktop Bookmark */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center justify-between text-sm flex-1 min-w-0">
                <span className={`
                  font-medium truncate flex-1 mr-3 transition-colors duration-200
                  ${darkMode ? 'text-gray-300' : 'text-gray-700'}
                `}>
                  {article.source}
                </span>
                <time className={`
                  flex-shrink-0 font-medium transition-colors duration-200
                  ${darkMode ? 'text-gray-400' : 'text-gray-500'}
                `} dateTime={article.publishedAt}>
                  {formattedDate}
                </time>
              </div>

              {/* Desktop Bookmark Button */}
              <button
                onClick={handleBookmarkClick}
                className={`
                  hidden sm:flex w-8 h-8 md:w-9 md:h-9 rounded-full items-center justify-center 
                  transition-all duration-200 group/bookmark flex-shrink-0
                  hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
                  ${darkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 border border-gray-600' 
                    : 'bg-gray-100 hover:bg-gray-200 border border-gray-200'
                  }
                `}
                aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
              >
                <svg 
                  className={`
                    w-4 h-4 transition-all duration-200
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

            {/* Bookmark Date */}
            {showBookmarkDate && formattedBookmarkDate && (
              <div className={`
                flex items-center text-xs rounded-full px-2.5 sm:px-3 py-1.5 w-fit 
                transition-all duration-200
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
      </div>
    </article>
  );
}

export default NewsCardList;
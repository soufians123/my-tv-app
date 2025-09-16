import { memo, useState, useCallback } from 'react'
import { OptimizedImage } from './OptimizedImage'
import { CardSkeleton } from './LoadingSpinner'

const OptimizedCard = memo(({ 
  title,
  description,
  image,
  imageAlt,
  href,
  onClick,
  className = '',
  loading = false,
  children,
  ...props 
}) => {
  const [imageLoaded, setImageLoaded] = useState(false)

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true)
  }, [])

  const handleClick = useCallback((e) => {
    if (onClick) {
      onClick(e)
    } else if (href) {
      window.location.href = href
    }
  }, [onClick, href])

  if (loading) {
    return <CardSkeleton className={className} />
  }

  return (
    <div 
      className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer transform hover:scale-105 ${className}`}
      onClick={handleClick}
      {...props}
    >
      {image && (
        <div className="relative h-48 bg-gray-200">
          <OptimizedImage
            src={image}
            alt={imageAlt || title}
            width={400}
            height={200}
            className="w-full h-full object-cover"
            onLoad={handleImageLoad}
            priority={false}
          />
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse" />
          )}
        </div>
      )}
      
      <div className="p-4">
        {title && (
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {title}
          </h3>
        )}
        
        {description && (
          <p className="text-gray-600 text-sm line-clamp-3 mb-3">
            {description}
          </p>
        )}
        
        {children}
      </div>
    </div>
  )
})

OptimizedCard.displayName = 'OptimizedCard'

export default OptimizedCard

// Game Card Component
export const GameCard = memo(({ 
  game,
  onPlay,
  onFavorite,
  isFavorite = false,
  className = '' 
}) => {
  const [isHovered, setIsHovered] = useState(false)

  const handlePlay = useCallback((e) => {
    e.stopPropagation()
    onPlay?.(game)
  }, [onPlay, game])

  const handleFavorite = useCallback((e) => {
    e.stopPropagation()
    onFavorite?.(game)
  }, [onFavorite, game])

  return (
    <OptimizedCard
      title={game.title}
      description={game.description}
      image={game.image}
      imageAlt={`لعبة ${game.title}`}
      className={className}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 space-x-reverse">
          {game.rating && (
            <div className="flex items-center">
              <span className="text-yellow-500">★</span>
              <span className="text-sm text-gray-600 mr-1">{game.rating}</span>
            </div>
          )}
          
          {game.category && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              {game.category}
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2 space-x-reverse">
          <button
            onClick={handleFavorite}
            className={`p-2 rounded-full transition-colors duration-200 ${
              isFavorite 
                ? 'text-red-500 hover:text-red-600' 
                : 'text-gray-400 hover:text-red-500'
            }`}
            aria-label={isFavorite ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
          </button>
          
          <button
            onClick={handlePlay}
            className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 transform ${
              isHovered ? 'scale-105' : 'scale-100'
            }`}
          >
            العب الآن
          </button>
        </div>
      </div>
    </OptimizedCard>
  )
})

GameCard.displayName = 'GameCard'

// Article Card Component
export const ArticleCard = memo(({ 
  article,
  onRead,
  className = '' 
}) => {
  const handleRead = useCallback(() => {
    onRead?.(article)
  }, [onRead, article])

  return (
    <OptimizedCard
      title={article.title}
      description={article.excerpt}
      image={article.image}
      imageAlt={article.title}
      onClick={handleRead}
      className={className}
    >
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>{article.author}</span>
        <span>{new Date(article.publishedAt).toLocaleDateString('ar-SA')}</span>
      </div>
    </OptimizedCard>
  )
})

ArticleCard.displayName = 'ArticleCard'
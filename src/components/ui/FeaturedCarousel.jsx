import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Play, Sparkles } from 'lucide-react'

export default function FeaturedCarousel({ books }) {
    const navigate = useNavigate()
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isAutoPlaying, setIsAutoPlaying] = useState(true)

    useEffect(() => {
        if (!isAutoPlaying || books.length <= 1) return

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % books.length)
        }, 5000) // Auto-rotate every 5 seconds

        return () => clearInterval(interval)
    }, [isAutoPlaying, books.length])

    const goToNext = () => {
        setIsAutoPlaying(false)
        setCurrentIndex((prev) => (prev + 1) % books.length)
    }

    const goToPrevious = () => {
        setIsAutoPlaying(false)
        setCurrentIndex((prev) => (prev - 1 + books.length) % books.length)
    }

    const goToSlide = (index) => {
        setIsAutoPlaying(false)
        setCurrentIndex(index)
    }

    if (!books || books.length === 0) return null

    const currentBook = books[currentIndex]

    return (
        <div 
            className="relative rounded-xl overflow-hidden shadow-2xl"
            style={{ height: '280px' }}
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
        >
            {/* Background Image with Gradient Overlay */}
            <div className="absolute inset-0">
                <img
                    src={currentBook.cover_url || '/placeholder.jpg'}
                    alt={currentBook.title}
                    className="w-full h-full object-cover blur-sm scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/40" />
            </div>

            {/* Content */}
            <div className="relative h-full flex items-center">
                <div className="container mx-auto px-6 md:px-12 flex items-center gap-6 md:gap-8">
                    {/* Book Cover */}
                    <div className="flex-shrink-0">
                        <div className="w-32 h-44 md:w-40 md:h-56 rounded-lg overflow-hidden shadow-2xl">
                            <img
                                src={currentBook.cover_url || '/placeholder.jpg'}
                                alt={currentBook.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>

                    {/* Book Info */}
                    <div className="flex-1 min-w-0">
                        <h2 className="text-2xl md:text-4xl font-medium text-white mb-2 md:mb-3 line-clamp-2">
                            {currentBook.title}
                        </h2>
                        
                        <p className="text-white/70 text-sm md:text-base mb-3 md:mb-4 font-light">
                            {currentBook.author}
                        </p>

                        {currentBook.blurb && (
                            <p className="text-white/60 text-xs md:text-sm line-clamp-2 mb-4 max-w-2xl font-light">
                                {currentBook.blurb}
                            </p>
                        )}

                        <button
                            onClick={() => navigate(`/book/${currentBook.id}`)}
                            className="flex items-center gap-3 px-6 md:px-8 py-3 bg-white hover:bg-opacity-90 text-black font-medium rounded-full transition-all hover:scale-105 shadow-lg"
                        >
                            <Play className="w-5 h-5 fill-black" />
                            <span>Listen Now</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Navigation Arrows */}
            {books.length > 1 && (
                <>
                    <button
                        onClick={goToPrevious}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/80 rounded-full flex items-center justify-center transition-all z-10"
                    >
                        <ChevronLeft className="w-6 h-6 text-white" />
                    </button>
                    <button
                        onClick={goToNext}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/80 rounded-full flex items-center justify-center transition-all z-10"
                    >
                        <ChevronRight className="w-6 h-6 text-white" />
                    </button>
                </>
            )}

            {/* Dots Indicator */}
            {books.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                    {books.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={`transition-all ${
                                index === currentIndex
                                    ? 'w-8 h-2 bg-white rounded-full'
                                    : 'w-2 h-2 bg-white/50 rounded-full hover:bg-white/80'
                            }`}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

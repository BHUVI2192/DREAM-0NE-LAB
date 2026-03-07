import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function FeaturedCarousel({ books }) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isPaused, setIsPaused] = useState(false)
    const navigate = useNavigate()

    // Auto-advance every 5 seconds
    useEffect(() => {
        if (isPaused || books.length === 0) return

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % books.length)
        }, 5000)

        return () => clearInterval(interval)
    }, [isPaused, books.length])

    if (!books || books.length === 0) return null

    return (
        <div
            className="relative w-full h-[220px] md:h-[280px] rounded-card overflow-hidden cursor-pointer"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onClick={() => navigate(`/book/${books[currentIndex].id}`)}
        >
            {/* Background Image with Blur */}
            <div className="absolute inset-0">
                <img
                    src={books[currentIndex]?.cover_url || '/placeholder.jpg'}
                    alt={books[currentIndex]?.title}
                    className="w-full h-full object-cover blur-md scale-110"
                />
                <div className="absolute inset-0 bg-black/50" />
            </div>

            {/* Content */}
            <div className="relative h-full flex items-center justify-between px-8 md:px-12">
                <div className="flex-1">
                    <h3 className="font-display text-3xl md:text-4xl text-white mb-2 line-clamp-2">
                        {books[currentIndex]?.title}
                    </h3>
                    <p className="text-text-secondary mb-4">
                        {books[currentIndex]?.author}
                    </p>
                    <div className="flex gap-2">
                        {books[currentIndex]?.genre && (
                            <span className="px-3 py-1 bg-accent/20 text-accent text-xs rounded-full">
                                {books[currentIndex].genre}
                            </span>
                        )}
                    </div>
                </div>

                {/* Cover Image on Right */}
                <div className="hidden md:block w-48 h-52">
                    <img
                        src={books[currentIndex]?.cover_url || '/placeholder.jpg'}
                        alt={books[currentIndex]?.title}
                        className="w-full h-full object-cover rounded-lg shadow-2xl"
                    />
                </div>
            </div>

            {/* Dot Indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {books.map((_, index) => (
                    <button
                        key={index}
                        onClick={(e) => {
                            e.stopPropagation()
                            setCurrentIndex(index)
                        }}
                        className={`w-2 h-2 rounded-full transition-all ${
                            index === currentIndex ? 'bg-accent w-6' : 'bg-white/30'
                        }`}
                    />
                ))}
            </div>
        </div>
    )
}

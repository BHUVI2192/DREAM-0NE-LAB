import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function FeaturedCarousel({ books }) {
    const [currentIndex, setCurrentIndex] = useState(0)

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % books.length)
    }

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + books.length) % books.length)
    }

    if (!books || books.length === 0) return null

    const currentBook = books[currentIndex]

    return (
        <div className="relative h-96 rounded-3xl overflow-hidden bg-gradient-to-br from-accent/20 to-purple-900/20">
            <img
                src={currentBook.cover_url}
                alt={currentBook.title}
                className="absolute inset-0 w-full h-full object-cover opacity-30 blur-xl"
            />

            <div className="relative h-full flex items-center justify-between px-12">
                <button
                    onClick={prevSlide}
                    className="p-3 bg-black/50 hover:bg-black/70 rounded-full transition"
                >
                    <ChevronLeft className="w-6 h-6 text-white" />
                </button>

                <div className="text-center">
                    <h2 className="font-display text-4xl font-bold text-white mb-4">
                        {currentBook.title}
                    </h2>
                    <p className="text-text-secondary text-lg mb-2">{currentBook.author}</p>
                    <span className="inline-block px-4 py-2 bg-accent/20 text-accent rounded-full text-sm font-semibold">
                        {currentBook.genre}
                    </span>
                </div>

                <button
                    onClick={nextSlide}
                    className="p-3 bg-black/50 hover:bg-black/70 rounded-full transition"
                >
                    <ChevronRight className="w-6 h-6 text-white" />
                </button>
            </div>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                {books.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`w-2 h-2 rounded-full transition ${
                            index === currentIndex ? 'bg-accent w-8' : 'bg-white/30'
                        }`}
                    />
                ))}
            </div>
        </div>
    )
}

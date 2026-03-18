import { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function HorizontalShelf({ title, icon: Icon, children, showNavigation = true }) {
    const scrollRef = useRef(null)

    const scroll = (direction) => {
        if (scrollRef.current) {
            const scrollAmount = scrollRef.current.offsetWidth * 0.8
            scrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth',
            })
        }
    }

    return (
        <section className="mb-16">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-6 px-4 md:px-6">
                <div className="flex items-center gap-3">
                    {Icon && <Icon className="w-6 h-6 text-spotify-text shrink-0" />}
                    <h2 className="text-2xl font-bold text-white tracking-tight hover:underline cursor-pointer">
                        {title}
                    </h2>
                </div>
                {showNavigation && (
                    <div className="hidden md:flex gap-2">
                        <button
                            onClick={() => scroll('left')}
                            className="w-10 h-10 flex items-center justify-center bg-spotify-black bg-opacity-60 hover:bg-opacity-100 rounded-full transition-all"
                        >
                            <ChevronLeft className="w-5 h-5 text-spotify-text" />
                        </button>
                        <button
                            onClick={() => scroll('right')}
                            className="w-10 h-10 flex items-center justify-center bg-spotify-black bg-opacity-60 hover:bg-opacity-100 rounded-full transition-all"
                        >
                            <ChevronRight className="w-5 h-5 text-spotify-text" />
                        </button>
                    </div>
                )}
            </div>

            {/* Scrollable Content */}
            <div
                ref={scrollRef}
                className="flex gap-6 overflow-x-auto px-4 md:px-6 pb-4 scrollbar-hide"
                style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                }}
            >
                {children}
            </div>
        </section>
    )
}

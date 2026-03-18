import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Play, Sparkles } from 'lucide-react'

export default function SpotifyBookCard({ book, showPlayButton = true }) {
    const navigate = useNavigate()
    const [isHovered, setIsHovered] = useState(false)
    const episodeCount = Number.isFinite(book?.episode_count) ? book.episode_count : null

    return (
        <div
            onClick={() => navigate(`/book/${book.id}`)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="group p-3 sm:p-4 bg-transparent rounded-md hover:bg-[#1f1f1f] transition duration-300 cursor-pointer"
        >
            {/* Cover Image */}
            <div className="relative aspect-square mb-4 overflow-hidden rounded-md shadow-lg">
                <img
                    src={book.cover_url || '/placeholder.jpg'}
                    alt={book.title}
                    className="w-full h-full object-cover"
                />

                
                {/* Play Button on Hover */}
                {showPlayButton && (
                    <div
                        className={`absolute bottom-2 right-2 transition-all duration-300 shadow-2xl ${
                            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                        }`}
                    >
                        <div className="w-12 h-12 bg-spotify-green hover:bg-[#1fdf64] hover:scale-105 rounded-full flex items-center justify-center shadow-[0_8px_16px_rgba(0,0,0,0.6)] transition-transform duration-200">
                            <Play className="w-6 h-6 text-black fill-black ml-1" />
                        </div>
                    </div>
                )}
            </div>

            {/* Book Info */}
            <div className="space-y-1">
                <h3 className="font-medium text-spotify-text text-sm leading-tight line-clamp-2 group-hover:underline">
                    {book.title}
                </h3>
                <p className="text-gray-400 text-sm line-clamp-1 font-light">
                    {book.author}
                </p>
                {episodeCount > 0 && (
                    <p className="text-spotify-muted text-xs">
                        {episodeCount} episode{episodeCount !== 1 ? 's' : ''}
                    </p>
                )}
            </div>
        </div>
    )
}

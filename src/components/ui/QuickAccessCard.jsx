import { useNavigate } from 'react-router-dom'
import { Play } from 'lucide-react'
import { getEpisodeArtwork } from '../../lib/media'

export default function QuickAccessCard({ book, episode, progress: _progress = 0 }) {
    const navigate = useNavigate()

    const handleClick = () => {
        navigate(`/book/${book.id}`)
    }

    return (
        <div
            onClick={handleClick}
            className="group flex items-center gap-3 bg-white/5 hover:bg-white/10 rounded overflow-hidden cursor-pointer transition-colors h-20 shadow-sm"
        >
            {/* Book Cover */}
            <div className="relative flex-shrink-0 w-20 h-20">
                <img
                    src={getEpisodeArtwork(episode, book)}
                    alt={episode?.title || book.title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-20 transition-all" />
            </div>

            {/* Book Title */}
            <div className="flex-1 min-w-0 pr-3">
                <h3 className="font-bold text-spotify-text text-sm leading-tight line-clamp-2">
                    {book.title}
                </h3>
                {episode && (
                    <p className="text-spotify-subtext text-xs mt-0.5 truncate">
                        Ep {episode.episode_number}: {episode.title}
                    </p>
                )}
            </div>

            {/* Play Button */}
            <div
                className="opacity-0 translate-y-2 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 mr-4 shadow-xl"
            >
                <div className="w-10 h-10 bg-spotify-green hover:bg-[#1fdf64] hover:scale-105 rounded-full flex items-center justify-center shadow-lg transition-all">
                    <Play className="w-5 h-5 text-black fill-black ml-0.5" />
                </div>
            </div>
        </div>
    )
}

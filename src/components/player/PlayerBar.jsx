import { Play, Pause, SkipBack, SkipForward } from 'lucide-react'
import usePlayer from '../../hooks/usePlayer'
import useAudioEngine from '../../hooks/useAudioEngine'
import { useNavigate } from 'react-router-dom'

export default function PlayerBar() {
    const navigate = useNavigate()
    const { currentEpisode, isPlaying, currentTime, duration, togglePlay, playNext, playPrevious } = usePlayer()
    const { seek } = useAudioEngine()

    if (!currentEpisode) return null

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60)
        const secs = Math.floor(seconds % 60)
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-bg-elevated border-t border-border-subtle backdrop-blur-xl z-40">
            <div
                className="absolute top-0 left-0 h-1 bg-accent transition-all"
                style={{ width: `${progress}%` }}
            />

            <div className="flex items-center gap-4 px-6 py-3">
                <img
                    src={currentEpisode.book?.cover_url || 'https://via.placeholder.com/60'}
                    alt={currentEpisode.title}
                    className="w-14 h-14 rounded-lg object-cover cursor-pointer"
                    onClick={() => navigate(`/player`)}
                />

                <div className="flex-1 min-w-0">
                    <h4 className="text-white font-semibold text-sm truncate">{currentEpisode.title}</h4>
                    <p className="text-text-muted text-xs truncate">
                        {currentEpisode.book?.title || 'Unknown Book'}
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={playPrevious}
                        className="p-2 text-text-muted hover:text-white transition"
                    >
                        <SkipBack className="w-5 h-5" />
                    </button>

                    <button
                        onClick={togglePlay}
                        className="p-3 bg-accent text-white rounded-full hover:bg-accent/90 transition"
                    >
                        {isPlaying ? (
                            <Pause className="w-5 h-5" />
                        ) : (
                            <Play className="w-5 h-5 ml-0.5" />
                        )}
                    </button>

                    <button
                        onClick={playNext}
                        className="p-2 text-text-muted hover:text-white transition"
                    >
                        <SkipForward className="w-5 h-5" />
                    </button>
                </div>

                <div className="hidden md:flex items-center gap-2 text-xs text-text-muted">
                    <span>{formatTime(currentTime)}</span>
                    <span>/</span>
                    <span>{formatTime(duration)}</span>
                </div>
            </div>
        </div>
    )
}

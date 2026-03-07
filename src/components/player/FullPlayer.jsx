import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react'
import usePlayer from '../../hooks/usePlayer'
import useAudioEngine from '../../hooks/useAudioEngine'

export default function FullPlayer() {
    const { currentEpisode, isPlaying, currentTime, duration, togglePlay, playNext, playPrevious } = usePlayer()
    const { seek } = useAudioEngine()

    if (!currentEpisode) {
        return (
            <div className="min-h-screen bg-bg-primary flex items-center justify-center">
                <p className="text-text-muted">No episode playing</p>
            </div>
        )
    }

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60)
        const secs = Math.floor(seconds % 60)
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    const handleSeek = (e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const x = e.clientX - rect.left
        const percentage = x / rect.width
        seek(percentage * duration)
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-bg-primary to-bg-secondary flex items-center justify-center p-6">
            <div className="w-full max-w-md">
                <img
                    src={currentEpisode.book?.cover_url || 'https://via.placeholder.com/400'}
                    alt={currentEpisode.title}
                    className="w-full aspect-square rounded-3xl shadow-2xl mb-8 object-cover"
                />

                <div className="text-center mb-8">
                    <h1 className="font-display text-2xl font-bold text-white mb-2">
                        {currentEpisode.title}
                    </h1>
                    <p className="text-text-muted">{currentEpisode.book?.title || 'Unknown Book'}</p>
                </div>

                <div className="mb-8">
                    <div
                        onClick={handleSeek}
                        className="h-2 bg-bg-secondary rounded-full cursor-pointer mb-2"
                    >
                        <div
                            className="h-full bg-accent rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <div className="flex justify-between text-xs text-text-muted">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                    </div>
                </div>

                <div className="flex items-center justify-center gap-6 mb-8">
                    <button
                        onClick={playPrevious}
                        className="p-3 text-text-muted hover:text-white transition"
                    >
                        <SkipBack className="w-7 h-7" />
                    </button>

                    <button
                        onClick={togglePlay}
                        className="p-5 bg-accent text-white rounded-full hover:bg-accent/90 transition shadow-lg"
                    >
                        {isPlaying ? (
                            <Pause className="w-8 h-8" />
                        ) : (
                            <Play className="w-8 h-8 ml-1" />
                        )}
                    </button>

                    <button
                        onClick={playNext}
                        className="p-3 text-text-muted hover:text-white transition"
                    >
                        <SkipForward className="w-7 h-7" />
                    </button>
                </div>
            </div>
        </div>
    )
}

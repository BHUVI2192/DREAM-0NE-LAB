import { Play, Pause, SkipBack, SkipForward, Volume2, ChevronDown } from 'lucide-react'
import usePlayerStore from '../../store/playerStore'

/**
 * FullPlayer — expanded full-screen player view.
 * Used in /book/:bookId/episode/:epId route.
 */
export default function FullPlayer({ onClose }) {
    const { currentEpisode, currentBook, isPlaying, currentTime, duration, volume, actions } = usePlayerStore()

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0

    const formatTime = (s) => {
        const m = Math.floor(s / 60)
        const sec = Math.floor(s % 60)
        return `${m}:${sec.toString().padStart(2, '0')}`
    }

    return (
        <div
            className="flex flex-col min-h-screen px-6 py-8 gap-6"
            style={{ background: 'var(--bg-primary)' }}
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
                    <ChevronDown size={24} />
                </button>
                <span className="text-sm font-medium text-text-secondary">Now Playing</span>
                <div className="w-8" />
            </div>

            {/* Cover Art */}
            <div
                className="w-full aspect-square rounded-2xl overflow-hidden mx-auto max-w-xs"
                style={{ boxShadow: 'var(--shadow-glow)', background: 'var(--bg-elevated)' }}
            >
                {currentBook?.cover_url && (
                    <img src={currentBook.cover_url} alt={currentBook.title} className="w-full h-full object-cover" />
                )}
            </div>

            {/* Track Info */}
            <div className="text-center space-y-1">
                <h2 className="font-display text-xl font-bold text-text-primary">{currentEpisode?.title}</h2>
                <p className="text-text-muted text-sm">{currentBook?.title}</p>
            </div>

            {/* Progress */}
            <div className="space-y-2">
                <div
                    className="h-1.5 w-full rounded-full overflow-hidden cursor-pointer"
                    style={{ background: 'var(--border-subtle)' }}
                >
                    <div
                        className="h-full rounded-full"
                        style={{ width: `${progress}%`, background: 'var(--accent)' }}
                    />
                </div>
                <div className="flex justify-between text-xs text-text-muted">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-6">
                <button onClick={actions.skipBack} style={{ color: 'var(--text-secondary)' }} aria-label="Skip back 15s">
                    <SkipBack size={28} />
                </button>
                <button
                    onClick={actions.togglePlay}
                    className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{ background: 'var(--accent)', boxShadow: 'var(--shadow-glow)' }}
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                    {isPlaying ? <Pause size={28} fill="#fff" color="#fff" /> : <Play size={28} fill="#fff" color="#fff" />}
                </button>
                <button onClick={actions.skipForward} style={{ color: 'var(--text-secondary)' }} aria-label="Skip forward 15s">
                    <SkipForward size={28} />
                </button>
            </div>

            {/* Volume */}
            <div className="flex items-center gap-3">
                <Volume2 size={18} style={{ color: 'var(--text-muted)' }} />
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={volume}
                    onChange={(e) => actions.setVolume(Number(e.target.value))}
                    className="flex-1"
                    aria-label="Volume"
                />
            </div>
        </div>
    )
}

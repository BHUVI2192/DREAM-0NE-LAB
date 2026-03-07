import { Play, Lock } from 'lucide-react'

export default function EpisodeRow({ episode, isLocked, onPlay, onUnlock, currentlyPlaying }) {
    const isCurrentlyPlaying = currentlyPlaying?.id === episode.id

    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    return (
        <div
            className={`relative flex items-start gap-4 p-4 rounded-xl border transition-all ${
                isCurrentlyPlaying 
                    ? 'bg-accent/10 border-accent' 
                    : isLocked
                        ? 'bg-bg-secondary/50 border-border-subtle cursor-default'
                        : 'bg-bg-elevated border-border-subtle hover:border-accent cursor-pointer'
            }`}
        >
            {/* Locked Overlay */}
            {isLocked && (
                <div className="absolute inset-0 bg-[#0A0A0F]/60 rounded-xl pointer-events-none" />
            )}

            {/* Episode Number Circle */}
            <div className="relative flex-shrink-0 w-7 h-7 rounded-full bg-bg-elevated border border-border-subtle flex items-center justify-center">
                <span className="font-mono text-xs text-white">{episode.episode_number}</span>
            </div>

            {/* Episode Info */}
            <div className="relative flex-1 min-w-0">
                <h4 className="text-white font-medium mb-1 line-clamp-1">{episode.title}</h4>
                {episode.description && (
                    <p className="text-text-secondary text-sm mb-2 line-clamp-2">
                        {episode.description}
                    </p>
                )}
                {episode.duration_seconds && (
                    <div className="font-mono text-xs text-text-muted">
                        {formatDuration(episode.duration_seconds)}
                    </div>
                )}
            </div>

            {/* Action Button */}
            <div className="relative flex-shrink-0">
                {isLocked ? (
                    <button
                        onClick={onUnlock}
                        className="p-3 bg-bg-secondary border border-border-subtle rounded-full hover:border-accent transition-colors"
                    >
                        <Lock className="w-4 h-4 text-accent" />
                    </button>
                ) : (
                    <button
                        onClick={() => onPlay(episode)}
                        className="p-3 bg-accent/20 border border-accent/50 rounded-full hover:bg-accent/30 transition-colors"
                    >
                        <Play className="w-4 h-4 text-accent fill-accent" />
                    </button>
                )}
            </div>
        </div>
    )
}

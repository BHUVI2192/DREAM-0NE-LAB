import { Play, DownloadCloud, Loader2 } from 'lucide-react'
import { useState } from 'react'

export default function EpisodeRow({ episode, onPlay, onDownload, currentlyPlaying }) {
    const isCurrentlyPlaying = currentlyPlaying?.id === episode.id
    const [isDownloading, setIsDownloading] = useState(false)
    const [progress, setProgress] = useState(0)

    const handleDownloadClick = async (e) => {
        e.stopPropagation()
        if (isDownloading) return

        setIsDownloading(true)
        setProgress(0)
        
        if (onDownload) {
            await onDownload(episode, setProgress)
        }
        
        setIsDownloading(false)
    }


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
                    : 'bg-bg-elevated border-border-subtle hover:border-accent cursor-pointer'
            }`}
        >

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

            {/* Action Buttons */}
            <div className="relative flex-shrink-0 flex items-center gap-2">
                <button
                    onClick={handleDownloadClick}
                    disabled={isDownloading}
                    className="p-3 bg-transparent hover:bg-white/10 text-spotify-subtext hover:text-white rounded-full transition-colors disabled:opacity-50"
                    title="Download episode"
                >
                    {isDownloading ? (
                        <div className="relative flex items-center justify-center">
                            <Loader2 className="w-5 h-5 animate-spin text-accent" />
                            <span className="absolute text-[8px] font-bold text-white">{progress}%</span>
                        </div>
                    ) : (
                        <DownloadCloud className="w-5 h-5" />
                    )}
                </button>

                <button
                    onClick={() => onPlay(episode)}
                    className="p-3 bg-accent/20 border border-accent/50 rounded-full hover:bg-accent/30 transition-colors"
                >
                    <Play className="w-4 h-4 text-accent fill-accent" />
                </button>
            </div>
        </div>
    )
}

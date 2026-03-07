import { Play, Lock } from 'lucide-react'

export default function EpisodeRow({ episode, isLocked, onPlay }) {
    return (
        <div
            onClick={() => !isLocked && onPlay(episode)}
            className={`flex items-center gap-4 p-4 rounded-xl transition ${
                isLocked
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-bg-elevated cursor-pointer'
            }`}
        >
            <div className="flex-shrink-0 w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center">
                {isLocked ? (
                    <Lock className="w-5 h-5 text-accent" />
                ) : (
                    <Play className="w-5 h-5 text-accent" />
                )}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-text-muted text-sm font-semibold">
                        Ep {episode.episode_number}
                    </span>
                    {isLocked && (
                        <span className="text-xs px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded">
                            Locked
                        </span>
                    )}
                </div>
                <h4 className="text-white font-medium truncate">{episode.title}</h4>
                {episode.duration && (
                    <p className="text-text-muted text-sm">{episode.duration}</p>
                )}
            </div>
        </div>
    )
}

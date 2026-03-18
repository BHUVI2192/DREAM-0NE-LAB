import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { SkipBack, SkipForward, Play, Pause, ChevronUp } from 'lucide-react'
import useAudioEngine from '../../hooks/useAudioEngine'

export default function PlayerBar() {
    const navigate = useNavigate()
    const {
        currentEpisode,
        currentBook,
        isPlaying,
        currentTime,
        duration,
        togglePlay,
        skipForward,
        skipBack,
        seek
    } = useAudioEngine()

    const [isVisible, setIsVisible] = useState(false)
    const progressBarRef = useRef(null)

    // Trigger slide-up animation when an episode is first loaded
    useEffect(() => {
        if (currentEpisode && !isVisible) {
            requestAnimationFrame(() => setIsVisible(true))
        } else if (!currentEpisode) {
            setIsVisible(false)
        }
    }, [currentEpisode, isVisible])

    if (!currentEpisode || !currentBook) return null

    // Format time (MM:SS)
    const formatTime = (seconds) => {
        if (!seconds || isNaN(seconds)) return '0:00'
        const mins = Math.floor(seconds / 60)
        const secs = Math.floor(seconds % 60)
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0

    // Handle clicking on the progress bar to seek
    const handleProgressClick = (e) => {
        if (!progressBarRef.current || !duration) return

        const rect = progressBarRef.current.getBoundingClientRect()
        const clickX = e.clientX - rect.left
        const percentage = clickX / rect.width
        const newTime = percentage * duration

        seek(newTime)
    }

    const handleExpand = () => {
        navigate(`/book/${currentBook.id}/episode/${currentEpisode.id}`)
    }

    return (
        <div
            className={`fixed left-0 right-0 z-40 bg-elevated border-t border-subtle shadow-player transition-transform duration-300 ease-out
                ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}
            style={{ bottom: '64px' }} // Above mobile nav
        >
            {/* Top edge progress bar (clickable) */}
            <div
                ref={progressBarRef}
                className="absolute top-0 left-0 right-0 h-1 bg-subtle/30 cursor-pointer group"
                onClick={handleProgressClick}
            >
                <div
                    className="h-full bg-accent transition-all duration-100 ease-linear group-hover:bg-accent-light"
                    style={{ width: `${progressPercent}%` }}
                />
            </div>

            {/* The main bar content (72px height) */}
            <div className="h-[72px] flex items-center justify-between px-4 max-w-7xl mx-auto">

                {/* 1. LEFT: Cover & Metadata */}
                <div
                    className="flex items-center gap-3 w-1/3 min-w-0 cursor-pointer"
                    onClick={handleExpand}
                >
                    <div className="w-10 h-10 rounded-md overflow-hidden bg-white/5 flex-shrink-0">
                        {currentBook.cover_url ? (
                            <img
                                src={currentBook.cover_url}
                                alt="Cover"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-accent/20" />
                        )}
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-[13px] font-medium text-primary truncate">
                            {currentEpisode.title}
                        </span>
                        <span className="text-[11px] text-secondary truncate">
                            {currentBook.title}
                        </span>
                    </div>
                </div>

                {/* 2. CENTER: Controls */}
                <div className="flex items-center justify-center gap-4 w-1/3">
                    <button
                        onClick={skipBack}
                        className="text-secondary hover:text-primary transition-colors p-2"
                        aria-label="Skip back 15 seconds"
                    >
                        <SkipBack size={20} />
                    </button>

                    <button
                        onClick={togglePlay}
                        className="w-11 h-11 rounded-full bg-accent text-white flex items-center justify-center hover:bg-accent-hover transition-colors flex-shrink-0"
                        aria-label={isPlaying ? "Pause" : "Play"}
                    >
                        {isPlaying ? (
                            <Pause size={20} className="fill-current" />
                        ) : (
                            <Play size={20} className="fill-current ml-1" />
                        )}
                    </button>

                    <button
                        onClick={skipForward}
                        className="text-secondary hover:text-primary transition-colors p-2"
                        aria-label="Skip forward 15 seconds"
                    >
                        <SkipForward size={20} />
                    </button>
                </div>

                {/* 3. RIGHT: Progress Text & Expand */}
                <div className="flex items-center justify-end gap-3 w-1/3">
                    <span className="font-mono text-[10px] text-muted tabular-nums hidden sm:block">
                        {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                    <button
                        onClick={handleExpand}
                        className="text-secondary hover:text-primary transition-colors p-2"
                        aria-label="Expand player"
                    >
                        <ChevronUp size={24} />
                    </button>
                </div>
            </div>
        </div>
    )
}

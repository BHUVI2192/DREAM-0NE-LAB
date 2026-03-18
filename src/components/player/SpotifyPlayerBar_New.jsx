import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
    Play, 
    Pause, 
    Shuffle, 
    Repeat, 
    Volume2, 
    VolumeX,
    Plus,
    ListMusic,
    RotateCcw
} from 'lucide-react'
import useAudioEngine from '../../hooks/useAudioEngine'

export default function SpotifyPlayerBar() {
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
        seek,
        volume,
        setVolume
    } = useAudioEngine()

    const [isVisible, setIsVisible] = useState(false)
    const [playbackSpeed, setPlaybackSpeed] = useState(1.0)
    const [showSpeedMenu, setShowSpeedMenu] = useState(false)
    const [isMuted, setIsMuted] = useState(false)
    const [previousVolume, setPreviousVolume] = useState(1)
    const [isHoveringProgress, setIsHoveringProgress] = useState(false)
    const [isHoveringVolume, setIsHoveringVolume] = useState(false)
    const progressBarRef = useRef(null)
    const volumeBarRef = useRef(null)

    const speeds = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0]

    useEffect(() => {
        if (currentEpisode && !isVisible) {
            requestAnimationFrame(() => setIsVisible(true))
        } else if (!currentEpisode) {
            setIsVisible(false)
        }
    }, [currentEpisode, isVisible])

    // Apply playback speed to audio element
    useEffect(() => {
        const audioElement = document.querySelector('audio')
        if (audioElement) {
            audioElement.playbackRate = playbackSpeed
        }
    }, [playbackSpeed])

    if (!currentEpisode || !currentBook) return null

    const formatTime = (seconds) => {
        if (!seconds || isNaN(seconds)) return '0:00'
        const mins = Math.floor(seconds / 60)
        const secs = Math.floor(seconds % 60)
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0

    const handleProgressClick = (e) => {
        if (!progressBarRef.current || !duration) return
        const rect = progressBarRef.current.getBoundingClientRect()
        const clickX = e.clientX - rect.left
        const percentage = Math.max(0, Math.min(1, clickX / rect.width))
        const newTime = percentage * duration
        seek(newTime)
    }

    const handleVolumeClick = (e) => {
        if (!volumeBarRef.current) return
        const rect = volumeBarRef.current.getBoundingClientRect()
        const clickX = e.clientX - rect.left
        const percentage = Math.max(0, Math.min(1, clickX / rect.width))
        setVolume(percentage)
        setIsMuted(percentage === 0)
    }

    const handleSpeedChange = (speed) => {
        setPlaybackSpeed(speed)
        setShowSpeedMenu(false)
    }

    const toggleMute = () => {
        if (isMuted) {
            setVolume(previousVolume)
            setIsMuted(false)
        } else {
            setPreviousVolume(volume)
            setVolume(0)
            setIsMuted(true)
        }
    }

    return (
        <>
            {/* Desktop Player - Spotify Style */}
            <div
                className={`hidden md:block fixed bottom-0 left-0 right-0 z-[100] bg-[#181818] border-t border-[#282828] transition-transform duration-300 ${
                    isVisible ? 'translate-y-0' : 'translate-y-full'
                }`}
                style={{ height: '96px' }}
            >
                <div className="flex justify-between items-center px-4 h-full">
                    {/* LEFT SECTION - Now Playing Info (30%) */}
                    <div className="flex items-center gap-3 w-[30%] min-w-0">
                        <img
                            src={currentBook.cover_url || '/placeholder.jpg'}
                            alt={currentBook.title}
                            className="w-14 h-14 rounded-md object-cover flex-shrink-0 shadow-lg cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => navigate(`/book/${currentBook.id}`)}
                        />
                        <div className="flex-1 min-w-0">
                            <div 
                                className="text-white text-sm font-medium truncate cursor-pointer hover:underline"
                                onClick={() => navigate(`/book/${currentBook.id}`)}
                            >
                                {currentEpisode.title}
                            </div>
                            <div 
                                className="text-[#b3b3b3] text-xs truncate cursor-pointer hover:underline"
                                onClick={() => navigate(`/book/${currentBook.id}`)}
                            >
                                {currentBook.author}
                            </div>
                        </div>
                        <button 
                            className="text-[#b3b3b3] hover:text-white transition-colors flex-shrink-0"
                            aria-label="Add to library"
                        >
                            <Plus className="w-5 h-5" strokeWidth={2} />
                        </button>
                    </div>

                    {/* CENTER SECTION - Playback Controls (40%) */}
                    <div className="flex flex-col items-center gap-2 w-[40%]">
                        {/* Top Row - Buttons */}
                        <div className="flex items-center justify-center gap-6">
                            <button 
                                className="text-[#b3b3b3] hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                disabled
                                aria-label="Shuffle"
                            >
                                <Shuffle className="w-4 h-4" />
                            </button>
                            
                            <button 
                                onClick={skipBack}
                                className="text-[#b3b3b3] hover:text-white transition-colors"
                                aria-label="Jump back 15 seconds"
                            >
                                <RotateCcw className="w-5 h-5" />
                            </button>
                            
                            <button
                                onClick={togglePlay}
                                className="w-8 h-8 bg-white hover:scale-105 rounded-full flex items-center justify-center shadow-md transition-transform"
                                aria-label={isPlaying ? 'Pause' : 'Play'}
                            >
                                {isPlaying ? (
                                    <Pause className="w-4 h-4 text-black fill-black" />
                                ) : (
                                    <Play className="w-4 h-4 text-black fill-black ml-0.5" />
                                )}
                            </button>
                            
                            <button 
                                onClick={skipForward}
                                className="text-[#b3b3b3] hover:text-white transition-colors"
                                aria-label="Jump forward 15 seconds"
                            >
                                <RotateCcw className="w-5 h-5 scale-x-[-1]" />
                            </button>
                            
                            <button 
                                className="text-[#b3b3b3] hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                disabled
                                aria-label="Repeat"
                            >
                                <Repeat className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Bottom Row - Progress Bar */}
                        <div className="flex items-center gap-2 w-full max-w-2xl">
                            <span className="text-xs text-[#a7a7a7] w-10 text-right">{formatTime(currentTime)}</span>
                            <div
                                ref={progressBarRef}
                                onClick={handleProgressClick}
                                onMouseEnter={() => setIsHoveringProgress(true)}
                                onMouseLeave={() => setIsHoveringProgress(false)}
                                className="flex-1 h-1 bg-[#4d4d4d] rounded-full cursor-pointer group relative"
                            >
                                <div
                                    className={`h-full rounded-full relative transition-colors ${
                                        isHoveringProgress ? 'bg-[#1DB954]' : 'bg-white'
                                    }`}
                                    style={{ width: `${progressPercent}%` }}
                                >
                                    {isHoveringProgress && (
                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md" />
                                    )}
                                </div>
                            </div>
                            <span className="text-xs text-[#a7a7a7] w-10">{formatTime(duration)}</span>
                        </div>
                    </div>

                    {/* RIGHT SECTION - Extra Controls (30%) */}
                    <div className="flex items-center justify-end gap-4 w-[30%]">
                        {/* Playback Speed Button */}
                        <div className="relative">
                            <button
                                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                                className="text-[#b3b3b3] hover:text-white transition-colors text-xs font-medium px-2 py-1 rounded border border-[#4d4d4d] hover:border-white"
                            >
                                {playbackSpeed}x
                            </button>
                            {showSpeedMenu && (
                                <div className="absolute bottom-full right-0 mb-2 bg-[#282828] rounded-md shadow-xl py-1 min-w-[80px] border border-[#4d4d4d]">
                                    {speeds.map((speed) => (
                                        <button
                                            key={speed}
                                            onClick={() => handleSpeedChange(speed)}
                                            className={`w-full px-4 py-2 text-xs text-left transition-colors ${
                                                playbackSpeed === speed
                                                    ? 'bg-[#3e3e3e] text-white'
                                                    : 'text-[#b3b3b3] hover:bg-[#3e3e3e] hover:text-white'
                                            }`}
                                        >
                                            {speed}x
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Queue Icon */}
                        <button 
                            className="text-[#b3b3b3] hover:text-white transition-colors"
                            aria-label="Queue"
                        >
                            <ListMusic className="w-4 h-4" />
                        </button>

                        {/* Volume Control */}
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={toggleMute}
                                className="text-[#b3b3b3] hover:text-white transition-colors"
                                aria-label={isMuted ? 'Unmute' : 'Mute'}
                            >
                                {isMuted || volume === 0 ? (
                                    <VolumeX className="w-4 h-4" />
                                ) : (
                                    <Volume2 className="w-4 h-4" />
                                )}
                            </button>
                            <div
                                ref={volumeBarRef}
                                onClick={handleVolumeClick}
                                onMouseEnter={() => setIsHoveringVolume(true)}
                                onMouseLeave={() => setIsHoveringVolume(false)}
                                className="w-24 h-1 bg-[#4d4d4d] rounded-full cursor-pointer group relative"
                            >
                                <div
                                    className={`h-full rounded-full relative transition-colors ${
                                        isHoveringVolume ? 'bg-[#1DB954]' : 'bg-white'
                                    }`}
                                    style={{ width: `${volume * 100}%` }}
                                >
                                    {isHoveringVolume && (
                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md" />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Player - Simplified Pill Design */}
            <div
                className={`md:hidden fixed bottom-20 left-4 right-4 z-[100] bg-[#181818]/95 backdrop-blur-lg rounded-2xl shadow-2xl transition-transform duration-300 ${
                    isVisible ? 'translate-y-0' : 'translate-y-full'
                }`}
            >
                <div className="p-3">
                    <div className="flex items-center gap-3 mb-2">
                        <img
                            src={currentBook.cover_url || '/placeholder.jpg'}
                            alt={currentBook.title}
                            className="w-12 h-12 rounded-md object-cover flex-shrink-0 shadow-md"
                            onClick={() => navigate(`/book/${currentBook.id}`)}
                        />
                        <div className="flex-1 min-w-0">
                            <div className="text-white text-sm font-medium truncate">
                                {currentEpisode.title}
                            </div>
                            <div className="text-[#b3b3b3] text-xs truncate">
                                {currentBook.author}
                            </div>
                        </div>
                        <button
                            onClick={togglePlay}
                            className="w-10 h-10 bg-white hover:scale-105 rounded-full flex items-center justify-center shadow-md transition-transform flex-shrink-0"
                            aria-label={isPlaying ? 'Pause' : 'Play'}
                        >
                            {isPlaying ? (
                                <Pause className="w-5 h-5 text-black fill-black" />
                            ) : (
                                <Play className="w-5 h-5 text-black fill-black ml-0.5" />
                            )}
                        </button>
                    </div>
                    
                    {/* Mobile Progress Bar */}
                    <div
                        onClick={handleProgressClick}
                        className="w-full h-1 bg-[#4d4d4d] rounded-full cursor-pointer"
                    >
                        <div
                            className="h-full bg-white rounded-full"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                </div>
            </div>
        </>
    )
}

import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    ChevronDown,
    MoreHorizontal,
    Play,
    Pause,
    RotateCcw,
    Moon,
    Plus,
    Check
} from 'lucide-react'
import useAudioEngine from '../../hooks/useAudioEngine'
import { getEpisodeArtwork } from '../../lib/media'

const SPEEDS = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0]

const SLEEP_OPTIONS = [
    { label: '5 min', seconds: 300 },
    { label: '10 min', seconds: 600 },
    { label: '15 min', seconds: 900 },
    { label: '30 min', seconds: 1800 },
    { label: '45 min', seconds: 2700 },
    { label: '1 hour', seconds: 3600 },
    { label: 'End of chapter', seconds: null },
]

export default function FullScreenPlayer({ isOpen, onClose, playbackSpeed, onSpeedChange }) {
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
    } = useAudioEngine()

    const [isSaved, setIsSaved] = useState(false)
    const [showSpeedMenu, setShowSpeedMenu] = useState(false)
    const [showSleepMenu, setShowSleepMenu] = useState(false)
    const [sleepTimer, setSleepTimer] = useState(null)   // remaining seconds
    const [sleepIntervalId, setSleepIntervalId] = useState(null)
    const [isDragging, setIsDragging] = useState(false)
    const [dragPercent, setDragPercent] = useState(null)
    const progressBarRef = useRef(null)
    const sleepRef = useRef(null)
    const speedRef = useRef(null)

    // Close menus when clicking outside
    useEffect(() => {
        const handleOutside = (e) => {
            if (sleepRef.current && !sleepRef.current.contains(e.target)) setShowSleepMenu(false)
            if (speedRef.current && !speedRef.current.contains(e.target)) setShowSpeedMenu(false)
        }
        document.addEventListener('mousedown', handleOutside)
        return () => document.removeEventListener('mousedown', handleOutside)
    }, [])

    // Keyboard: Escape to close
    useEffect(() => {
        if (!isOpen) return
        const handleKey = (e) => {
            if (e.key === 'Escape') onClose()
            if (e.key === ' ') { e.preventDefault(); togglePlay() }
        }
        document.addEventListener('keydown', handleKey)
        return () => document.removeEventListener('keydown', handleKey)
    }, [isOpen, onClose, togglePlay])

    if (!isOpen || !currentEpisode || !currentBook) return null

    const formatTime = (seconds) => {
        if (!seconds || isNaN(seconds)) return '0:00'
        const h = Math.floor(seconds / 3600)
        const m = Math.floor((seconds % 3600) / 60)
        const s = Math.floor(seconds % 60)
        if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
        return `${m}:${s.toString().padStart(2, '0')}`
    }

    const formatSleepRemaining = (s) => {
        if (!s) return ''
        const m = Math.floor(s / 60)
        const sec = s % 60
        return m > 0 ? `${m}:${sec.toString().padStart(2, '0')}` : `0:${sec.toString().padStart(2, '0')}`
    }

    const displayPercent = isDragging ? dragPercent : (duration > 0 ? (currentTime / duration) * 100 : 0)

    // --- Progress drag handlers ---
    const getSeekPercent = (e, isTouchEvent = false) => {
        if (!progressBarRef.current) return 0
        const rect = progressBarRef.current.getBoundingClientRect()
        const clientX = isTouchEvent ? e.touches[0].clientX : e.clientX
        return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    }

    const handleProgressMouseDown = (e) => {
        setIsDragging(true)
        const pct = getSeekPercent(e)
        setDragPercent(pct * 100)
    }

    const handleProgressMouseMove = (e) => {
        if (!isDragging) return
        const pct = getSeekPercent(e)
        setDragPercent(pct * 100)
    }

    const handleProgressMouseUp = (e) => {
        if (!isDragging) return
        setIsDragging(false)
        const pct = getSeekPercent(e)
        seek(pct * duration)
        setDragPercent(null)
    }

    const handleProgressTouchStart = (e) => {
        setIsDragging(true)
        const pct = getSeekPercent(e, true)
        setDragPercent(pct * 100)
    }

    const handleProgressTouchMove = (e) => {
        if (!isDragging) return
        e.preventDefault()
        const pct = getSeekPercent(e, true)
        setDragPercent(pct * 100)
    }

    const handleProgressTouchEnd = (e) => {
        if (!isDragging) return
        setIsDragging(false)
        const rect = progressBarRef.current?.getBoundingClientRect()
        if (!rect) return
        const lastTouch = e.changedTouches[0]
        const pct = Math.max(0, Math.min(1, (lastTouch.clientX - rect.left) / rect.width))
        seek(pct * duration)
        setDragPercent(null)
    }

    // --- Sleep timer ---
    const startSleepTimer = (seconds) => {
        if (sleepIntervalId) clearInterval(sleepIntervalId)
        if (!seconds) return // "End of chapter" placeholder
        setSleepTimer(seconds)
        const id = setInterval(() => {
            setSleepTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(id)
                    // pause playback when timer ends
                    const audio = window._dreamLabAudio
                    if (audio) audio.pause()
                    return null
                }
                return prev - 1
            })
        }, 1000)
        setSleepIntervalId(id)
        setShowSleepMenu(false)
    }

    const cancelSleepTimer = () => {
        if (sleepIntervalId) clearInterval(sleepIntervalId)
        setSleepTimer(null)
        setSleepIntervalId(null)
    }

    const handleGoToBook = () => {
        onClose()
        navigate(`/book/${currentBook.id}`)
    }

    return (
        <div
            className="fixed inset-0 z-[200] flex flex-col h-screen w-full overflow-hidden"
            style={{
                background: 'linear-gradient(180deg, rgba(123,94,167,0.55) 0%, rgba(60,40,100,0.35) 35%, #121212 100%)',
                backdropFilter: 'blur(40px)',
                WebkitBackdropFilter: 'blur(40px)',
            }}
            onMouseMove={handleProgressMouseMove}
            onMouseUp={handleProgressMouseUp}
        >
            {/* Subtle noise texture overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-20"
                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.75\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.4\'/%3E%3C/svg%3E")', backgroundSize: '200px' }}
            />

            {/* ── TOP NAVIGATION ──────────────────────────────── */}
            <div className="relative flex justify-between items-center px-6 pt-12 pb-4 flex-shrink-0">
                {/* Chevron Down – close / minimise */}
                <button
                    onClick={onClose}
                    className="w-10 h-10 flex items-center justify-center text-white/80 hover:text-white transition-colors rounded-full hover:bg-white/10"
                    aria-label="Close full-screen player"
                >
                    <ChevronDown className="w-7 h-7" strokeWidth={2} />
                </button>

                {/* Center – now playing context */}
                <button
                    className="flex flex-col items-center gap-0.5 max-w-[60%]"
                    onClick={handleGoToBook}
                >
                    <span className="text-[10px] tracking-widest text-gray-400 uppercase font-medium">
                        Now Playing From Audiobook
                    </span>
                    <span className="text-white text-sm font-semibold truncate max-w-full">
                        {currentBook.title}
                    </span>
                </button>

                {/* More Options */}
                <button
                    className="w-10 h-10 flex items-center justify-center text-white/80 hover:text-white transition-colors rounded-full hover:bg-white/10"
                    aria-label="More options"
                >
                    <MoreHorizontal className="w-6 h-6" />
                </button>
            </div>

            {/* ── HERO COVER ART ──────────────────────────────── */}
            <div className="flex-1 flex justify-center items-center px-8 py-4 min-h-0">
                <div
                    className="w-full max-w-sm aspect-square rounded-2xl overflow-hidden"
                    style={{
                        boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 8px 30px rgba(0,0,0,0.5)',
                        transform: isPlaying ? 'scale(1)' : 'scale(0.95)',
                        transition: 'transform 0.4s ease',
                    }}
                >
                    <img
                        src={getEpisodeArtwork(currentEpisode, currentBook)}
                        alt={currentEpisode.title}
                        className="w-full h-full object-cover"
                    />
                </div>
            </div>

            {/* ── METADATA & SAVE ─────────────────────────────── */}
            <div className="px-8 pb-4 flex-shrink-0">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <h2 className="text-2xl font-bold text-white leading-tight truncate">
                            {currentEpisode.title}
                        </h2>
                        <p className="text-lg text-gray-400 font-normal truncate mt-1">
                            {currentBook.author}
                        </p>
                    </div>
                    <button
                        onClick={() => setIsSaved(!isSaved)}
                        className={`flex-shrink-0 w-11 h-11 rounded-full border-2 flex items-center justify-center transition-all mt-1 ${
                            isSaved
                                ? 'border-[#1DB954] text-[#1DB954] hover:bg-[#1DB954]/10'
                                : 'border-white/30 text-white/60 hover:border-white hover:text-white'
                        }`}
                        aria-label={isSaved ? 'Remove from library' : 'Save to library'}
                    >
                        {isSaved ? (
                            <Check className="w-5 h-5" strokeWidth={2.5} />
                        ) : (
                            <Plus className="w-5 h-5" strokeWidth={2.5} />
                        )}
                    </button>
                </div>
            </div>

            {/* ── PROGRESS BAR ────────────────────────────────── */}
            <div className="px-8 pb-5 flex-shrink-0 select-none">
                {/* Track */}
                <div
                    ref={progressBarRef}
                    onMouseDown={handleProgressMouseDown}
                    onTouchStart={handleProgressTouchStart}
                    onTouchMove={handleProgressTouchMove}
                    onTouchEnd={handleProgressTouchEnd}
                    className="relative w-full h-2 bg-white/20 rounded-full cursor-pointer group"
                    role="slider"
                    aria-valuenow={Math.round(currentTime)}
                    aria-valuemin={0}
                    aria-valuemax={Math.round(duration)}
                >
                    {/* Filled portion */}
                    <div
                        className="absolute left-0 top-0 h-full bg-white rounded-full transition-none"
                        style={{ width: `${displayPercent}%` }}
                    />
                    {/* Thumb knob */}
                    <div
                        className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg transition-opacity ${
                            isDragging ? 'opacity-100 scale-110' : 'opacity-0 group-hover:opacity-100'
                        }`}
                        style={{
                            left: `${displayPercent}%`,
                            transform: 'translate(-50%, -50%)',
                            transition: isDragging ? 'none' : 'opacity 0.15s ease',
                        }}
                    />
                </div>
                {/* Time labels */}
                <div className="flex justify-between mt-2">
                    <span className="text-xs text-gray-400 tabular-nums">{formatTime(currentTime)}</span>
                    <span className="text-xs text-gray-400 tabular-nums">-{formatTime(Math.max(0, duration - currentTime))}</span>
                </div>
            </div>

            {/* ── MAIN CONTROLS ───────────────────────────────── */}
            <div className="flex justify-between items-center px-8 pb-14 flex-shrink-0">
                {/* 1. Playback Speed */}
                <div className="relative" ref={speedRef}>
                    <button
                        onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                        className="w-12 h-12 flex items-center justify-center text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/10"
                        aria-label="Playback speed"
                    >
                        <span className="text-sm font-semibold">{playbackSpeed}x</span>
                    </button>
                    {showSpeedMenu && (
                        <div className="absolute bottom-full left-0 mb-3 bg-[#282828] rounded-xl shadow-2xl py-2 min-w-[100px] border border-white/10 z-10">
                            <p className="text-[10px] uppercase tracking-widest text-gray-500 px-4 pt-1 pb-2">Speed</p>
                            {SPEEDS.map((s) => (
                                <button
                                    key={s}
                                    onClick={() => { onSpeedChange(s); setShowSpeedMenu(false) }}
                                    className={`w-full px-4 py-2 text-sm text-left flex items-center justify-between gap-2 transition-colors ${
                                        playbackSpeed === s
                                            ? 'text-[#1DB954]'
                                            : 'text-[#b3b3b3] hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    <span>{s}x</span>
                                    {playbackSpeed === s && <Check className="w-3.5 h-3.5" />}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* 2. Jump Back 15s */}
                <button
                    onClick={skipBack}
                    className="flex flex-col items-center gap-1 text-white/80 hover:text-white transition-colors group"
                    aria-label="Jump back 15 seconds"
                >
                    <div className="w-14 h-14 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors relative">
                        <RotateCcw className="w-9 h-9" strokeWidth={1.5} />
                        <span className="absolute text-[9px] font-bold text-white mt-0.5">15</span>
                    </div>
                </button>

                {/* 3. Play / Pause – Focal Point */}
                <button
                    onClick={togglePlay}
                    className="w-20 h-20 bg-white hover:scale-105 active:scale-95 rounded-full flex items-center justify-center shadow-2xl transition-transform"
                    style={{
                        boxShadow: '0 0 40px rgba(255,255,255,0.15), 0 8px 24px rgba(0,0,0,0.4)'
                    }}
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                    {isPlaying ? (
                        <Pause className="w-9 h-9 text-black fill-black" />
                    ) : (
                        <Play className="w-9 h-9 text-black fill-black ml-1" />
                    )}
                </button>

                {/* 4. Jump Forward 15s */}
                <button
                    onClick={skipForward}
                    className="flex flex-col items-center gap-1 text-white/80 hover:text-white transition-colors"
                    aria-label="Jump forward 15 seconds"
                >
                    <div className="w-14 h-14 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors relative">
                        <RotateCcw className="w-9 h-9 scale-x-[-1]" strokeWidth={1.5} />
                        <span className="absolute text-[9px] font-bold text-white mt-0.5">15</span>
                    </div>
                </button>

                {/* 5. Sleep Timer */}
                <div className="relative" ref={sleepRef}>
                    <button
                        onClick={() => {
                            if (sleepTimer) { cancelSleepTimer(); return }
                            setShowSleepMenu(!showSleepMenu)
                        }}
                        className={`w-12 h-12 flex flex-col items-center justify-center rounded-full transition-colors hover:bg-white/10 ${
                            sleepTimer ? 'text-[#1DB954]' : 'text-gray-400 hover:text-white'
                        }`}
                        aria-label={sleepTimer ? `Cancel sleep timer (${formatSleepRemaining(sleepTimer)})` : 'Set sleep timer'}
                    >
                        <Moon className="w-5 h-5" />
                        {sleepTimer && (
                            <span className="text-[9px] font-semibold leading-none mt-0.5 tabular-nums">
                                {formatSleepRemaining(sleepTimer)}
                            </span>
                        )}
                    </button>
                    {showSleepMenu && !sleepTimer && (
                        <div className="absolute bottom-full right-0 mb-3 bg-[#282828] rounded-xl shadow-2xl py-2 min-w-[140px] border border-white/10 z-10">
                            <p className="text-[10px] uppercase tracking-widest text-gray-500 px-4 pt-1 pb-2">Sleep Timer</p>
                            {SLEEP_OPTIONS.map((opt) => (
                                <button
                                    key={opt.label}
                                    onClick={() => startSleepTimer(opt.seconds)}
                                    className="w-full px-4 py-2 text-sm text-left text-[#b3b3b3] hover:text-white hover:bg-white/5 transition-colors"
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

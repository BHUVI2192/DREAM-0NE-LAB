import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronDown, Download, MoreVertical, Clock, ListMusic } from 'lucide-react'
import { supabase } from '../lib/supabase'
import useAudioEngine from '../hooks/useAudioEngine'
import usePlayerStore from '../store/playerStore'
import useBookAccess from '../hooks/useBookAccess'
import { canAccessEpisode } from '../lib/episodeAccess'
import { downloadEpisode } from '../lib/downloads'
import { getEpisodeArtwork } from '../lib/media'

export default function Player() {
    const { bookId, epId } = useParams()
    const navigate = useNavigate()
    const { 
        currentEpisode, 
        currentBook, 
        isPlaying, 
        currentTime, 
        duration, 
        volume, 
        playbackRate 
    } = usePlayerStore()
    
    const { 
        loadEpisode, 
        togglePlay, 
        seek, 
        skipForward, 
        skipBack, 
        setVolume, 
        setPlaybackRate 
    } = useAudioEngine()

    const resolvedBookId = bookId || currentBook?.id || null
    const resolvedEpisodeId = epId || currentEpisode?.id || null
    
    const { hasPurchased, hasAccess } = useBookAccess(resolvedBookId)
    const [episodes, setEpisodes] = useState([])
    const [loading, setLoading] = useState(true)
    const [downloading, setDownloading] = useState(false)
    const [downloadProgress, setDownloadProgress] = useState(0)

    const fetchData = useCallback(async () => {
        if (!resolvedBookId) {
            setLoading(false)
            return
        }

        const { data: book } = await supabase
            .from('books')
            .select('*')
            .eq('id', resolvedBookId)
            .single()

        const { data: eps } = await supabase
            .from('episodes')
            .select('*')
            .eq('book_id', resolvedBookId)
            .order('episode_number')

        if (book && eps) {
            setEpisodes(eps)

            // If no episode is currently loaded or different book, load this one
            const targetEp = eps.find(e => e.id === resolvedEpisodeId) || eps[0]
            if (targetEp && (!currentEpisode || currentEpisode.id !== targetEp.id || currentBook?.id !== book.id)) {
                loadEpisode(targetEp, book)
            }
        }

        setLoading(false)
    }, [resolvedBookId, resolvedEpisodeId, currentEpisode, currentBook?.id, loadEpisode])

    // Fetch book and episodes
    useEffect(() => {
        fetchData()
    }, [fetchData])

    const formatTime = (seconds) => {
        if (!seconds || isNaN(seconds)) return '0:00'
        const mins = Math.floor(seconds / 60)
        const secs = Math.floor(seconds % 60)
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0

    const handleProgressClick = (e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const x = e.clientX - rect.left
        const percentage = x / rect.width
        const newTime = percentage * duration
        seek(newTime)
    }

    const handleEpisodeClick = (episode) => {
        if (!resolvedBookId) {
            navigate('/library')
            return
        }

        const allowed = canAccessEpisode(episode, { hasPurchased, hasAccess })
        if (!allowed) {
            navigate(`/book/${resolvedBookId}`)
            return
        }
        
        loadEpisode(episode, currentBook)
        navigate(`/book/${resolvedBookId}/episode/${episode.id}`)
    }

    const handleDownload = async () => {
        if (!currentEpisode || !hasAccess || downloading) return
        
        setDownloading(true)
        setDownloadProgress(0)
        
        const result = await downloadEpisode(
            currentEpisode.id,
            currentBook.id,
            currentEpisode.audio_url,
            currentEpisode.title,
            (progress) => setDownloadProgress(progress)
        )
        
        if (result.success) {
            setTimeout(() => {
                setDownloading(false)
                setDownloadProgress(0)
            }, 1000)
        } else {
            setDownloading(false)
            alert('Download failed: ' + result.error)
        }
    }

    const playbackRates = [0.5, 0.75, 1, 1.25, 1.5, 2]

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-bg-primary via-bg-primary to-accent/5">
                <div className="text-text-secondary">Loading...</div>
            </div>
        )
    }

    if (!currentBook || !currentEpisode) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-bg-primary via-bg-primary to-accent/5 p-4">
                <div className="text-center space-y-4">
                    <p className="text-text-secondary">No episode selected.</p>
                    <button
                        onClick={() => navigate('/library')}
                        className="px-4 py-2 rounded-full bg-accent text-white hover:opacity-90 transition-opacity"
                    >
                        Go to Library
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 bg-gradient-to-b from-bg-primary via-bg-primary to-accent/5 overflow-auto pb-24">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-bg-primary/80 backdrop-blur-xl border-b border-border-subtle">
                <div className="container max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <button
                        onClick={() => navigate(resolvedBookId ? `/book/${resolvedBookId}` : '/home')}
                        className="p-2 text-text-secondary hover:text-white transition-colors"
                    >
                        <ChevronDown size={24} />
                    </button>
                    <div className="text-center flex-1">
                        <p className="text-xs text-text-secondary uppercase tracking-wider">Playing from</p>
                        <p className="text-sm font-medium text-white">{currentBook.title}</p>
                    </div>
                    <button className="p-2 text-text-secondary hover:text-white transition-colors">
                        <MoreVertical size={24} />
                    </button>
                </div>
            </div>

            <div className="container max-w-7xl mx-auto px-4 py-8">
                <div className="grid lg:grid-cols-[1.5fr,1fr] gap-8 items-start">
                    {/* Left: Player */}
                    <div className="space-y-8">
                        {/* Cover Art */}
                        <div className="relative aspect-square max-w-2xl mx-auto rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-accent/20 to-transparent">
                            {getEpisodeArtwork(currentEpisode, currentBook) ? (
                                <img
                                    src={getEpisodeArtwork(currentEpisode, currentBook)}
                                    alt={currentEpisode.title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-bg-elevated">
                                    <ListMusic size={120} className="text-text-secondary opacity-20" />
                                </div>
                            )}
                        </div>

                        {/* Track Info */}
                        <div className="space-y-2">
                            <h1 className="text-3xl md:text-4xl font-bold text-white">{currentEpisode.title}</h1>
                            <p className="text-lg text-text-secondary">{currentBook.author}</p>
                            <div className="flex items-center gap-4 text-sm text-text-secondary">
                                <span className="flex items-center gap-1">
                                    <Clock size={14} />
                                    Episode {currentEpisode.episode_number}
                                </span>
                                {currentEpisode.is_free && (
                                    <span className="px-2 py-0.5 bg-accent/20 text-accent rounded-full text-xs font-medium">
                                        Free
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-2">
                            <div
                                onClick={handleProgressClick}
                                className="relative h-2 bg-white/10 rounded-full cursor-pointer group hover:h-2.5 transition-all"
                            >
                                <div
                                    className="absolute inset-y-0 left-0 bg-accent rounded-full transition-all group-hover:bg-accent-light"
                                    style={{ width: `${progressPercent}%` }}
                                />
                                <div
                                    className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                    style={{ left: `${progressPercent}%`, transform: 'translate(-50%, -50%)' }}
                                />
                            </div>
                            <div className="flex justify-between text-xs font-mono text-text-secondary">
                                <span>{formatTime(currentTime)}</span>
                                <span>{formatTime(duration)}</span>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center justify-center gap-8">
                            <button
                                onClick={skipBack}
                                className="text-text-secondary hover:text-white transition-colors"
                                aria-label="Skip back 15 seconds"
                            >
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M11.99 5V1l-5 5 5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6h-2c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
                                    <text x="12" y="16" fontSize="8" textAnchor="middle" fill="currentColor" fontWeight="bold">15</text>
                                </svg>
                            </button>

                            <button
                                onClick={togglePlay}
                                className="w-16 h-16 rounded-full bg-white hover:scale-105 flex items-center justify-center transition-transform shadow-xl"
                                aria-label={isPlaying ? 'Pause' : 'Play'}
                            >
                                {isPlaying ? (
                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="#000">
                                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                                    </svg>
                                ) : (
                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="#000">
                                        <path d="M8 5v14l11-7z"/>
                                    </svg>
                                )}
                            </button>

                            <button
                                onClick={skipForward}
                                className="text-text-secondary hover:text-white transition-colors"
                                aria-label="Skip forward 15 seconds"
                            >
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 5V1l5 5-5 5V7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8z"/>
                                    <text x="12" y="16" fontSize="8" textAnchor="middle" fill="currentColor" fontWeight="bold">15</text>
                                </svg>
                            </button>
                        </div>

                        {/* Bottom Controls */}
                        <div className="flex items-center justify-between gap-6">
                            {/* Playback Rate */}
                            <div className="flex items-center gap-2">
                                {playbackRates.map(rate => (
                                    <button
                                        key={rate}
                                        onClick={() => setPlaybackRate(rate)}
                                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                                            playbackRate === rate
                                                ? 'bg-accent text-white'
                                                : 'bg-white/5 text-text-secondary hover:bg-white/10 hover:text-white'
                                        }`}
                                    >
                                        {rate}x
                                    </button>
                                ))}
                            </div>

                            {/* Download */}
                            {hasAccess && (
                                <button
                                    onClick={handleDownload}
                                    disabled={downloading}
                                    className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
                                >
                                    {downloading && (
                                        <div 
                                            className="absolute inset-0 bg-accent/20 transition-all duration-300"
                                            style={{ width: `${downloadProgress}%` }}
                                        />
                                    )}
                                    <Download size={16} className="relative z-10" />
                                    <span className="text-sm font-medium relative z-10">
                                        {downloading ? `${downloadProgress}%` : 'Download'}
                                    </span>
                                </button>
                            )}
                        </div>

                        {/* Volume */}
                        <div className="flex items-center gap-4">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-secondary flex-shrink-0">
                                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                                <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                            </svg>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={volume}
                                onChange={(e) => setVolume(Number(e.target.value))}
                                className="flex-1 h-1 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer hover:[&::-webkit-slider-thumb]:scale-110"
                                style={{
                                    background: `linear-gradient(to right, var(--accent) 0%, var(--accent) ${volume * 100}%, rgba(255,255,255,0.1) ${volume * 100}%, rgba(255,255,255,0.1) 100%)`
                                }}
                            />
                            <span className="text-xs font-mono text-text-secondary w-8 text-right">
                                {Math.round(volume * 100)}%
                            </span>
                        </div>
                    </div>

                    {/* Right: Episode List */}
                    <div className="lg:sticky lg:top-24">
                        <div className="bg-bg-elevated/50 backdrop-blur-sm rounded-2xl border border-border-subtle overflow-hidden">
                            <div className="p-4 border-b border-border-subtle">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <ListMusic size={20} />
                                    All Episodes
                                </h3>
                            </div>
                            <div className="max-h-[600px] overflow-y-auto">
                                {episodes.map((episode) => {
                                    const isActive = episode.id === currentEpisode.id
                                    const canPlayEpisode = canAccessEpisode(episode, { hasPurchased, hasAccess })
                                    
                                    return (
                                        <button
                                            key={episode.id}
                                            onClick={() => handleEpisodeClick(episode)}
                                            className={`w-full p-4 text-left transition-colors border-b border-border-subtle/50 hover:bg-white/5 ${
                                                isActive ? 'bg-accent/10' : ''
                                            }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                                    isActive 
                                                        ? 'bg-accent text-white' 
                                                        : 'bg-white/10 text-text-secondary'
                                                }`}>
                                                    {episode.episode_number}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <p className={`font-medium truncate ${
                                                            isActive ? 'text-accent' : 'text-white'
                                                        }`}>
                                                            {episode.title}
                                                        </p>
                                                        {!canPlayEpisode && (
                                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-text-secondary flex-shrink-0">
                                                                <path d="M12 2C9.243 2 7 4.243 7 7v3H6c-1.103 0-2 .897-2 2v8c0 1.103.897 2 2 2h12c1.103 0 2-.897 2-2v-8c0-1.103-.897-2-2-2h-1V7c0-2.757-2.243-5-5-5zM9 7c0-1.654 1.346-3 3-3s3 1.346 3 3v3H9V7z"/>
                                                            </svg>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-text-secondary mt-1">
                                                        {formatTime(episode.duration_seconds)}
                                                    </p>
                                                </div>
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

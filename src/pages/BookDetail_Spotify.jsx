import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import useAuth from '../hooks/useAuth'
import useBookAccess from '../hooks/useBookAccess'
import usePlayerStore from '../store/playerStore'
import useAudioEngine from '../hooks/useAudioEngine'
import PaymentModal from '../components/ui/PaymentModal'
import Skeleton from '../components/ui/Skeleton'
import { getEpisodeArtwork } from '../lib/media'
import { Play, Clock, Lock, Plus, MoreHorizontal, Sparkles } from 'lucide-react'

export default function BookDetailSpotify() {
    const { bookId } = useParams()
    const { user } = useAuth()
    const navigate = useNavigate()
    const { currentEpisode } = usePlayerStore()
    const { loadEpisode } = useAudioEngine()
    const [book, setBook] = useState(null)
    const [episodes, setEpisodes] = useState([])
    const [loading, setLoading] = useState(true)
    const [showPaymentModal, setShowPaymentModal] = useState(false)
    const [dominantColor, setDominantColor] = useState('#7b5ea7')
    const [isSaved, setIsSaved] = useState(false)
    const { hasPurchased, hasAccess, refetch } = useBookAccess(bookId)

    const fetchBookDetails = useCallback(async () => {
        try {
            const { data: bookData } = await supabase
                .from('books')
                .select('*')
                .eq('id', bookId)
                .single()

            const { data: episodesData } = await supabase
                .from('episodes')
                .select('*')
                .eq('book_id', bookId)
                .order('episode_number', { ascending: true })

            setBook(bookData)
            setEpisodes(episodesData || [])
            
            // Set dominant color based on book type
            setDominantColor(bookData?.is_premium ? '#8b6dc7' : '#7b5ea7')
        } catch (err) {
            console.error('Error fetching book details:', err)
        } finally {
            setLoading(false)
        }
    }, [bookId])

    useEffect(() => {
        fetchBookDetails()
    }, [fetchBookDetails])

    const handlePlayEpisode = (episode) => {
        loadEpisode(episode, book)
    }

    const handlePlayFirst = () => {
        if (episodes.length > 0) {
            handlePlayEpisode(episodes[0])
        }
    }

    const handleUnlockClick = () => {
        if (!user) {
            navigate('/login')
            return
        }
        setShowPaymentModal(true)
    }

    const handlePaymentSuccess = () => {
        refetch()
    }

    const toggleSave = () => {
        setIsSaved(!isSaved)
        // TODO: Implement actual save to library functionality
    }

    if (loading) {
        return (
            <div className="p-8">
                <Skeleton className="h-96 bg-spotify-elevated" />
            </div>
        )
    }

    if (!book) {
        return (
            <div className="text-center py-20">
                <p className="text-spotify-subtext">Book not found</p>
            </div>
        )
    }

    const totalDuration = episodes.reduce((acc, ep) => acc + (ep.duration_seconds || 0), 0)
    const totalHours = Math.floor(totalDuration / 3600)
    const totalMins = Math.floor((totalDuration % 3600) / 60)

    return (
        <div className="pb-48">{/* Extra padding to prevent overlap with bottom nav */}
            {/* Hero Section with Dynamic Gradient */}
            <div
                className="relative px-4 md:px-6 pt-12 md:pt-16 pb-8"
                style={{
                    background: `linear-gradient(180deg, ${dominantColor} 0%, ${dominantColor}dd 40%, #121212 100%)`,
                }}
            >
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-end">
                        {/* Large Square Cover Art - Premium Shadow */}
                        <div className="flex-shrink-0">
                            <div 
                                className="w-48 h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 rounded-lg overflow-hidden"
                                style={{
                                    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5), 0 20px 60px rgba(0, 0, 0, 0.4)'
                                }}
                            >
                                <img
                                    src={book.cover_url || '/placeholder.jpg'}
                                    alt={book.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>

                        {/* Book Metadata */}
                        <div className="flex-1 text-center md:text-left pb-4">
                            {/* Uppercase Label */}
                            <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
                                {book.is_premium && (
                                    <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1 rounded-full">
                                        <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                                        <span className="text-yellow-400 font-normal text-xs uppercase tracking-wide">Premium</span>
                                    </div>
                                )}
                                <span className="text-white/90 text-xs font-normal uppercase tracking-widest">
                                    Audiobook
                                </span>
                            </div>
                            
                            {/* Massive Title */}
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 md:mb-6 leading-none tracking-tight">
                                {book.title}
                            </h1>
                            
                            {/* Author & Stats */}
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-sm md:text-base mb-4">
                                <span className="text-white font-normal">{book.author}</span>
                                <span className="text-gray-300">•</span>
                                <span className="text-gray-300 font-normal">{episodes.length} episodes</span>
                                {totalHours > 0 && (
                                    <>
                                        <span className="text-gray-300">•</span>
                                        <span className="text-gray-300 font-normal">
                                            {totalHours}h {totalMins}m
                                        </span>
                                    </>
                                )}
                            </div>

                            {/* Short Description (2-3 lines max) */}
                            {book.blurb && (
                                <p className="text-gray-300 text-sm md:text-base leading-relaxed line-clamp-3 max-w-3xl mx-auto md:mx-0 font-normal">
                                    {book.blurb}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Bar - Premium Spotify Style */}
            <div className="px-4 md:px-6 py-8 bg-gradient-to-b from-[#121212] via-[#121212] to-transparent">
                <div className="max-w-7xl mx-auto flex items-center gap-5">
                    {/* Large Vibrant Play Button - Primary Focus */}
                    <button
                        onClick={handlePlayFirst}
                        className="w-14 h-14 md:w-16 md:h-16 bg-[#1DB954] hover:bg-[#1ed760] hover:scale-105 rounded-full flex items-center justify-center shadow-xl transition-all"
                        aria-label="Play audiobook"
                        style={{
                            boxShadow: '0 8px 24px rgba(29, 185, 84, 0.4)'
                        }}
                    >
                        <Play className="w-7 h-7 md:w-8 md:h-8 text-black fill-black ml-0.5" />
                    </button>

                    {/* Save/Plus Button - Secondary Icon */}
                    <button
                        onClick={toggleSave}
                        className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all ${
                            isSaved 
                                ? 'text-[#1DB954]' 
                                : 'text-gray-400 hover:text-white'
                        }`}
                        aria-label="Add to library"
                    >
                        <Plus className="w-7 h-7 md:w-8 md:h-8" strokeWidth={2} />
                    </button>

                    {/* More Options Button - Secondary Icon */}
                    <button
                        className="w-10 h-10 md:w-12 md:h-12 text-gray-400 hover:text-white rounded-full flex items-center justify-center transition-all"
                        aria-label="More options"
                    >
                        <MoreHorizontal className="w-7 h-7 md:w-8 md:h-8" strokeWidth={2} />
                    </button>

                    {/* Unlock Button (if premium and not purchased) */}
                    {book.is_premium && !hasPurchased && (
                        <button
                            onClick={handleUnlockClick}
                            className="ml-auto px-6 py-2.5 border-2 border-white/20 text-white hover:border-white hover:scale-105 rounded-full font-medium text-sm transition-all"
                        >
                            Unlock • ₹{book.special_price || 99}
                        </button>
                    )}
                </div>
            </div>

            {/* Episodes List - Clean Tracklist Style */}
            <div className="px-4 md:px-6 max-w-7xl mx-auto mt-4">
                {/* Clean Header Row - No Background Box */}
                <div className="border-b border-gray-800 pb-3 mb-2">
                    <div className="grid grid-cols-[40px_56px_1fr_80px] md:grid-cols-[40px_56px_2fr_1fr_100px] gap-4 px-4 text-gray-400 text-xs uppercase tracking-widest">
                        <div className="text-center">#</div>
                        <div>Art</div>
                        <div>Title</div>
                        <div className="hidden md:block">Description</div>
                        <div className="text-right flex items-center justify-end gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Duration</span>
                        </div>
                    </div>
                </div>

                {/* Episodes Rows - Generous Padding */}
                <div className="space-y-1">
                    {episodes.map((episode) => {
                        const isCurrentEpisode = currentEpisode?.id === episode.id
                        const isLocked = !episode.is_free && !hasAccess
                        
                        return (
                            <div
                                key={episode.id}
                                onClick={() => !isLocked && handlePlayEpisode(episode)}
                                className={`relative grid grid-cols-[40px_56px_1fr_80px] md:grid-cols-[40px_56px_2fr_1fr_100px] gap-4 px-4 py-4 rounded-md transition-all group ${
                                    isLocked 
                                        ? 'opacity-40 cursor-not-allowed' 
                                        : 'cursor-pointer hover:bg-white/5'
                                } ${
                                    isCurrentEpisode ? 'bg-white/5' : ''
                                }`}
                            >
                                {/* Episode Number / Play Icon */}
                                <div className="flex items-center justify-center">
                                    {isLocked ? (
                                        <Lock className="w-4 h-4 text-gray-500" />
                                    ) : (
                                        <div className="relative w-5 h-5 flex items-center justify-center">
                                            <span className={`absolute inset-0 flex items-center justify-center text-sm transition-opacity ${
                                                isCurrentEpisode ? 'text-[#1DB954] font-medium' : 'text-gray-400 font-normal'
                                            } group-hover:opacity-0`}>
                                                {episode.episode_number}
                                            </span>
                                            <Play className={`absolute inset-0 m-auto w-4 h-4 transition-opacity opacity-0 group-hover:opacity-100 ${
                                                isCurrentEpisode ? 'text-[#1DB954] fill-[#1DB954]' : 'text-white fill-white'
                                            }`} />
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center">
                                    <img
                                        src={getEpisodeArtwork(episode, book)}
                                        alt={episode.title}
                                        className="w-12 h-12 rounded-md object-cover border border-white/10"
                                    />
                                </div>

                                {/* Title & Badge */}
                                <div className="flex flex-col justify-center min-w-0">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <span className={`text-sm truncate ${
                                            isCurrentEpisode ? 'text-[#1DB954] font-normal' : 'text-white font-normal'
                                        } group-hover:text-white transition-colors`}>
                                            {episode.title}
                                        </span>
                                        {episode.is_free && !book.is_premium && (
                                            <span className="flex-shrink-0 text-[10px] bg-[#1DB954] text-black font-semibold px-1.5 py-0.5 rounded">
                                                FREE
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Description (Desktop Only) */}
                                <div className="hidden md:flex items-center">
                                    <p className="text-gray-400 text-sm truncate">
                                        {episode.description || '—'}
                                    </p>
                                </div>

                                {/* Duration - Right Aligned */}
                                <div className="flex items-center justify-end text-gray-400 text-sm">
                                    {formatDuration(episode.duration_seconds)}
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* About Section - Below Episodes */}
                {book.blurb && (
                    <div className="mt-16 pb-12">
                        <h3 className="text-2xl font-medium text-spotify-text mb-5 tracking-tight">About this audiobook</h3>
                        <p className="text-white/70 text-base leading-relaxed max-w-4xl font-light">
                            {book.blurb}
                        </p>
                    </div>
                )}
            </div>

            {/* Payment Modal */}
            {showPaymentModal && (
                <PaymentModal
                    book={book}
                    onClose={() => setShowPaymentModal(false)}
                    onSuccess={handlePaymentSuccess}
                />
            )}
        </div>
    )
}

function formatDuration(seconds) {
    if (!seconds) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    if (mins >= 60) {
        const hrs = Math.floor(mins / 60)
        const remainMins = mins % 60
        return `${hrs}:${remainMins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`
}

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import useAuth from '../hooks/useAuth'
import useBookAccess from '../hooks/useBookAccess'
import AppLayout from '../components/layout/AppLayout'
import EpisodeRow from '../components/ui/EpisodeRow'
import PaymentModal from '../components/ui/PaymentModal'
import Skeleton from '../components/ui/Skeleton'
import { Clock } from 'lucide-react'

export default function BookDetail() {
    const { bookId } = useParams()
    const { user } = useAuth()
    const navigate = useNavigate()
    const [book, setBook] = useState(null)
    const [episodes, setEpisodes] = useState([])
    const [loading, setLoading] = useState(true)
    const [showPaymentModal, setShowPaymentModal] = useState(false)
    const [showFullBlurb, setShowFullBlurb] = useState(false)
    const { hasPurchased, isLoading: purchaseLoading, refetch } = useBookAccess(bookId)

    useEffect(() => {
        fetchBookDetails()
    }, [bookId])

    const fetchBookDetails = async () => {
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
        } catch (err) {
            console.error('Error fetching book details:', err)
        } finally {
            setLoading(false)
        }
    }

    const handlePlayEpisode = (episode) => {
        // Navigate to player (Phase 5 implementation)
        navigate(`/book/${bookId}/episode/${episode.id}`)
    }

    const handleUnlockClick = () => {
        if (!user) {
            navigate('/login')
            return
        }
        setShowPaymentModal(true)
    }

    const handlePaymentSuccess = () => {
        refetch() // Refetch purchase status
    }

    if (loading) {
        return (
            <AppLayout>
                <div className="max-w-5xl mx-auto px-4 py-8">
                    <Skeleton className="h-96" />
                </div>
            </AppLayout>
        )
    }

    if (!book) {
        return (
            <AppLayout>
                <div className="text-center py-20">
                    <p className="text-text-secondary">Book not found</p>
                </div>
            </AppLayout>
        )
    }

    const freeEpisodeCount = episodes.filter(ep => ep.is_free).length
    const totalEpisodes = episodes.length

    return (
        <AppLayout>
            <div className="max-w-5xl mx-auto px-4 py-8 space-y-12">
                {/* Hero Section */}
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Cover Image */}
                    <div className="flex-shrink-0">
                        <img
                            src={book.cover_url || '/placeholder.jpg'}
                            alt={book.title}
                            className="w-full md:w-64 h-96 object-cover rounded-card shadow-2xl"
                        />
                    </div>

                    {/* Book Info */}
                    <div className="flex-1 space-y-4">
                        <div>
                            <h1 className="font-display text-4xl md:text-5xl text-white mb-2">
                                {book.title}
                            </h1>
                            <p className="text-xl text-text-secondary">{book.author}</p>
                        </div>

                        {/* Meta Info */}
                        <div className="flex items-center gap-4 text-sm text-text-muted">
                            {book.genre && (
                                <span className="px-3 py-1 bg-accent/20 text-accent rounded-full">
                                    {book.genre}
                                </span>
                            )}
                            {book.language && (
                                <span>{book.language}</span>
                            )}
                            <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>{totalEpisodes} episodes</span>
                            </div>
                        </div>

                        {/* Tags */}
                        {book.tags && book.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {book.tags.map((tag, index) => (
                                    <span
                                        key={index}
                                        className="px-2 py-1 bg-bg-elevated border border-border-subtle text-text-secondary text-xs rounded"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Blurb */}
                        {book.blurb && (
                            <div>
                                <p className={`text-text-secondary leading-relaxed ${showFullBlurb ? '' : 'line-clamp-3'}`}>
                                    {book.blurb}
                                </p>
                                {book.blurb.length > 200 && (
                                    <button
                                        onClick={() => setShowFullBlurb(!showFullBlurb)}
                                        className="text-accent text-sm mt-2 hover:underline"
                                    >
                                        {showFullBlurb ? 'Show less' : 'Read more'}
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Pricing & CTA */}
                        <div className="pt-4">
                            {!user ? (
                                <div className="space-y-3">
                                    <div className="text-text-secondary text-sm">
                                        {freeEpisodeCount} free episodes · ₹49 to unlock all
                                    </div>
                                    <button
                                        onClick={() => navigate('/login')}
                                        className="px-8 py-3 bg-accent text-white rounded-xl font-bold hover:bg-accent/90 transition-colors"
                                    >
                                        Sign in to listen
                                    </button>
                                </div>
                            ) : purchaseLoading ? (
                                <div className="text-text-muted">Loading...</div>
                            ) : hasPurchased ? (
                                <div className="flex items-center gap-2 text-green-400">
                                    <span className="text-2xl">✅</span>
                                    <span>All episodes unlocked</span>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="text-text-secondary text-sm">
                                        {freeEpisodeCount} free · ₹49 for all {totalEpisodes} episodes
                                    </div>
                                    <button
                                        onClick={handleUnlockClick}
                                        className="px-8 py-3 bg-accent text-white rounded-xl font-bold hover:bg-accent/90 transition-colors"
                                    >
                                        Unlock for ₹49
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Episodes List */}
                <div className="space-y-4">
                    <h2 className="font-display text-2xl text-white">Episodes</h2>
                    <div className="space-y-3">
                        {episodes.map((episode) => {
                            const isLocked = !episode.is_free && !hasPurchased
                            return (
                                <EpisodeRow
                                    key={episode.id}
                                    episode={episode}
                                    isLocked={isLocked}
                                    onPlay={handlePlayEpisode}
                                    onUnlock={handleUnlockClick}
                                    currentlyPlaying={null}
                                />
                            )
                        })}
                    </div>

                    {episodes.length === 0 && (
                        <p className="text-center text-text-secondary py-10">
                            No episodes available yet
                        </p>
                    )}
                </div>
            </div>

            {/* Payment Modal */}
            <PaymentModal
                bookId={bookId}
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                onSuccess={handlePaymentSuccess}
            />
        </AppLayout>
    )
}

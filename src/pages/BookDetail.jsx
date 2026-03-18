import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import useAuth from '../hooks/useAuth'
import usePlayerStore from '../store/playerStore'
import AppLayout from '../components/layout/AppLayout'
import EpisodeRow from '../components/ui/EpisodeRow'
import Skeleton from '../components/ui/Skeleton'
import { Clock, Bookmark, BookmarkCheck, Download } from 'lucide-react'
import { toggleBookmark, checkIsBookmarked } from '../lib/bookmarks'
import { downloadEpisode } from '../lib/downloads'

export default function BookDetail() {
    const { bookId } = useParams()
    const { user } = useAuth()
    const navigate = useNavigate()
    const { actions: playerActions } = usePlayerStore()
    const [book, setBook] = useState(null)
    const [episodes, setEpisodes] = useState([])
    const [loading, setLoading] = useState(true)
    const [showFullBlurb, setShowFullBlurb] = useState(false)
    const [isBookmarked, setIsBookmarked] = useState(false)
    const [downloadingSeries, setDownloadingSeries] = useState(false)

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
            
            if (user) {
                const bookmarked = await checkIsBookmarked(user.id, bookId)
                setIsBookmarked(bookmarked)
            }
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
        // Set current episode in player store and start playback
        playerActions.setCurrentEpisode(episode, book)
        playerActions.play()
    }

    const handleBookmarkToggle = async () => {
        if (!user) {
            navigate('/login')
            return
        }
        const result = await toggleBookmark(user.id, book.id)
        if (result.success) {
            setIsBookmarked(result.bookmarked)
        }
    }

    const handleDownloadEpisode = async (episode, setProgress) => {
        if (!user) {
            navigate('/login')
            return
        }
        await downloadEpisode(episode.id, book.id, episode.audio_url, episode.title, setProgress)
    }

    const handleDownloadSeries = async () => {
        if (!user) {
            navigate('/login')
            return
        }
        setDownloadingSeries(true)
        // Download sequentially to avoid browser issues
        try {
            for (const episode of episodes) {
                await downloadEpisode(episode.id, book.id, episode.audio_url, episode.title, null)
            }
            alert('Series downloaded successfully!')
        } catch (err) {
            console.error(err)
            alert('An error occurred during download.')
        } finally {
            setDownloadingSeries(false)
        }
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

                        {/* CTA */}
                        <div className="pt-4">
                            {!user ? (
                                <div className="space-y-3">
                                    <button
                                        onClick={() => navigate('/login')}
                                        className="px-8 py-3 bg-white text-black rounded-full font-bold hover:scale-105 transition-transform"
                                    >
                                        Sign in to listen
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col sm:flex-row gap-4 items-center">
                                     <button
                                        onClick={() => handlePlayEpisode(episodes[0])}
                                        className="px-8 py-3 bg-spotify-green text-black rounded-full font-bold hover:scale-105 transition-transform"
                                    >
                                        Listen Now
                                    </button>

                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={handleBookmarkToggle}
                                            className="w-12 h-12 flex items-center justify-center rounded-full border border-white/30 text-white hover:border-white transition-colors"
                                            title={isBookmarked ? "Remove Bookmark" : "Add Bookmark"}
                                        >
                                            {isBookmarked ? <BookmarkCheck className="w-6 h-6 text-spotify-green" /> : <Bookmark className="w-5 h-5 fill-transparent" />}
                                        </button>
                                        
                                        <button
                                            onClick={handleDownloadSeries}
                                            disabled={downloadingSeries}
                                            className="w-12 h-12 flex items-center justify-center rounded-full border border-white/30 text-white hover:border-white transition-colors disabled:opacity-50"
                                            title="Download Series"
                                        >
                                            <Download className={`w-5 h-5 ${downloadingSeries ? 'animate-bounce text-accent' : ''}`} />
                                        </button>
                                    </div>
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
                            return (
                                <EpisodeRow
                                    key={episode.id}
                                    episode={episode}
                                    isLocked={false}
                                    onPlay={handlePlayEpisode}
                                    onDownload={handleDownloadEpisode}
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
        </AppLayout>
    )
}

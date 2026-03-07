import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import useAuth from '../hooks/useAuth'
import useBookAccess from '../hooks/useBookAccess'
import AppLayout from '../components/layout/AppLayout'
import FeaturedCarousel from '../components/ui/FeaturedCarousel'
import Skeleton from '../components/ui/Skeleton'
import { Play, Lock, CheckCircle } from 'lucide-react'

export default function Home() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [continueListening, setContinueListening] = useState([])
    const [featuredBooks, setFeaturedBooks] = useState([])
    const [allBooks, setAllBooks] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchData()
    }, [user])

    const fetchData = async () => {
        setLoading(true)
        try {
            // Fetch continue listening (last 3 listened episodes)
            if (user) {
                const { data: progressData } = await supabase
                    .from('listen_progress')
                    .select(`
                        *,
                        episodes!inner(id, title, book_id, duration_seconds),
                        books!inner(id, title, cover_url)
                    `)
                    .eq('user_id', user.id)
                    .order('last_position_updated', { ascending: false })
                    .limit(3)

                setContinueListening(progressData || [])
            }

            // Fetch featured books (top 3 newest)
            const { data: featured } = await supabase
                .from('books')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(3)

            setFeaturedBooks(featured || [])

            // Fetch all books
            const { data: books } = await supabase
                .from('books')
                .select('*')
                .order('created_at', { ascending: false })

            setAllBooks(books || [])
        } catch (err) {
            console.error('Error fetching home data:', err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <AppLayout>
            <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
                {/* Continue Listening Section */}
                {user && continueListening.length > 0 && (
                    <section>
                        <h2 className="font-display text-2xl text-white mb-6">Continue Listening</h2>
                        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                            {continueListening.map((item) => {
                                const progress = (item.position_seconds / item.episodes.duration_seconds) * 100
                                return (
                                    <div
                                        key={item.id}
                                        onClick={() => navigate(`/book/${item.episodes.book_id}`)}
                                        className="flex-shrink-0 w-64 bg-bg-elevated border border-border-subtle rounded-card p-4 cursor-pointer hover:border-accent transition-colors"
                                    >
                                        <div className="flex gap-3 mb-3">
                                            <img
                                                src={item.books.cover_url || '/placeholder.jpg'}
                                                alt={item.books.title}
                                                className="w-12 h-12 rounded object-cover"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm text-white font-medium truncate">
                                                    {item.books.title}
                                                </div>
                                                <div className="text-xs text-text-muted truncate">
                                                    {item.episodes.title}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="w-full bg-bg-secondary rounded-full h-1.5">
                                            <div
                                                className="bg-accent h-1.5 rounded-full transition-all"
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                        <div className="text-xs text-text-muted mt-2">
                                            {Math.round(progress)}% completed
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </section>
                )}

                {/* Featured Carousel */}
                {featuredBooks.length > 0 && (
                    <section>
                        <h2 className="font-display text-2xl text-white mb-6">New This Week</h2>
                        <FeaturedCarousel books={featuredBooks} />
                    </section>
                )}

                {/* All Books Library */}
                <section>
                    <h2 className="font-display text-2xl text-white mb-6">All Books</h2>
                    {loading ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, i) => (
                                <Skeleton key={i} className="h-80" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                            {allBooks.map((book) => (
                                <BookCardWithAccess key={book.id} book={book} />
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </AppLayout>
    )
}

function BookCardWithAccess({ book }) {
    const { hasPurchased, isLoading } = useBookAccess(book.id)
    const navigate = useNavigate()

    let badge = null
    if (isLoading) {
        badge = <div className="text-xs text-text-muted">Loading...</div>
    } else if (hasPurchased) {
        badge = (
            <div className="flex items-center gap-1 text-xs text-green-400">
                <CheckCircle className="w-3 h-3" />
                <span>Unlocked</span>
            </div>
        )
    } else {
        badge = (
            <div className="flex items-center gap-1 text-xs text-accent">
                <Lock className="w-3 h-3" />
                <span>2 Free Episodes</span>
            </div>
        )
    }

    return (
        <div
            onClick={() => navigate(`/book/${book.id}`)}
            className="cursor-pointer group"
        >
            <div className="relative aspect-[2/3] rounded-card overflow-hidden mb-3">
                <img
                    src={book.cover_url || '/placeholder.jpg'}
                    alt={book.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                        <Play className="w-12 h-12 text-white" />
                    </div>
                </div>
            </div>
            <h3 className="text-white font-medium text-sm line-clamp-2 mb-1">
                {book.title}
            </h3>
            <div className="text-xs text-text-muted mb-2">{book.author}</div>
            {badge}
        </div>
    )
}


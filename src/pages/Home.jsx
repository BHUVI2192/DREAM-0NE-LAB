import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import useAuth from '../hooks/useAuth'
import FeaturedCarousel from '../components/ui/FeaturedCarousel'
import Skeleton from '../components/ui/Skeleton'
import { Play, CheckCircle, Crown, Sparkles, TrendingUp, Clock, Library } from 'lucide-react'

export default function Home() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [continueListening, setContinueListening] = useState([])
    const [featuredBooks, setFeaturedBooks] = useState([])
    const [regularBooks, setRegularBooks] = useState([])
    const [specialSeries, setSpecialSeries] = useState([])
    const [hasSubscription, setHasSubscription] = useState(false)
   const [loading, setLoading] = useState(true)

    const fetchData = useCallback(async () => {
        setLoading(true)
        try {
            // Check active subscription
            if (user) {
                const { data: sub } = await supabase
                    .from('subscriptions')
                    .select('*')
                    .eq('user_id', user.id)
                    .eq('status', 'active')
                    .gt('expires_at', new Date().toISOString())
                    .maybeSingle()
                
                setHasSubscription(!!sub)

                // Fetch continue listening
                const { data: progressData } = await supabase
                    .from('listen_progress')
                    .select(`
                        *,
                        episode:episodes(id, title, book_id, episode_number, duration_seconds, thumbnail_url, book:books(id, title, author, cover_url))
                    `)
                    .eq('user_id', user.id)
                    .not('episode_id', 'is', null)
                    .order('updated_at', { ascending: false })
                    .limit(6)

                const normalizedProgress = (progressData || []).map((item) => ({
                    ...item,
                    book: item.episode?.book || null,
                }))

                setContinueListening(normalizedProgress)
            }

            // Fetch featured books (top 5) - show all books
            const { data: featured } = await supabase
                .from('books')
                .select('*')
                .order('created_at', { ascending: false})
                .limit(5)

            setFeaturedBooks(featured || [])

            // Fetch regular books (not premium) - show all
            const { data: regular } = await supabase
                .from('books')
                .select('*')
                .or('is_premium.is.null,is_premium.eq.false')
                .order('created_at', { ascending: false })

            setRegularBooks(regular || [])

            // Fetch premium/special series
            const { data: special } = await supabase
                .from('books')
                .select('*')
                .eq('is_premium', true)
                .order('created_at', { ascending: false })

            setSpecialSeries(special || [])
        } catch (err) {
            console.error('Error fetching home data:', err)
        } finally {
            setLoading(false)
        }
   }, [user])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60)
        const secs = Math.floor(seconds % 60)
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    if (loading) {
        return (
            <div className="space-y-4 pb-8 px-4 md:px-6">
                {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-40 rounded-lg" />
                ))}
            </div>
        )
    }

    return (
        <div className="space-y-6 pb-8 px-2 md:px-4">
            {/* Featured Carousel - FIRST */}
            {featuredBooks.length > 0 && (
                <section>
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-accent" />
                        <h2 className="text-base md:text-lg font-semibold text-white">
                            Trending Now
                        </h2>
                    </div>
                    <FeaturedCarousel books={featuredBooks} />
                </section>
            )}

            {/* Subscription Banner - SECOND (compact) */}
            {!hasSubscription && (
                <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-accent to-purple-600 p-3 md:p-4">
                    <div className="relative z-10 flex flex-row items-center justify-between gap-3">
                        <div className="flex-1">
                            <div className="flex items-center gap-1.5 mb-1">
                                <Crown className="w-3.5 h-3.5 text-yellow-300" />
                                <span className="text-yellow-300 font-medium text-xs">Premium</span>
                            </div>
                            <h2 className="text-sm md:text-base font-bold text-white mb-1.5">
                                Unlock All Books • ₹49/month
                            </h2>
                            <ul className="hidden md:flex flex-wrap gap-2">
                                {['Unlimited', 'Offline', 'Ad-free'].map((feature, i) => (
                                    <li key={i} className="flex items-center gap-1 text-white/90 text-xs">
                                        <CheckCircle className="w-3 h-3 text-yellow-300" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <button
                            onClick={() => navigate('/subscription')}
                            className="px-4 py-2 bg-white text-accent font-semibold text-xs md:text-sm rounded-full hover:bg-white/90 transition-colors whitespace-nowrap shadow-md"
                        >
                            Upgrade
                        </button>
                    </div>
                </div>
            )}

            {/* Continue Listening - THIRD */}
            {continueListening.length > 0 && (
                <section>
                    <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-accent" />
                        <h2 className="text-base md:text-lg font-semibold text-white">
                            Continue Listening
                        </h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5">
                        {continueListening.map((item) => {
                            const progress = item.position_seconds && item.episode?.duration_seconds 
                                ? (item.position_seconds / item.episode.duration_seconds) * 100 
                                : 0
                            
                            return (
                                <div
                                    key={item.episode_id}
                                    onClick={() => navigate(`/book/${item.book.id}/episode/${item.episode_id}`)}
                                    className="group bg-bg-elevated/50 backdrop-blur-sm border border-border-subtle rounded-2xl p-4 cursor-pointer hover:border-accent hover:bg-bg-elevated transition-all hover:scale-105"
                                >
                                    <div className="flex gap-4 mb-3">
                                        <div className="relative">
                                            <img
                                                src={item.book.cover_url || '/placeholder.jpg'}
                                                alt={item.book.title}
                                                className="w-16 h-16 rounded-lg object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Play className="w-6 h-6 text-white fill-white" />
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-white font-semibold truncate mb-1">
                                                {item.book.title}
                                            </div>
                                            <div className="text-sm text-text-secondary truncate">
                                                Ep {item.episode.episode_number}: {item.episode.title}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                                            <div
                                                className="bg-accent h-full rounded-full transition-all"
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                        <div className="flex justify-between text-xs text-text-secondary">
                                            <span>{Math.round(progress)}% complete</span>
                                            <span>{formatTime(item.episode.duration_seconds)}</span>
                                        </div>
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
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-accent" />
                            Trending Now
                        </h2>
                    </div>
                    <FeaturedCarousel books={featuredBooks} />
                </section>
            )}

            {/* Special Series - FOURTH */}
            {specialSeries.length > 0 && (
                <section>
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-yellow-400" />
                        <h2 className="text-base md:text-lg font-semibold text-white">
                            Premium Series
                        </h2>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2.5">
                        {specialSeries.map((book) => (
                            <BookCard key={book.id} book={book} isPremium={true} hasSubscription={hasSubscription} />
                        ))}
                    </div>
                </section>
            )}

            {/* All Books - FIFTH */}
            {regularBooks.length > 0 && (
                <section>
                    <div className="flex items-center gap-2 mb-2">
                        <Library className="w-4 h-4 text-accent" />
                        <h2 className="text-base md:text-lg font-semibold text-white">
                            All Audiobooks
                        </h2>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2.5">
                        {regularBooks.map((book) => (
                            <BookCard key={book.id} book={book} isPremium={false} hasSubscription={hasSubscription} />
                        ))}
                    </div>
                </section>
            )}
        </div>
    )
}

function BookCard({ book, isPremium, hasSubscription }) {
    const navigate = useNavigate()
    const [episodeCount, setEpisodeCount] = useState(0)
    const [freeEpisodes, setFreeEpisodes] = useState(0)

    useEffect(() => {
        const fetchEpisodeInfo = async () => {
            const { data, count } = await supabase
                .from('episodes')
                .select('*', { count: 'exact' })
                .eq('book_id', book.id)

            setEpisodeCount(count || 0)
            setFreeEpisodes(data?.filter(ep => ep.is_free).length || 0)
        }
        fetchEpisodeInfo()
    }, [book.id])

    return (
        <div
            onClick={() => navigate(`/book/${book.id}`)}
            className="group cursor-pointer"
        >
            <div className="relative aspect-[2/3] rounded-md overflow-hidden mb-1.5 shadow-sm group-hover:shadow-lg transition-all">
                <img
                    src={book.cover_url || '/placeholder.jpg'}
                    alt={book.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Badges */}
                {isPremium && (
                    <div className="absolute top-1 right-1 bg-yellow-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>PRO</span>
                    </div>
                )}
                {hasSubscription && !isPremium && (
                    <div className="absolute top-1 left-1 bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                        ✓
                    </div>
                )}
                {!isPremium && !hasSubscription && freeEpisodes > 0 && (
                    <div className="absolute top-1 left-1 bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                        {freeEpisodes} FREE
                    </div>
                )}
                
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="bg-accent text-white p-2 rounded-full shadow-lg">
                        <Play className="w-4 h-4 fill-white" />
                    </div>
                </div>
            </div>
            <div className="px-0.5">
                <h3 className="text-white font-medium text-xs leading-tight mb-0.5 line-clamp-2 group-hover:text-accent transition-colors">
                    {book.title}
                </h3>
                <p className="text-text-secondary text-[10px] mb-0.5 truncate">{book.author}</p>
                <div className="flex items-center justify-between text-[10px]">
                    <span className="text-text-muted">{episodeCount} ep</span>
                    {isPremium && book.special_price && (
                        <span className="text-accent font-semibold">₹{book.special_price}</span>
                    )}
                </div>
            </div>
        </div>
    )
}

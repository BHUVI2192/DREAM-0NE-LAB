import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import useAuth from '../hooks/useAuth'
import { ALERT_TYPE_STYLES } from '../lib/alerts'
import { fetchUserListenProgress } from '../lib/listening'
import HorizontalShelf from '../components/ui/HorizontalShelf'
import SpotifyBookCard from '../components/ui/SpotifyBookCard'
import QuickAccessCard from '../components/ui/QuickAccessCard'
import FeaturedCarousel from '../components/ui/FeaturedCarousel'
import Skeleton from '../components/ui/Skeleton'
import { TrendingUp, Library, Bell } from 'lucide-react'

export default function Home() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [continueListening, setContinueListening] = useState([])
    const [featuredBooks, setFeaturedBooks] = useState([])
    const [regularBooks, setRegularBooks] = useState([])
    const [alerts, setAlerts] = useState([])
    const [loading, setLoading] = useState(true)
    const [greeting, setGreeting] = useState('')

    const headerColor = useMemo(() => {
        const colors = [
            'rgb(30, 50, 100)', // Spotify Blue
            'rgb(140, 20, 20)', // Spotify Red
            'rgb(75, 0, 130)',  // Spotify Purple
            'rgb(0, 80, 40)',   // Spotify Green
            'rgb(160, 80, 0)',  // Spotify Orange
            'rgb(100, 30, 80)'  // Spotify Pink
        ]
        return colors[Math.floor(Math.random() * colors.length)]
    }, [])

    useEffect(() => {
        // Set greeting based on time
        const hour = new Date().getHours()
        if (hour < 12) setGreeting('Good morning')
        else if (hour < 18) setGreeting('Good afternoon')
        else setGreeting('Good evening')
    }, [])

    const fetchAlerts = useCallback(async () => {
        try {
            let { data, error } = await supabase
                .from('alerts')
                .select('id, title, content, type, created_at, audience')
                .eq('is_active', true)
                .order('created_at', { ascending: false })
                .limit(4)

            if (error && error.message?.toLowerCase().includes('audience')) {
                const fallback = await supabase
                    .from('alerts')
                    .select('id, title, content, type, created_at')
                    .eq('is_active', true)
                    .order('created_at', { ascending: false })
                    .limit(4)

                data = (fallback.data || []).map((row) => ({ ...row, audience: 'all' }))
                error = fallback.error
            }

            if (error) throw error

            setAlerts(data || [])
        } catch (err) {
            console.error('Error fetching alerts:', err)
        }
    }, [])

    useEffect(() => {
        fetchAlerts()

        const channel = supabase
            .channel('alerts-feed')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'alerts' }, () => {
                fetchAlerts()
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [fetchAlerts])

    const fetchData = useCallback(async () => {
        setLoading(true)
        try {
            if (user) {
                // Fetch continue listening (for quick access)
                const progressData = await fetchUserListenProgress(user.id, { limit: 6 })
                setContinueListening(progressData.filter((item) => !!item.episode_id))
            }

            // Fetch featured/trending books
            const { data: featured } = await supabase
                .from('books')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(10)

            setFeaturedBooks(featured || [])

            // Fetch regular books
            const { data: regular } = await supabase
                .from('books')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(20)

            setRegularBooks(regular || [])
        } catch (err) {
            console.error('Error fetching home data:', err)
        } finally {
            setLoading(false)
        }
    }, [user])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    if (loading) {
        return (
            <div className="px-4 md:px-6 py-8 space-y-8">
                {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-64 rounded-lg bg-spotify-elevated" />
                ))}
            </div>
        )
    }

    return (
        <div className="pb-32 relative min-h-screen">
            {/* Subtle Gradient Background */}
            <div 
                className="absolute top-0 left-0 right-0 h-[332px] pointer-events-none z-0"
                style={{
                    background: `linear-gradient(to bottom, ${headerColor} 0%, rgba(18, 18, 18, 1) 100%)`
                }}
            />

            <div className="relative z-10">
                {/* Greeting Header */}
                <div className="px-4 md:px-6 pt-20 md:pt-24 pb-4">
                    <h1 className="text-[1.75rem] md:text-[2rem] font-bold text-white tracking-tighter">
                        {greeting}
                    </h1>
                </div>

            {/* Admin Alerts */}
            {alerts.length > 0 && (
                <div className="px-4 md:px-6 mb-6 space-y-2">
                    {alerts.map((alert) => {
                        const cardStyle = ALERT_TYPE_STYLES[alert.type] || ALERT_TYPE_STYLES.info

                        return (
                            <div
                                key={alert.id}
                                className={`rounded-xl border p-3 md:p-4 ${cardStyle}`}
                            >
                                <div className="flex items-start gap-3">
                                    <Bell className="mt-0.5 h-4 w-4 flex-shrink-0" />
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold md:text-base">{alert.title}</p>
                                        {alert.content && <p className="mt-1 text-sm opacity-90">{alert.content}</p>}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Featured Carousel - TOP SECTION */}
            {featuredBooks.length > 0 && (
                <div className="px-4 md:px-6 mb-16">
                    <FeaturedCarousel books={featuredBooks.slice(0, 5)} />
                </div>
            )}

            {/* Quick Access Grid (Recently Played - 6 cards) */}
            {continueListening.length > 0 && (
                <div className="px-4 md:px-6 mb-16">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {continueListening.slice(0, 6).map((item) => (
                            <QuickAccessCard
                                key={item.episode_id}
                                book={item.book}
                                episode={item.episode}
                                progress={item.position_seconds}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Trending Now Shelf */}
            {featuredBooks.length > 0 && (
                <HorizontalShelf title="Trending Now" icon={TrendingUp}>
                    {featuredBooks.map((book) => (
                        <div key={book.id} className="w-[150px] sm:w-[180px] flex-shrink-0">
                            <SpotifyBookCard book={book} />
                        </div>
                    ))}
                </HorizontalShelf>
            )}


            {/* Top Audiobooks Shelf */}
            {regularBooks.length > 0 && (
                <HorizontalShelf title="Top Audiobooks" icon={Library}>
                    {regularBooks.map((book) => (
                        <div key={book.id} className="w-[150px] sm:w-[180px] flex-shrink-0">
                            <SpotifyBookCard book={book} />
                        </div>
                    ))}
                </HorizontalShelf>
            )}

            {/* Jump Back In (if we have progress data) */}
            {continueListening.length > 0 && (
                <HorizontalShelf title="Jump Back In">
                    {continueListening.map((item) => (
                        <div key={item.episode_id} className="w-[150px] sm:w-[180px] flex-shrink-0">
                            <SpotifyBookCard book={item.book} showPlayButton={true} />
                        </div>
                    ))}
                </HorizontalShelf>
            )}
            </div>
        </div>
    )
}

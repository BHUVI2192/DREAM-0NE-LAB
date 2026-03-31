import { useState, useRef, useEffect } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { Home, Bookmark, Shield, User, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import usePlayerStore from '../../store/playerStore'
import useAuthStore from '../../store/authStore'
import SpotifyPlayerBar from '../player/SpotifyPlayerBar'

export default function SpotifyAppLayout() {
    const location = useLocation()
    const currentEpisode = usePlayerStore((s) => s.currentEpisode)
    const { user, profile } = useAuthStore()
    const [headerOpacity, setHeaderOpacity] = useState(0)
    const mainRef = useRef(null)

    // Use role for admin check
    const isAdmin = profile?.role === 'admin'



    const navItems = [
        { to: '/home', label: 'Home', Icon: Home },
        { to: '/search', label: 'Search', Icon: Search },
        { to: '/bookmarks', label: 'Your Bookmarks', Icon: Bookmark },
        { to: '/profile', label: 'Profile', Icon: User },
    ]

    if (isAdmin) {
        navItems.push({ to: '/admin', label: 'Admin', Icon: Shield })
    }

    const isActive = (path) => {
        if (path === '/home') return location.pathname === '/home'
        return location.pathname.startsWith(path)
    }

    // Handle scroll for dynamic header
    useEffect(() => {
        const handleScroll = () => {
            if (!mainRef.current) return
            const scrollY = mainRef.current.scrollTop
            const opacity = Math.min(scrollY / 100, 1) // Fades in over 100px
            setHeaderOpacity(opacity)
        }

        const mainEl = mainRef.current
        if (mainEl) {
            mainEl.addEventListener('scroll', handleScroll, { passive: true })
            // trigger once on mount in case it's already scrolled
            handleScroll()
        }
        return () => {
            if (mainEl) mainEl.removeEventListener('scroll', handleScroll)
        }
    }, [location.pathname])

    // Mobile nav uses different labels sometimes
    const mobileNavItems = [
        { to: '/home', label: 'Home', Icon: Home },
        { to: '/search', label: 'Search', Icon: Search },
        { to: '/bookmarks', label: 'Bookmarks', Icon: Bookmark },
    ]
    if (isAdmin) mobileNavItems.push({ to: '/admin', label: 'Admin', Icon: Shield })
    mobileNavItems.push({ to: '/profile', label: 'Profile', Icon: User })

    return (
        <div className="h-screen bg-black flex flex-col md:flex-row overflow-hidden text-spotify-text font-sans selection:bg-spotify-green/30">
            
            {/* DESKTOP SIDEBAR */}
            <aside className="hidden md:flex flex-col w-[260px] bg-black px-2 py-2 gap-2 flex-shrink-0 z-20">
                {/* Main Links Container */}
                <div className="bg-spotify-elevated rounded-lg p-2.5 flex flex-col gap-1 flex-1">
                    <div className="px-4 py-3 mb-2 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center border border-white/10">
                            <img src="/logo.jpg" alt="Dream One Lab Logo" className="w-full h-full object-cover" />
                        </div>
                        <span className="text-[1.1rem] font-bold tracking-tight">Dream One Lab</span>
                    </div>

                    {navItems.map(({ to, label, Icon }) => {
                        const active = isActive(to)
                        return (
                            <Link
                                key={to}
                                to={to}
                                className={`flex items-center gap-4 px-3 py-3 rounded-md transition-all duration-200 ${
                                    active 
                                        ? 'text-white bg-white/5' 
                                        : 'text-spotify-subtext hover:text-white'
                                }`}
                            >
                                <Icon className={`w-6 h-6 ${active ? 'stroke-[2.5]' : 'stroke-2'}`} />
                                <span className={`text-[0.95rem] ${active ? 'font-bold' : 'font-medium'}`}>{label}</span>
                            </Link>
                        )
                    })}
                </div>
            </aside>

            {/* MAIN PORTION */}
            <div className="flex-1 flex flex-col overflow-hidden relative md:my-2 md:mr-2 md:rounded-lg bg-spotify-base">
                
                {/* DYNAMIC TOPBAR */}
                <header 
                    className="absolute top-0 left-0 right-0 h-16 z-30 hidden md:flex items-center justify-between px-4 md:px-6 transition-colors duration-200"
                    style={{ backgroundColor: `rgba(18, 18, 18, ${headerOpacity})` }}
                >
                    {/* Left: Navigation Buttons (Desktop) / Title (Mobile) */}
                    <div className="flex items-center gap-2">
                        <button className="w-8 h-8 rounded-full bg-black/60 items-center justify-center text-white/70 hover:text-white transition-colors cursor-not-allowed hidden md:flex">
                            <ChevronLeft className="w-5 h-5 ml-[-1px]" />
                        </button>
                        <button className="w-8 h-8 rounded-full bg-black/60 items-center justify-center text-white/30 cursor-not-allowed hidden md:flex">
                            <ChevronRight className="w-5 h-5 mr-[-1px]" />
                        </button>

                        {/* Mobile Title */}
                        <div className={`md:hidden text-lg font-bold tracking-tight transition-opacity duration-300 ${headerOpacity > 0.5 ? 'opacity-100' : 'opacity-0'}`}>
                            Dream One Lab
                        </div>
                    </div>


                </header>

                {/* SCROLLABLE VIEW */}
                <main
                    ref={mainRef}
                    className="flex-1 overflow-y-auto overflow-x-hidden relative"
                style={{
                    paddingBottom: currentEpisode ? '160px' : '80px', // Extra padding for fixed nav + player
                }}
                >
                    <Outlet />
                </main>
            </div>

            {/* PLAYER BEHAVIOR INJECTED VIA FIXED POSITION IN SPOTIFYPLAYERBAR */}
            {currentEpisode && <SpotifyPlayerBar />}

            {/* MOBILE BOTTOM NAV */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-md border-t border-white/10 z-[110] pb-[env(safe-area-inset-bottom)]">
                <div className="flex items-center justify-around h-16">
                    {mobileNavItems.map(({ to, label, Icon }) => (
                        <Link
                            key={to}
                            to={to}
                            className={`flex flex-col items-center justify-center gap-1.5 flex-1 transition-colors ${
                                isActive(to) ? 'text-white' : 'text-spotify-subtext'
                            }`}
                        >
                            <Icon className={`w-5 h-5 ${isActive(to) ? 'stroke-[2.5]' : 'stroke-2'}`} />
                            <span className="text-[9px] font-medium tracking-tight truncate w-full text-center px-1">
                                {label}
                            </span>
                        </Link>
                    ))}
                </div>
            </nav>
        </div>
    )
}

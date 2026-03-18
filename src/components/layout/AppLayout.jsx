import { Outlet, Link, useLocation } from 'react-router-dom'
import { Home, BookOpen, User, Shield } from 'lucide-react'
import usePlayerStore from '../../store/playerStore'
import useAuthStore from '../../store/authStore'
import PlayerBar from '../player/PlayerBar'

export default function AppLayout() {
    const location = useLocation()
    const currentEpisode = usePlayerStore((s) => s.currentEpisode)
    const { user, profile, actions } = useAuthStore()

    // Use role for admin check (matches useAuth.js logic)
    const isAdmin = profile?.role === 'admin'

    const navItems = [
        { to: '/home', label: 'Home', Icon: Home },
        { to: '/library', label: 'Library', Icon: BookOpen },
        { to: '/profile', label: 'Profile', Icon: User },
    ]

    if (isAdmin) {
        navItems.push({ to: '/admin', label: 'Admin', Icon: Shield })
    }

    // Generate avatar initials
    const initials = user?.email
        ? user.email.slice(0, 2).toUpperCase()
        : 'DL'

    // Logout handler
    const handleLogout = async () => {
        if (window.confirm('Are you sure you want to log out?')) {
            await actions.logout();
            window.location.replace('/');
        }
    }

    return (
        <div className="min-h-screen bg-bg-primary flex flex-col">
            {/* ── Top Nav ── */}
            <header
                className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-5"
                style={{
                    height: '56px',
                    background: 'rgba(10,10,15,0.85)',
                    backdropFilter: 'blur(16px)',
                    borderBottom: '1px solid var(--border-subtle)',
                }}
            >
                {/* Logo */}
                <span
                    className="font-display font-bold text-xl tracking-tight"
                    style={{ color: 'var(--accent-glow)' }}
                >
                    Dream Lab
                </span>

                {/* Avatar + Logout */}
                <div className="flex items-center gap-2">
                    <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold cursor-pointer select-none"
                        style={{ background: 'var(--accent)', color: 'var(--text-primary)' }}
                        aria-label="User menu"
                    >
                        {initials}
                    </div>
                    <button
                        onClick={handleLogout}
                        className="ml-2 px-3 py-1 rounded-lg bg-red-500 text-white text-xs font-semibold hover:bg-red-600 transition-colors"
                        style={{ minWidth: 60 }}
                    >
                        Logout
                    </button>
                </div>
            </header>

            {/* ── Main Content ── */}
            <main
                className="flex-1 overflow-y-auto"
                style={{
                    paddingTop: '56px',
                    paddingBottom: currentEpisode ? '160px' : '72px',
                }}
            >
                <Outlet />
            </main>

            {/* ── Persistent Player Bar (shown after first play) ── */}
            {currentEpisode && <PlayerBar />}

            {/* ── Bottom Mobile Nav ── */}
            <nav
                className="fixed left-0 right-0 z-40 flex items-center justify-around"
                style={{
                    bottom: currentEpisode ? '80px' : '0',
                    height: '56px',
                    background: 'rgba(17,17,24,0.95)',
                    backdropFilter: 'blur(16px)',
                    borderTop: '1px solid var(--border-subtle)',
                }}
            >
                {navItems.map(({ to, label, Icon }) => {
                    const active = location.pathname.startsWith(to) && (to !== '/home' || location.pathname === '/home')
                    return (
                        <Link
                            key={to}
                            to={to}
                            className="flex flex-col items-center gap-0.5 px-4 py-1 transition-all"
                            style={{ color: active ? 'var(--accent-glow)' : 'var(--text-muted)' }}
                            aria-label={label}
                        >
                            <Icon size={22} strokeWidth={active ? 2.2 : 1.7} />
                            <span className="text-xs font-medium">{label}</span>
                        </Link>
                    )
                })}
            </nav>
        </div>
    )
}

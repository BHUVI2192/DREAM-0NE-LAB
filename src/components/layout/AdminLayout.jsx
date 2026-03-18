import { useState, useEffect } from 'react'
import { Outlet, useNavigate, useLocation, NavLink } from 'react-router-dom'
import {
    LayoutDashboard, BookOpen, Users, Bell,
    LogOut, Menu, X, Search, ChevronRight, Zap, ArrowUp, ArrowLeft
} from 'lucide-react'
import useAuthStore from '../../store/authStore'
import { supabase } from '../../lib/supabase'

const NAV_ITEMS = [
    { label: 'Dashboard', href: '/admin',         icon: LayoutDashboard, end: true },
    { label: 'Books',     href: '/admin/books',    icon: BookOpen },
    { label: 'Users',     href: '/admin/users',    icon: Users },
    { label: 'Alerts',    href: '/admin/alerts',   icon: Bell },
]

export default function AdminLayout() {
    const navigate = useNavigate()
    const location = useLocation()
    const { profile } = useAuthStore()
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [showSearch, setShowSearch] = useState(false)
    const [search, setSearch] = useState('')
    const [showScrollTop, setShowScrollTop] = useState(false)
    const [mainEl, setMainEl] = useState(null)

    useEffect(() => { setSidebarOpen(false) }, [location.pathname])

    useEffect(() => {
        if (!mainEl) return

        const onScroll = () => {
            setShowScrollTop(mainEl.scrollTop > 260)
        }

        mainEl.addEventListener('scroll', onScroll)
        onScroll()
        return () => mainEl.removeEventListener('scroll', onScroll)
    }, [mainEl])

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        window.location.replace('/')
    }

    const crumbs = location.pathname.replace('/admin', '').split('/').filter(Boolean)

    return (
        <div className="h-screen bg-[#0a0a0a] flex overflow-hidden">

            {/* Mobile backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* ── SIDEBAR ── */}
            <aside className={`
                fixed top-0 left-0 h-full z-50 w-64 flex flex-col
                bg-[#0d0d0d] border-r border-white/[0.06]
                transition-transform duration-300 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                lg:translate-x-0 lg:static lg:z-auto
            `}>
                {/* Logo */}
                <div className="flex items-center justify-between px-5 py-5 border-b border-white/[0.06]">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1DB954] to-[#148040] flex items-center justify-center shadow-lg shadow-[#1DB954]/20">
                            <Zap className="w-4 h-4 text-black fill-black" />
                        </div>
                        <div>
                            <p className="text-white text-sm font-bold tracking-tight">Dream Lab</p>
                            <p className="text-[#1DB954] text-[10px] font-medium uppercase tracking-widest">Admin</p>
                        </div>
                    </div>
                    <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white/40 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
                    {NAV_ITEMS.map(({ label, href, icon: Icon, end }) => (
                        <NavLink
                            key={href}
                            to={href}
                            end={end}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative ${
                                    isActive
                                        ? 'bg-[#1DB954]/10 text-[#1DB954]'
                                        : 'text-white/50 hover:text-white hover:bg-white/5'
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[#1DB954] rounded-full" />}
                                    <Icon size={18} className="flex-shrink-0" />
                                    <span>{label}</span>
                                    {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-60" />}
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* User + sign-out */}
                <div className="px-3 py-4 border-t border-white/[0.06]">
                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/[0.03] mb-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {profile?.full_name?.charAt(0)?.toUpperCase() || 'A'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-white text-xs font-medium truncate">{profile?.full_name || 'Admin'}</p>
                            <p className="text-white/40 text-[10px] truncate">{profile?.email || 'admin'}</p>
                        </div>
                    </div>
                    
                    <button
                        onClick={() => {
                            setSidebarOpen(false)
                            navigate('/home')
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-all text-sm font-medium mb-1"
                    >
                        <ArrowLeft size={16} />
                        Back to App
                    </button>

                    <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all text-sm font-medium"
                    >
                        <LogOut size={16} />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* ── MAIN AREA ── */}
            <div className="flex-1 flex flex-col min-w-0 min-h-0">

                {/* Top header */}
                <header className="sticky top-0 z-30 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/[0.06] px-4 md:px-6 py-3 flex items-center gap-3">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden text-white/60 hover:text-white transition-colors flex-shrink-0"
                    >
                        <Menu className="w-5 h-5" />
                    </button>

                    {/* Breadcrumb */}
                    <div className="hidden md:flex items-center gap-1.5 text-sm min-w-0">
                        <span className="text-white/40">Admin</span>
                        {crumbs.map((c, i) => (
                            <span key={i} className="flex items-center gap-1.5">
                                <ChevronRight className="w-3.5 h-3.5 text-white/20" />
                                <span className={i === crumbs.length - 1 ? 'text-white font-medium capitalize' : 'text-white/40 capitalize'}>{c}</span>
                            </span>
                        ))}
                        {crumbs.length === 0 && <span className="text-white font-medium">Dashboard</span>}
                    </div>

                    <div className="flex-1" />

                    {/* Inline search */}
                    {showSearch ? (
                        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5">
                            <Search className="w-4 h-4 text-white/40 flex-shrink-0" />
                            <input
                                autoFocus
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                onBlur={() => { if (!search) setShowSearch(false) }}
                                placeholder="Search..."
                                className="bg-transparent text-white text-sm outline-none w-32 sm:w-44 placeholder-white/30"
                            />
                            {search && <button onClick={() => { setSearch(''); setShowSearch(false) }}><X className="w-3.5 h-3.5 text-white/40" /></button>}
                        </div>
                    ) : (
                        <button onClick={() => setShowSearch(true)} className="w-8 h-8 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-all">
                            <Search size={18} />
                        </button>
                    )}

                    <button
                        onClick={() => navigate('/admin/alerts')}
                        className="relative w-8 h-8 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-all"
                    >
                        <Bell size={18} />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-[#1DB954] rounded-full ring-1 ring-[#0a0a0a]" />
                    </button>

                    <button
                        onClick={() => navigate('/home')}
                        className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white/50 hover:text-white border border-white/10 hover:border-white/20 transition-all"
                    >
                        ← App
                    </button>
                </header>

                {/* Page */}
                <main ref={setMainEl} className="flex-1 min-h-0 overflow-y-auto">
                    <Outlet />
                </main>

                {showScrollTop && (
                    <button
                        onClick={() => mainEl?.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="fixed bottom-5 right-5 z-30 w-10 h-10 rounded-full bg-[#1DB954] text-black shadow-lg shadow-[#1DB954]/30 hover:bg-[#1ed760] transition-colors flex items-center justify-center"
                        aria-label="Scroll to top"
                    >
                        <ArrowUp size={18} />
                    </button>
                )}
            </div>
        </div>
    )
}

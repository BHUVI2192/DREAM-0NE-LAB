import { useEffect, useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import {
    Users, BookOpen, Headphones, TrendingUp, Plus, List,
    ArrowUpRight, ArrowDownRight, RefreshCw
} from 'lucide-react'
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer
} from 'recharts'

// ── Animated count-up hook ──────────────────────────────────────
function useCountUp(target, duration = 1200) {
    const [value, setValue] = useState(0)
    const raf = useRef(null)
    useEffect(() => {
        if (!target) { setValue(0); return }
        const start = performance.now()
        const tick = (now) => {
            const progress = Math.min((now - start) / duration, 1)
            const ease = 1 - Math.pow(1 - progress, 3)
            setValue(Math.round(ease * target))
            if (progress < 1) raf.current = requestAnimationFrame(tick)
        }
        raf.current = requestAnimationFrame(tick)
        return () => cancelAnimationFrame(raf.current)
    }, [target, duration])
    return value
}

// ── Signups chart tooltip ────────────────────────────────────────
function SignupsTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null
    return (
        <div className="bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-sm shadow-xl">
            <p className="text-white/50 text-xs mb-1">{label}</p>
            <p className="text-white font-semibold">{payload[0].value.toLocaleString()} signups</p>
        </div>
    )
}

// ── Skeleton block ───────────────────────────────────────────────
function Skel({ className = '' }) {
    return <div className={`animate-pulse rounded-lg bg-white/5 ${className}`} />
}

export default function Dashboard() {
    const navigate = useNavigate()
    const [stats, setStats] = useState({ totalUsers: 0, totalBooks: 0, totalEpisodes: 0 })
    const [loading, setLoading] = useState(true)
    const [signupsData, setSignupsData] = useState([])
    const [recentUsers, setRecentUsers] = useState([])
    const [topBooks, setTopBooks] = useState([])
    const [refreshing, setRefreshing] = useState(false)

    const animUsers   = useCountUp(stats.totalUsers)
    const animBooks   = useCountUp(stats.totalBooks)
    const animEpisodes = useCountUp(stats.totalEpisodes)

    const loadStats = useCallback(async () => {
        const [usersRes, booksRes, epsRes] = await Promise.all([
            supabase.from('profiles').select('id', { count: 'exact' }),
            supabase.from('books').select('id', { count: 'exact' }).eq('is_published', true),
            supabase.from('episodes').select('id', { count: 'exact' })
        ])
        setStats({
            totalUsers: usersRes.count || 0,
            totalBooks: booksRes.count || 0,
            totalEpisodes: epsRes.count || 0
        })
    }, [])

    const loadChartData = useCallback(async () => {
        // Build last-7-day signups from profiles
        const d = new Date()
        d.setDate(d.getDate() - 7)
        const { data } = await supabase
            .from('profiles')
            .select('created_at')
            .gte('created_at', d.toISOString())

        const days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date()
            d.setDate(d.getDate() - (6 - i))
            return {
                date: d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
                raw: d.toDateString(),
                signups: 0
            }
        })

        data?.forEach(p => {
            const dStr = new Date(p.created_at).toDateString()
            const slot = days.find(d => d.raw === dStr)
            if (slot) slot.signups += 1
        })
        setSignupsData(days.map(d => ({ name: d.date, signups: d.signups })))
    }, [])

    const loadRecentUsers = useCallback(async () => {
        const { data } = await supabase
            .from('profiles')
            .select('id, full_name, email, created_at')
            .order('created_at', { ascending: false })
            .limit(5)
        setRecentUsers(data || [])
    }, [])

    const loadTopBooks = useCallback(async () => {
        const { data } = await supabase
            .from('books')
            .select('id, title, author, cover_url')
            .eq('is_published', true)
            .limit(5)
        setTopBooks(data || [])
    }, [])

    const loadAll = useCallback(async () => {
        setRefreshing(true)
        try {
            await Promise.all([loadStats(), loadChartData(), loadRecentUsers(), loadTopBooks()])
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }, [loadStats, loadChartData, loadRecentUsers, loadTopBooks])

    useEffect(() => { loadAll() }, [loadAll])

    return (
        <div className="p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8">

            {/* Page header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-white">Dashboard</h1>
                    <p className="text-white/40 text-sm mt-0.5">Welcome back — here's what's happening.</p>
                </div>
                <button
                    onClick={loadAll}
                    disabled={refreshing}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-sm transition-all border border-white/[0.06]"
                >
                    <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
                    <span className="hidden sm:inline">Refresh</span>
                </button>
            </div>

            {/* ── STAT CARDS ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                {loading ? (
                    Array(3).fill(0).map((_, i) => <Skel key={i} className="h-28 md:h-32" />)
                ) : (
                    <>
                        <StatCard
                            title="Total Users"
                            value={animUsers.toLocaleString()}
                            icon={<Users size={18} />}
                            glow="from-blue-500/20 to-transparent"
                            iconBg="bg-blue-500/15 text-blue-400"
                            trend={+5.2}
                        />
                        <StatCard
                            title="Published Books"
                            value={animBooks.toLocaleString()}
                            icon={<BookOpen size={18} />}
                            glow="from-purple-500/20 to-transparent"
                            iconBg="bg-purple-500/15 text-purple-400"
                            trend={+2}
                        />
                        <StatCard
                            title="Total Episodes"
                            value={animEpisodes.toLocaleString()}
                            icon={<Headphones size={18} />}
                            glow="from-[#1DB954]/20 to-transparent"
                            iconBg="bg-[#1DB954]/15 text-[#1DB954]"
                            trend={+8.1}
                        />
                    </>
                )}
            </div>

            {/* ── CHARTS ROW ── */}
            <div className="grid grid-cols-1 gap-4 md:gap-6">
                {/* Signups area chart */}
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 md:p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-white font-semibold text-sm">Sign-ups (7 days)</p>
                            <p className="text-white/40 text-xs mt-0.5">Daily new user registrations</p>
                        </div>
                        <span className="flex items-center gap-1 text-xs text-[#1DB954] bg-[#1DB954]/10 px-2 py-1 rounded-lg">
                            <TrendingUp size={12} /> This week
                        </span>
                    </div>
                    {loading ? (
                        <Skel className="h-48" />
                    ) : (
                        <ResponsiveContainer width="100%" height={180}>
                            <AreaChart data={signupsData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="signupsGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%"  stopColor="#1DB954" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#1DB954" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                                <XAxis dataKey="name" tick={{ fill: '#ffffff60', fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: '#ffffff60', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                                <Tooltip content={<SignupsTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)' }} />
                                <Area
                                    type="monotone"
                                    dataKey="signups"
                                    stroke="#1DB954"
                                    strokeWidth={2}
                                    fill="url(#signupsGrad)"
                                    dot={false}
                                    activeDot={{ r: 4, fill: '#1DB954', strokeWidth: 0 }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* ── QUICK ACTIONS ── */}
            <div>
                <h2 className="text-sm font-semibold text-white/60 uppercase tracking-widest mb-3">Quick Actions</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <ActionCard
                        label="Add Book"
                        sub="Upload new audiobook"
                        gradient="from-[#1DB954]/20 via-[#148040]/10 to-transparent"
                        icon={<Plus size={20} />}
                        iconColor="text-[#1DB954]"
                        onClick={() => navigate('/admin/books/new')}
                    />
                    <ActionCard
                        label="All Books"
                        sub="View & edit library"
                        gradient="from-purple-500/20 via-purple-500/5 to-transparent"
                        icon={<List size={20} />}
                        iconColor="text-purple-400"
                        onClick={() => navigate('/admin/books')}
                    />
                    <ActionCard
                        label="Users"
                        sub="Manage accounts"
                        gradient="from-blue-500/20 via-blue-500/5 to-transparent"
                        icon={<Users size={20} />}
                        iconColor="text-blue-400"
                        onClick={() => navigate('/admin/users')}
                    />
                </div>
            </div>

            {/* ── BOTTOM TABLES ── */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">

                {/* Recent sign-ups */}
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
                    <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-white/[0.06]">
                        <p className="text-white font-semibold text-sm">Recent Sign-ups</p>
                        <button onClick={() => navigate('/admin/users')} className="text-xs text-[#1DB954] hover:underline">View all</button>
                    </div>
                    {loading ? (
                        <div className="p-4 space-y-3">{Array(4).fill(0).map((_, i) => <Skel key={i} className="h-10" />)}</div>
                    ) : recentUsers.length === 0 ? (
                        <p className="text-white/30 text-sm text-center py-10">No users yet</p>
                    ) : (
                        <div className="divide-y divide-white/[0.04]">
                            {recentUsers.map(u => (
                                <div key={u.id} className="flex items-center gap-3 px-4 md:px-6 py-3 hover:bg-white/[0.03] transition-colors">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                        {u.full_name?.charAt(0)?.toUpperCase() || '?'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white text-sm truncate">{u.full_name || 'Unknown'}</p>
                                        <p className="text-white/40 text-xs truncate">{u.email || '—'}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Top books */}
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
                    <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-white/[0.06]">
                        <p className="text-white font-semibold text-sm">Library</p>
                        <button onClick={() => navigate('/admin/books')} className="text-xs text-[#1DB954] hover:underline">Manage</button>
                    </div>
                    {loading ? (
                        <div className="p-4 space-y-3">{Array(4).fill(0).map((_, i) => <Skel key={i} className="h-14" />)}</div>
                    ) : topBooks.length === 0 ? (
                        <p className="text-white/30 text-sm text-center py-10">No books yet</p>
                    ) : (
                        <div className="divide-y divide-white/[0.04]">
                            {topBooks.map(b => (
                                <div
                                    key={b.id}
                                    onClick={() => navigate(`/admin/books/${b.id}/edit`)}
                                    className="flex items-center gap-3 px-4 md:px-6 py-3 hover:bg-white/[0.03] transition-colors cursor-pointer group"
                                >
                                    <img
                                        src={b.cover_url || '/placeholder.jpg'}
                                        alt={b.title}
                                        className="w-10 h-10 rounded-md object-cover flex-shrink-0"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white text-sm truncate group-hover:text-white/80">{b.title}</p>
                                        <p className="text-white/40 text-xs truncate">{b.author}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

// ── Sub-components ───────────────────────────────────────────────

function StatCard({ title, value, icon, glow, iconBg, trend }) {
    const positive = trend >= 0
    return (
        <div className="relative bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 md:p-5 overflow-hidden group hover:border-white/10 transition-all">
            {/* Glow gradient */}
            <div className={`absolute top-0 left-0 w-full h-full bg-gradient-to-br ${glow} opacity-60 group-hover:opacity-100 transition-opacity pointer-events-none`} />
            <div className="relative">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-white/50 text-xs font-medium">{title}</span>
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconBg}`}>{icon}</span>
                </div>
                <div className="text-2xl md:text-3xl font-bold text-white tracking-tight">{value}</div>
                <div className={`flex items-center gap-1 mt-1.5 text-xs ${positive ? 'text-[#1DB954]' : 'text-red-400'}`}>
                    {positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    <span>{Math.abs(trend)}% this week</span>
                </div>
            </div>
        </div>
    )
}

function ActionCard({ label, sub, gradient, icon, iconColor, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`relative text-left bg-gradient-to-br ${gradient} border border-white/[0.06] rounded-2xl p-4 md:p-5 hover:border-white/10 transition-all group overflow-hidden`}
        >
            <div className={`${iconColor} mb-3 group-hover:scale-110 transition-transform`}>{icon}</div>
            <p className="text-white text-sm font-semibold">{label}</p>
            <p className="text-white/40 text-xs mt-0.5">{sub}</p>
            <ArrowUpRight size={14} className="absolute top-4 right-4 text-white/20 group-hover:text-white/60 transition-colors" />
        </button>
    )
}

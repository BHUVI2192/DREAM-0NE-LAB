import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Users as UsersIcon, Search, Crown, User } from 'lucide-react'

function Skel({ className = '' }) {
    return <div className={`animate-pulse rounded-lg bg-white/5 ${className}`} />
}

export default function Users() {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')

    useEffect(() => { loadUsers() }, [])

    const loadUsers = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false })
            if (error) throw error
            setUsers(data || [])
        } catch (error) {
            console.error('Failed to load users:', error)
        } finally {
            setLoading(false)
        }
    }

    const filteredUsers = users.filter(u =>
        u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        u.phone?.includes(search) ||
        u.phone_number?.includes(search) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
    )

    const isSubscribed = (p) =>
        p?.subscription_tier === 'premium' &&
        p?.subscription_expiry &&
        new Date(p.subscription_expiry) > new Date()

    return (
        <div className="p-4 md:p-6 lg:p-8 space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-white">Users</h1>
                    <p className="text-white/40 text-sm mt-0.5">{users.length} total accounts</p>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search by name, phone or email…"
                    className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-white/20 placeholder-white/30 transition-colors"
                />
            </div>

            {loading ? (
                /* Skeleton */
                <div className="space-y-2">
                    {Array(6).fill(0).map((_, i) => <Skel key={i} className="h-[60px]" />)}
                </div>
            ) : filteredUsers.length === 0 ? (
                <div className="text-center py-20">
                    <UsersIcon className="w-12 h-12 mx-auto mb-3 text-white/10" />
                    <p className="text-white/30 text-sm">No users found</p>
                </div>
            ) : (
                <>
                    {/* Desktop table */}
                    <div className="hidden md:block bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/[0.06]">
                                    <th className="text-left px-5 py-3.5 text-white/40 text-xs font-semibold uppercase tracking-wider">User</th>
                                    <th className="text-left px-5 py-3.5 text-white/40 text-xs font-semibold uppercase tracking-wider">Contact</th>
                                    <th className="text-left px-5 py-3.5 text-white/40 text-xs font-semibold uppercase tracking-wider">Status</th>
                                    <th className="text-left px-5 py-3.5 text-white/40 text-xs font-semibold uppercase tracking-wider">Joined</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.04]">
                                {filteredUsers.map(user => (
                                    <tr key={user.id} className="hover:bg-white/[0.03] transition-colors group">
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                                    {user.full_name?.charAt(0)?.toUpperCase() || <User size={14} />}
                                                </div>
                                                <span className="text-white text-sm">{user.full_name || 'Unknown'}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <p className="text-white/60 text-sm">{user.email || '—'}</p>
                                            <p className="text-white/30 text-xs">{user.phone || user.phone_number || '—'}</p>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            {isSubscribed(user) ? (
                                                <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-[#1DB954]/15 text-[#1DB954] font-medium">
                                                    <Crown size={10} /> Premium
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-white/5 text-white/40 font-medium">
                                                    <User size={10} /> Free
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-5 py-3.5 text-white/40 text-sm">
                                            {new Date(user.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile cards */}
                    <div className="md:hidden space-y-2">
                        {filteredUsers.map(user => (
                            <div key={user.id} className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3">
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                    {user.full_name?.charAt(0)?.toUpperCase() || '?'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-white text-sm font-medium truncate">{user.full_name || 'Unknown'}</p>
                                    <p className="text-white/40 text-xs truncate">{user.email || user.phone || user.phone_number || '—'}</p>
                                </div>
                                {isSubscribed(user) ? (
                                    <span className="flex-shrink-0 text-[10px] px-2 py-0.5 rounded-full bg-[#1DB954]/15 text-[#1DB954] font-medium">Premium</span>
                                ) : (
                                    <span className="flex-shrink-0 text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/40">Free</span>
                                )}
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}

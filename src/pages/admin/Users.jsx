import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Users as UsersIcon, Search } from 'lucide-react'

export default function Users() {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')

    useEffect(() => {
        loadUsers()
    }, [])

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

    const filteredUsers = users.filter(user =>
        user.name?.toLowerCase().includes(search.toLowerCase()) ||
        user.phone?.includes(search) ||
        user.email?.toLowerCase().includes(search.toLowerCase())
    )

    const isSubscribed = (subscriptionEnd) => {
        return subscriptionEnd && new Date(subscriptionEnd) > new Date()
    }

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <h1 className="font-display text-3xl font-bold text-white">Users</h1>
            </div>

            <div className="mb-6">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search users by name, phone, or email..."
                        className="w-full bg-bg-secondary border border-border-subtle rounded-lg pl-12 pr-4 py-3 text-white focus:outline-none focus:border-accent"
                    />
                </div>
            </div>

            {loading ? (
                <div className="text-center text-text-muted py-12">Loading...</div>
            ) : filteredUsers.length === 0 ? (
                <div className="text-center text-text-muted py-12">
                    <UsersIcon className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p>No users found</p>
                </div>
            ) : (
                <div className="bg-bg-elevated border border-border-subtle rounded-xl overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-bg-secondary">
                            <tr>
                                <th className="text-left px-6 py-4 text-text-muted font-semibold">Name</th>
                                <th className="text-left px-6 py-4 text-text-muted font-semibold">Phone</th>
                                <th className="text-left px-6 py-4 text-text-muted font-semibold">Email</th>
                                <th className="text-left px-6 py-4 text-text-muted font-semibold">Status</th>
                                <th className="text-left px-6 py-4 text-text-muted font-semibold">Joined</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="border-t border-border-subtle hover:bg-bg-secondary/50">
                                    <td className="px-6 py-4 text-white">{user.name || 'N/A'}</td>
                                    <td className="px-6 py-4 text-text-muted">{user.phone || 'N/A'}</td>
                                    <td className="px-6 py-4 text-text-muted">{user.email || 'N/A'}</td>
                                    <td className="px-6 py-4">
                                        <span className={`text-xs px-3 py-1 rounded-full ${isSubscribed(user.subscription_end) ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                                            {isSubscribed(user.subscription_end) ? 'Active' : 'Free'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-text-muted text-sm">
                                        {new Date(user.created_at).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}

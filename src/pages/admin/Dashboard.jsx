import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Users, BookOpen, DollarSign, Activity } from 'lucide-react'

export default function Dashboard() {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalBooks: 0,
        activeSubscriptions: 0,
        revenue: 0
    })

    useEffect(() => {
        loadStats()
    }, [])

    const loadStats = async () => {
        try {
            const [usersRes, booksRes, subsRes, revenueRes] = await Promise.all([
                supabase.from('profiles').select('id', { count: 'exact' }),
                supabase.from('books').select('id', { count: 'exact' }),
                supabase.from('profiles').select('id', { count: 'exact' }).gt('subscription_end', new Date().toISOString()),
                supabase.from('purchases').select('amount', { count: 'exact' }).eq('status', 'success')
            ])

            const totalRevenue = revenueRes.data?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0

            setStats({
                totalUsers: usersRes.count || 0,
                totalBooks: booksRes.count || 0,
                activeSubscriptions: subsRes.count || 0,
                revenue: totalRevenue
            })
        } catch (error) {
            console.error('Failed to load stats:', error)
        }
    }

    return (
        <div className="p-8">
            <h1 className="font-display text-3xl font-bold text-white mb-8">Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Users"
                    value={stats.totalUsers}
                    icon={<Users className="w-6 h-6" />}
                    color="text-blue-400"
                />
                <StatCard
                    title="Total Books"
                    value={stats.totalBooks}
                    icon={<BookOpen className="w-6 h-6" />}
                    color="text-purple-400"
                />
                <StatCard
                    title="Active Subscriptions"
                    value={stats.activeSubscriptions}
                    icon={<Activity className="w-6 h-6" />}
                    color="text-green-400"
                />
                <StatCard
                    title="Total Revenue"
                    value={`₹${stats.revenue}`}
                    icon={<DollarSign className="w-6 h-6" />}
                    color="text-yellow-400"
                />
            </div>
        </div>
    )
}

function StatCard({ title, value, icon, color }) {
    return (
        <div className="bg-bg-elevated border border-border-subtle rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
                <span className="text-text-muted text-sm">{title}</span>
                <span className={color}>{icon}</span>
            </div>
            <div className="font-display text-3xl font-bold text-white">{value}</div>
        </div>
    )
}

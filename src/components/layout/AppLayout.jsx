import { Outlet, Link, useNavigate } from 'react-router-dom'
import { Home, Library, User, LogOut } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import useAuth from '../../hooks/useAuth'

export default function AppLayout() {
    const { user } = useAuth()
    const navigate = useNavigate()

    const handleLogout = async () => {
        await supabase.auth.signOut()
        navigate('/login')
    }

    return (
        <div className="min-h-screen bg-bg-primary">
            <nav className="bg-bg-elevated border-b border-border-subtle">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <Link to="/home" className="text-2xl font-bold text-accent">
                            Dream One Lab
                        </Link>
                        <div className="flex items-center gap-6">
                            <Link to="/home" className="flex items-center gap-2 text-text-secondary hover:text-white transition-colors">
                                <Home size={20} />
                                <span>Home</span>
                            </Link>
                            <Link to="/library" className="flex items-center gap-2 text-text-secondary hover:text-white transition-colors">
                                <Library size={20} />
                                <span>Library</span>
                            </Link>
                            <Link to="/profile" className="flex items-center gap-2 text-text-secondary hover:text-white transition-colors">
                                <User size={20} />
                                <span>Profile</span>
                            </Link>
                            <button onClick={handleLogout} className="flex items-center gap-2 text-text-secondary hover:text-white transition-colors">
                                <LogOut size={20} />
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>
            <main className="container mx-auto px-4 py-8">
                <Outlet />
            </main>
        </div>
    )
}

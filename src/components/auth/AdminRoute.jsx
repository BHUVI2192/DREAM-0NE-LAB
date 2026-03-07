import { Navigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'

export default function AdminRoute({ children }) {
    const { user, loading } = useAuth()
    const isAdmin = user?.app_metadata?.role === 'admin'

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-bg-primary">
                <div className="text-accent text-xl">Loading...</div>
            </div>
        )
    }

    if (!user || !isAdmin) {
        return <Navigate to="/home" replace />
    }

    return children
}

import { Navigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import AuthBootstrapState from './AuthBootstrapState'

export default function AdminRoute({ children }) {
    const { user, isAdmin, loading, authError } = useAuth()

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-bg-primary">
                <div className="text-accent text-xl">Loading...</div>
            </div>
        )
    }

    if (authError && !user) {
        return (
            <AuthBootstrapState
                title="Connection issue"
                message={authError.message}
            />
        )
    }

    if (authError && user && !isAdmin) {
        return (
            <AuthBootstrapState
                title="Unable to verify admin access"
                message={authError.message}
                actionLabel="Retry verification"
            />
        )
    }

    if (!user || !isAdmin) {
        return <Navigate to="/home" replace />
    }

    return children
}

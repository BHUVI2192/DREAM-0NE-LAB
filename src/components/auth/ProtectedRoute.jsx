import { Navigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import AuthBootstrapState from './AuthBootstrapState'

export default function ProtectedRoute({ children }) {
    const { user, loading, authError } = useAuth()

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

    if (!user) {
        return <Navigate to="/login" replace />
    }

    return children
}

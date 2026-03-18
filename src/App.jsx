import { Suspense, lazy, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import useAuthStore from './store/authStore'
import ProtectedRoute from './components/auth/ProtectedRoute'
import AdminRoute from './components/auth/AdminRoute'

const AppLayout = lazy(() => import('./components/layout/SpotifyAppLayout'))
const AdminLayout = lazy(() => import('./components/layout/AdminLayout'))

const Landing = lazy(() => import('./pages/Landing'))
const Login = lazy(() => import('./pages/Login'))
const Signup = lazy(() => import('./pages/Signup'))
const SeedData = lazy(() => import('./pages/SeedData'))

const Home = lazy(() => import('./pages/Home_Spotify'))
const Search = lazy(() => import('./pages/Search_Spotify'))
const Bookmarks = lazy(() => import('./pages/Bookmarks'))
const BookDetail = lazy(() => import('./pages/BookDetail_Spotify'))
const Player = lazy(() => import('./pages/Player'))
const Profile = lazy(() => import('./pages/Profile'))
const PaymentResult = lazy(() => import('./pages/PaymentResult'))
const Support = lazy(() => import('./pages/Support'))
const Subscription = lazy(() => import('./pages/Subscription'))

const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'))
const AdminBooks = lazy(() => import('./pages/admin/Books'))
const BookForm = lazy(() => import('./pages/admin/BookForm'))
const Episodes = lazy(() => import('./pages/admin/Episodes'))
const AdminSetup = lazy(() => import('./pages/admin/AdminSetup'))
const AdminUsers = lazy(() => import('./pages/admin/Users'))
const AdminAlerts = lazy(() => import('./pages/admin/Alerts'))

function isTransientNetworkError(error) {
    const message = `${error?.message || ''} ${error?.name || ''} ${error?.code || ''}`.toLowerCase()

    return (
        (typeof navigator !== 'undefined' && navigator.onLine === false) ||
        message.includes('failed to fetch') ||
        message.includes('network') ||
        message.includes('fetch') ||
        message.includes('timeout') ||
        message.includes('address unreachable')
    )
}

function formatAuthBootstrapMessage(scope, error) {
    if (isTransientNetworkError(error)) {
        return scope === 'profile'
            ? 'Signed in, but Dream One Lab could not refresh your account details. Some account-dependent features may be stale until the connection returns.'
            : 'Dream One Lab could not reach Supabase to verify your session. Check the connection and retry.'
    }

    return scope === 'profile'
        ? 'Dream One Lab could not load your account details. Some account-dependent features may be unavailable until retry.'
        : 'Dream One Lab could not verify your session. Retry to continue.'
}

export default function App() {
    const { actions } = useAuthStore()

    const fallback = (
        <div className="min-h-screen flex items-center justify-center bg-bg-primary text-text-muted">
            Loading...
        </div>
    )

    useEffect(() => {
        let isActive = true

        const setBootstrapError = (scope, error) => {
            if (!isActive) return

            actions.setAuthError({
                scope,
                message: formatAuthBootstrapMessage(scope, error),
                isNetworkError: isTransientNetworkError(error),
            })
            actions.setLoading(false)
        }

        const handleSession = async (session) => {
            const user = session?.user ?? null

            if (!isActive) return

            actions.setUser(user)
            actions.clearAuthError()

            if (user) {
                try {
                    const { data: profile, error } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', user.id)
                        .single()

                    if (error && error.code === 'PGRST116') {
                        const isPhoneUser = user.user_metadata?.is_phone_user
                        const phone = isPhoneUser ? user.user_metadata?.phone_number : (user.phone ?? '')
                        const email = isPhoneUser ? '' : (user.email ?? '')
                        const full_name = user.user_metadata?.full_name ?? ''

                        const { data: newProfile, error: insertError } = await supabase
                            .from('profiles')
                            .insert({
                                id: user.id,
                                phone,
                                email,
                                full_name
                            })
                            .select()
                            .single()

                        if (insertError) {
                            throw insertError
                        }

                        if (!isActive) return
                        actions.setProfile(newProfile ?? null)
                    } else if (error) {
                        throw error
                    } else {
                        if (!isActive) return
                        actions.setProfile(profile ?? null)
                    }
                } catch (error) {
                    console.error('Error loading auth profile:', error)
                    setBootstrapError('profile', error)
                    return
                }
            } else {
                actions.setProfile(null)
            }

            if (!isActive) return
            actions.setLoading(false)
        }

        const bootstrapAuth = async (sessionOverride) => {
            if (!isActive) return

            actions.setLoading(true)

            try {
                if (sessionOverride !== undefined) {
                    await handleSession(sessionOverride)
                    return
                }

                const { data: { session } } = await supabase.auth.getSession()
                await handleSession(session)
            } catch (error) {
                console.error('Error bootstrapping auth session:', error)
                setBootstrapError('session', error)
            }
        }

        void bootstrapAuth()

        const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_OUT') {
                actions.logout()
            } else {
                void bootstrapAuth(session)
            }
        })

        const retryBootstrap = () => {
            void bootstrapAuth()
        }

        window.addEventListener('online', retryBootstrap)
        window.addEventListener('dreamlab:retry-auth-bootstrap', retryBootstrap)

        return () => {
            isActive = false
            listener.subscription.unsubscribe()
            window.removeEventListener('online', retryBootstrap)
            window.removeEventListener('dreamlab:retry-auth-bootstrap', retryBootstrap)
        }
    }, [actions])

    return (
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Suspense fallback={fallback}>
                <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/seed-data" element={<SeedData />} />

                <Route
                    element={
                        <ProtectedRoute>
                            <AppLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route path="/home" element={<Home />} />
                    <Route path="/search" element={<Search />} />
                    <Route path="/bookmarks" element={<Bookmarks />} />
                    <Route path="/book/:bookId" element={<BookDetail />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/support" element={<Support />} />
                    <Route path="/payment/result" element={<PaymentResult />} />
                    <Route path="/payment/callback" element={<PaymentResult />} />
                </Route>

                {/* Subscription Page - Full screen */}
                <Route
                    path="/subscription"
                    element={
                        <ProtectedRoute>
                            <Subscription />
                        </ProtectedRoute>
                    }
                />

                {/* Full-screen Player (outside AppLayout for immersive experience) */}
                <Route
                    path="/book/:bookId/episode/:epId"
                    element={
                        <ProtectedRoute>
                            <Player />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/player"
                    element={
                        <ProtectedRoute>
                            <Player />
                        </ProtectedRoute>
                    }
                />

                <Route
                    element={
                        <AdminRoute>
                            <AdminLayout />
                        </AdminRoute>
                    }
                >
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/admin/books" element={<AdminBooks />} />
                    <Route path="/admin/books/new" element={<BookForm />} />
                    <Route path="/admin/books/:id/edit" element={<BookForm />} />
                    <Route path="/admin/books/:id/episodes" element={<Episodes />} />
                    <Route path="/admin/users" element={<AdminUsers />} />
                    <Route path="/admin/alerts" element={<AdminAlerts />} />
                </Route>

                <Route path="/admin-setup" element={<AdminSetup />} />
                <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Suspense>
        </BrowserRouter>
    )
}

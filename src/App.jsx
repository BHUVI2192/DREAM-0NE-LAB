import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import useAuthStore from './store/authStore'
import ProtectedRoute from './components/auth/ProtectedRoute'
import AdminRoute from './components/auth/AdminRoute'

// Layouts
import AppLayout from './components/layout/AppLayout'
import AdminLayout from './components/layout/AdminLayout'

// Public pages
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import SeedData from './pages/SeedData'

// Protected pages
import Home from './pages/Home'
import Library from './pages/Library'
import BookDetail from './pages/BookDetail'
import Player from './pages/Player'
import Profile from './pages/Profile'
import PaymentResult from './pages/PaymentResult'
import Support from './pages/Support'

// Admin pages
import AdminDashboard from './pages/admin/Dashboard'
import AdminBooks from './pages/admin/Books'
import BookForm from './pages/admin/BookForm'
import Episodes from './pages/admin/Episodes'
import AdminSetup from './pages/admin/AdminSetup'
import AdminSettings from './pages/admin/Settings'
import AdminUsers from './pages/admin/Users'
import AdminAlerts from './pages/admin/Alerts'

export default function App() {
    const { actions } = useAuthStore()

    useEffect(() => {
        const handleSession = async (session) => {
            const user = session?.user ?? null
            actions.setUser(user)

            if (user) {
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

                    const { data: newProfile } = await supabase
                        .from('profiles')
                        .insert({
                            id: user.id,
                            phone,
                            email,
                            full_name
                        })
                        .select()
                        .single()
                    actions.setProfile(newProfile ?? null)
                } else {
                    actions.setProfile(profile ?? null)
                }
            } else {
                actions.setProfile(null)
            }

            actions.setLoading(false)
        }

        supabase.auth.getSession()
            .then(({ data: { session } }) => handleSession(session))
            .catch(() => {
                actions.setUser(null)
                actions.setLoading(false)
            })

        const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_OUT') {
                actions.logout()
            } else {
                handleSession(session)
            }
        })

        return () => listener.subscription.unsubscribe()
    }, [])

    return (
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
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
                    <Route path="/library" element={<Library />} />
                    <Route path="/book/:bookId" element={<BookDetail />} />
                    <Route path="/book/:bookId/episode/:epId" element={<Player />} />
                    <Route path="/player" element={<Player />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/support" element={<Support />} />
                    <Route path="/payment/result" element={<PaymentResult />} />
                    <Route path="/payment/callback" element={<PaymentResult />} />
                </Route>

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
                    <Route path="/admin/settings" element={<AdminSettings />} />
                </Route>

                <Route path="/admin-setup" element={<AdminSetup />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    )
}

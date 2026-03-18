// ============================================
// HOW TO ACTIVATE SPOTIFY DESIGN
// ============================================
// Copy and paste these exact changes into your App.jsx file

// STEP 1: Update imports at the top of App.jsx (around lines 8-20)
// ─────────────────────────────────────────────────────────────

// BEFORE (OLD):
// import AppLayout from './components/layout/AppLayout'
// import Home from './pages/Home'
// import BookDetail from './pages/BookDetail'

// AFTER (NEW - Spotify Style):
import AppLayout from './components/layout/SpotifyAppLayout'
import Home from './pages/Home_Spotify'
import BookDetail from './pages/BookDetail_Spotify'

// ============================================
// That's it! Just change those 3 lines.
// ============================================

// Your App.jsx should now look like this:
// ─────────────────────────────────────────

import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import useAuthStore from './store/authStore'
import ProtectedRoute from './components/auth/ProtectedRoute'
import AdminRoute from './components/auth/AdminRoute'

// Layouts
import AppLayout from './components/layout/SpotifyAppLayout'  // ← CHANGED THIS
import AdminLayout from './components/layout/AdminLayout'

// Public pages
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import SeedData from './pages/SeedData'

// Protected pages
import Home from './pages/Home_Spotify'  // ← CHANGED THIS
import Library from './pages/Library'
import BookDetail from './pages/BookDetail_Spotify'  // ← CHANGED THIS
import Player from './pages/Player'
import Profile from './pages/Profile'
import PaymentResult from './pages/PaymentResult'
import Support from './pages/Support'
import Subscription from './pages/Subscription'

// Admin pages
import AdminDashboard from './pages/admin/Dashboard'
import AdminBooks from './pages/admin/Books'
import BookForm from './pages/admin/BookForm'
import Episodes from './pages/admin/Episodes'
import AdminSetup from './pages/admin/AdminSetup'
import AdminSettings from './pages/admin/Settings'
import AdminUsers from './pages/admin/Users'
import AdminAlerts from './pages/admin/Alerts'

// ... rest of App.jsx stays the same ...

// ============================================
// ALTERNATIVE: Keep both versions and compare
// ============================================

// If you want to test the new design without removing the old one:

// 1. Keep the old imports
// 2. Add new imports with aliases:
import SpotifyHome from './pages/Home_Spotify'
import SpotifyBookDetail from './pages/BookDetail_Spotify'
import SpotifyLayout from './components/layout/SpotifyAppLayout'

// 3. Add new routes:
<Route path="/spotify" element={
  <ProtectedRoute>
    <SpotifyLayout />
  </ProtectedRoute>
}>
  <Route path="/spotify/home" element={<SpotifyHome />} />
  <Route path="/spotify/book/:bookId" element={<SpotifyBookDetail />} />
</Route>

// Then visit: http://localhost:5173/spotify/home

// ============================================
// DONE! Run: npm run dev
// ============================================

import useAuthStore from '../store/authStore'

export default function useAuth() {
  const { user, profile, loading, authError } = useAuthStore()
  
  const isSubscribed = profile?.subscription_tier === 'premium' && 
      profile?.subscription_expiry && 
      new Date(profile.subscription_expiry) > new Date()

    return { 
      user, 
      profile, 
      loading,
      authError,
      isAuthenticated: !!user,
      isAdmin: profile?.role === 'admin',
      isSubscribed
    }
}

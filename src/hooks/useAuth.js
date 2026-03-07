import useAuthStore from '../store/authStore'

export default function useAuth() {
  const { user, profile, loading } = useAuthStore()
  
  const isSubscribed = profile?.subscription_tier === 'premium' && 
      profile?.subscription_expiry && 
      new Date(profile.subscription_expiry) > new Date()

  return { 
    user, 
    profile, 
    loading,
    isAuthenticated: !!user,
    isAdmin: profile?.is_admin || false,
    isSubscribed
  }
}

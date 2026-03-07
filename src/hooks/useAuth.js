import useAuthStore from '../store/authStore'

export default function useAuth() {
  const { user, profile, loading } = useAuthStore()
  return { user, profile, loading }
}

import { create } from 'zustand'

const useAuthStore = create((set) => ({
  user: null,
  profile: null,
  loading: true,
  authError: null,
  actions: {
    setUser: (user) => set({ user }),
    setProfile: (profile) => set({ profile }),
    setLoading: (loading) => set({ loading }),
    setAuthError: (authError) => set({ authError }),
    clearAuthError: () => set({ authError: null }),
    logout: () => set({ user: null, profile: null, authError: null, loading: false }),
  },
}))

export default useAuthStore

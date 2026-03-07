import { create} from 'zustand'

const usePlayerStore = create((set) => ({
  currentEpisode: null,
  isPlaying: false,
  progress: 0,
  duration: 0,
  actions: {
    setCurrentEpisode: (episode) => set({ currentEpisode: episode }),
    setIsPlaying: (isPlaying) => set({ isPlaying }),
    setProgress: (progress) => set({ progress }),
    setDuration: (duration) => set({ duration }),
  },
}))

export default usePlayerStore

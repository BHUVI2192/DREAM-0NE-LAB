import { create } from 'zustand'

const usePlayerStore = create((set, get) => ({
    currentEpisode: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    playlist: [],

    setCurrentEpisode: (episode) => set({ currentEpisode: episode }),
    setIsPlaying: (playing) => set({ isPlaying: playing }),
    setCurrentTime: (time) => set({ currentTime: time }),
    setDuration: (duration) => set({ duration: duration }),
    setPlaylist: (playlist) => set({ playlist }),

    play: () => set({ isPlaying: true }),
    pause: () => set({ isPlaying: false }),
    togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

    playEpisode: (episode, playlist = []) => {
        set({
            currentEpisode: episode,
            isPlaying: true,
            currentTime: 0,
            playlist: playlist.length > 0 ? playlist : [episode]
        })
    },

    playNext: () => {
        const { currentEpisode, playlist } = get()
        if (!currentEpisode || playlist.length === 0) return

        const currentIndex = playlist.findIndex(ep => ep.id === currentEpisode.id)
        if (currentIndex < playlist.length - 1) {
            get().playEpisode(playlist[currentIndex + 1], playlist)
        }
    },

    playPrevious: () => {
        const { currentEpisode, playlist, currentTime } = get()
        if (!currentEpisode || playlist.length === 0) return

        if (currentTime > 3) {
            set({ currentTime: 0 })
            return
        }

        const currentIndex = playlist.findIndex(ep => ep.id === currentEpisode.id)
        if (currentIndex > 0) {
            get().playEpisode(playlist[currentIndex - 1], playlist)
        }
    },

    reset: () => set({
        currentEpisode: null,
        isPlaying: false,
        currentTime: 0,
        duration: 0,
        playlist: []
    })
}))

export default function usePlayer() {
    return usePlayerStore()
}

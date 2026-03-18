import { create } from 'zustand'

/**
 * playerStore — manages the persistent audio player state across the app.
 */
const usePlayerStore = create((set, get) => ({
    currentEpisode: null,
    currentBook: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    playbackRate: 1,

    actions: {
        setEpisode(episode, book) {
            set({ currentEpisode: episode, currentBook: book, currentTime: 0, isPlaying: true })
        },

        setCurrentEpisode(episode) {
            set({ currentEpisode: episode })
        },

        setCurrentBook(book) {
            set({ currentBook: book })
        },

        setIsPlaying(isPlaying) {
            set({ isPlaying })
        },

        play() {
            set({ isPlaying: true })
        },

        pause() {
            set({ isPlaying: false })
        },

        togglePlay() {
            set((state) => ({ isPlaying: !state.isPlaying }))
        },

        seek(seconds) {
            set({ currentTime: seconds })
        },

        skipForward() {
            const { currentTime, duration } = get()
            set({ currentTime: Math.min(currentTime + 15, duration) })
        },

        skipBack() {
            const { currentTime } = get()
            set({ currentTime: Math.max(currentTime - 15, 0) })
        },

        setCurrentTime(t) {
            set({ currentTime: t })
        },

        setDuration(d) {
            set({ duration: d })
        },

        setVolume(v) {
            set({ volume: Math.max(0, Math.min(1, v)) })
        },

        setPlaybackRate(rate) {
            set({ playbackRate: Math.max(0.5, Math.min(2, rate)) })
        },
    },
}))

export default usePlayerStore

import { useCallback, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { fetchSuccessfulPurchases } from '../lib/purchases'
import usePlayerStore from '../store/playerStore'
import useAuthStore from '../store/authStore'

// Singleton HTML Audio Instance
if (typeof window !== 'undefined' && !window._dreamLabAudio) {
    window._dreamLabAudio = new Audio()
    window._dreamLabAudio.preload = 'metadata'
}

const DEMO_AUDIO_URL = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'

function resolveAudioSource(audioUrl) {
    if (!audioUrl) return DEMO_AUDIO_URL

    try {
        const parsed = new URL(audioUrl)
        if (parsed.hostname === 'example.com' || parsed.hostname === 'www.example.com') {
            return DEMO_AUDIO_URL
        }
    } catch {
        return DEMO_AUDIO_URL
    }

    return audioUrl
}

export default function useAudioEngine() {
    const audio = typeof window !== 'undefined' ? window._dreamLabAudio : null
    const {
        actions,
        currentEpisode,
        currentBook,
        isPlaying,
        currentTime,
        duration,
        volume,
        playbackRate
    } = usePlayerStore()

    const { user } = useAuthStore()

    // Keep refs for debouncing and effect closures
    const progressTimeoutRef = useRef(null)
    const hasTrackedListenRef = useRef(false)
    const hasTrackedHalfwayRef = useRef(false)

    // Sync volume and playback rate from store to audio element
    useEffect(() => {
        if (audio) {
            audio.volume = volume
            audio.playbackRate = playbackRate
        }
    }, [volume, playbackRate, audio])

    // --- Core Operations ---

    const saveProgress = useCallback(async (timeSeconds) => {
        if (!user || !currentEpisode) return

        const position = Math.floor(timeSeconds)
        if (position <= 1) return // don't bother saving 0s

        try {
            await supabase.from('listen_progress').upsert({
                user_id: user.id,
                episode_id: currentEpisode.id,
                position_seconds: position,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'user_id,episode_id'
            })
        } catch (err) {
            console.error('Failed to save progress:', err)
        }
    }, [user, currentEpisode])

    const trackListen = useCallback(async (epId) => {
        if (!user) return
        try {
            await supabase.from('listens').insert({
                user_id: user.id,
                episode_id: epId,
            })
        } catch (err) {
            console.error('Failed to log listen:', err)
        }
    }, [user])

    const loadEpisode = useCallback(async (episode, book) => {
        if (!audio || !episode) return

        // Wait to save any pending progress from the last episode before switching
        if (progressTimeoutRef.current) {
            clearTimeout(progressTimeoutRef.current)
            progressTimeoutRef.current = null
            if (currentEpisode) {
                await saveProgress(audio.currentTime)
            }
        }

        // Only reload if it's a new episode
        if (currentEpisode?.id !== episode.id) {
            hasTrackedListenRef.current = false
            hasTrackedHalfwayRef.current = false

            actions.setCurrentEpisode(episode)
            if (book) actions.setCurrentBook(book)
            actions.setCurrentTime(0)
            actions.setDuration(episode.duration_seconds || 0)

            audio.src = resolveAudioSource(episode.audio_url)

            // Fetch previous progress
            if (user) {
                const { data } = await supabase
                    .from('listen_progress')
                    .select('position_seconds')
                    .eq('user_id', user.id)
                    .eq('episode_id', episode.id)
                    .maybeSingle()

                if (data && data.position_seconds > 0) {
                    audio.currentTime = data.position_seconds
                }
            }

            audio.load()
        }

        try {
            await audio.play()
            if (!hasTrackedListenRef.current) {
                hasTrackedListenRef.current = true
                trackListen(episode.id)
            }
        } catch (err) {
            console.error("Audio playback failed (likely browser policy):", err)
            actions.setIsPlaying(false)
        }
    }, [audio, currentEpisode, user, actions, saveProgress, trackListen])

    const handleAutoAdvance = useCallback(async () => {
        if (!currentEpisode || !currentBook) return

        // Find next episode in the same book
        const { data: nextEpisodes } = await supabase
            .from('episodes')
            .select('*')
            .eq('book_id', currentBook.id)
            .eq('episode_number', currentEpisode.episode_number + 1)
            .limit(1)

        if (nextEpisodes && nextEpisodes.length > 0) {
            const nextEp = nextEpisodes[0]

            // Basic access check for auto-advance
            const isFree = nextEp.is_free || nextEp.episode_number <= 2

            let canPlay = isFree
            if (!canPlay && user) {
                const { data: purchase } = await fetchSuccessfulPurchases({
                    select: 'id',
                    filters: [
                        { column: 'user_id', value: user.id },
                        { column: 'book_id', value: currentBook.id },
                    ],
                    maybeSingle: true,
                })

                let subscription = null
                const subResponse = await supabase
                    .from('subscriptions')
                    .select('id')
                    .eq('user_id', user.id)
                    .eq('status', 'active')
                    .gt('expires_at', new Date().toISOString())
                    .maybeSingle()

                if (!subResponse.error) {
                    subscription = subResponse.data
                }

                if (purchase) canPlay = true
                if (!currentBook.is_premium && subscription) canPlay = true
            }

            if (canPlay) {
                loadEpisode(nextEp, currentBook)
            } else {
                console.log('Next episode is locked. Stopping playback.')
            }
        }
    }, [currentEpisode, currentBook, user, loadEpisode])

    // Setup global audio listeners once
    useEffect(() => {
        if (!audio) return

        const handleTimeUpdate = () => {
            actions.setCurrentTime(audio.currentTime)

            // Track halfway listen event
            if (
                audio.duration > 0 &&
                audio.currentTime > audio.duration / 2 &&
                !hasTrackedHalfwayRef.current &&
                user &&
                currentEpisode
            ) {
                hasTrackedHalfwayRef.current = true
                console.log('Halfway point reached')
                // Halfway tracking can be added here if needed
            }

            // Debounce save progress to Supabase (every 10s)
            if (progressTimeoutRef.current) return

            progressTimeoutRef.current = setTimeout(() => {
                saveProgress(audio.currentTime)
                progressTimeoutRef.current = null
            }, 10000)
        }

        const handleLoadedMetadata = () => {
            actions.setDuration(audio.duration)
        }

        const handlePlay = () => actions.setIsPlaying(true)
        const handlePause = () => actions.setIsPlaying(false)

        const handleEnded = () => {
            actions.setIsPlaying(false)
            handleAutoAdvance()
        }

        audio.addEventListener('timeupdate', handleTimeUpdate)
        audio.addEventListener('loadedmetadata', handleLoadedMetadata)
        audio.addEventListener('play', handlePlay)
        audio.addEventListener('pause', handlePause)
        audio.addEventListener('ended', handleEnded)

        return () => {
            audio.removeEventListener('timeupdate', handleTimeUpdate)
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
            audio.removeEventListener('play', handlePlay)
            audio.removeEventListener('pause', handlePause)
            audio.removeEventListener('ended', handleEnded)
            if (progressTimeoutRef.current) clearTimeout(progressTimeoutRef.current)
        }
    }, [audio, user, currentEpisode, currentBook, actions, handleAutoAdvance, saveProgress])

    const play = () => audio?.play().catch(console.error)
    const pause = () => audio?.pause()
    const togglePlay = () => {
        if (!audio) return
        if (audio.paused) {
            play()
        } else {
            pause()
        }
    }

    const seek = (timeSeconds) => {
        if (!audio) return
        audio.currentTime = Math.max(0, Math.min(timeSeconds, audio.duration || 0))
    }

    const skipForward = () => seek(audio.currentTime + 15)
    const skipBack = () => seek(audio.currentTime - 15)

    const setVolumeLevel = (v) => {
        actions.setVolume(v) // will sync to audio element via useEffect
    }

    const setPlaybackRateLevel = (rate) => {
        actions.setPlaybackRate(rate) // will sync to audio element via useEffect
    }

    return {
        audio,
        loadEpisode,
        play,
        pause,
        togglePlay,
        seek,
        skipForward,
        skipBack,
        setVolume: setVolumeLevel,
        setPlaybackRate: setPlaybackRateLevel,
        // State mapped from store for convenience
        isPlaying,
        currentTime,
        duration,
        volume,
        playbackRate,
        currentEpisode,
        currentBook
    }
}

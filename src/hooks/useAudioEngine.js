import { useEffect, useRef } from 'react'
import usePlayer from './usePlayer'

export default function useAudioEngine() {
    const audioRef = useRef(null)
    const {
        currentEpisode,
        isPlaying,
        currentTime,
        setCurrentTime,
        setDuration,
        setIsPlaying,
        playNext
    } = usePlayer()

    useEffect(() => {
        if (!audioRef.current) {
            audioRef.current = new Audio()
            
            audioRef.current.addEventListener('timeupdate', () => {
                setCurrentTime(audioRef.current.currentTime)
            })

            audioRef.current.addEventListener('loadedmetadata', () => {
                setDuration(audioRef.current.duration)
            })

            audioRef.current.addEventListener('ended', () => {
                playNext()
            })
        }

        return () => {
            if (audioRef.current) {
                audioRef.current.pause()
                audioRef.current.src = ''
            }
        }
    }, [])

    useEffect(() => {
        if (currentEpisode && audioRef.current) {
            audioRef.current.src = currentEpisode.audio_url
            audioRef.current.load()
            if (isPlaying) {
                audioRef.current.play().catch(console.error)
            }
        }
    }, [currentEpisode])

    useEffect(() => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.play().catch(console.error)
            } else {
                audioRef.current.pause()
            }
        }
    }, [isPlaying])

    const seek = (time) => {
        if (audioRef.current) {
            audioRef.current.currentTime = time
            setCurrentTime(time)
        }
    }

    const changePlaybackRate = (rate) => {
        if (audioRef.current) {
            audioRef.current.playbackRate = rate
        }
    }

    return {
        seek,
        changePlaybackRate,
        audioElement: audioRef.current
    }
}

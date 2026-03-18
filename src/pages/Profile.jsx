import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import useAuthStore from '../store/authStore'
import { getUserDownloads, deleteDownload } from '../lib/downloads'
import { fetchUserListenProgress } from '../lib/listening'
import { getEpisodeArtwork } from '../lib/media'
import { User, Download, Clock, Play, Trash2, LogOut } from 'lucide-react'

export default function Profile() {
    const { user, profile } = useAuth()
    const { actions } = useAuthStore()
    const navigate = useNavigate()
    const [downloads, setDownloads] = useState([])
    const [listeningHistory, setListeningHistory] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchUserData = useCallback(async () => {
        setLoading(true)
        try {
            const downloadsData = await getUserDownloads(user.id)
            setDownloads(downloadsData)

            const historyData = await fetchUserListenProgress(user.id, { limit: 20 })
            setListeningHistory(historyData)
        } finally {
            setLoading(false)
        }
    }, [user])

    useEffect(() => {
        if (user) {
            fetchUserData()
        }
    }, [user, fetchUserData])

    const handleDeleteDownload = async (downloadId) => {
        if (!confirm('Remove this download from your list?')) return
        const result = await deleteDownload(downloadId)
        if (result.success) {
            setDownloads(downloads.filter(d => d.id !== downloadId))
        }
    }

    const handleLogout = async () => {
        if (window.confirm('Are you sure you want to log out?')) {
            await actions.logout()
            window.location.replace('/')
        }
    }

    const formatTime = (seconds) => {
        if (!seconds) return '0:00'
        const mins = Math.floor(seconds / 60)
        const secs = Math.floor(seconds % 60)
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    const formatBytes = (bytes) => {
        if (!bytes) return 'N/A'
        const mb = bytes / (1024 * 1024)
        return `${mb.toFixed(1)} MB`
    }

    const headerColor = useMemo(() => {
        const colors = [
            'rgb(83, 83, 83)', 
            'rgb(60, 42, 85)',
            'rgb(85, 42, 42)',
            'rgb(42, 85, 60)',
            'rgb(42, 60, 85)'
        ]
        return colors[Math.floor(Math.random() * colors.length)]
    }, [])

    return (
        <div className="pb-32 relative min-h-screen">
            {/* Dynamic Background Match */}
            <div 
                className="absolute top-0 left-0 right-0 h-[332px] pointer-events-none z-0"
                style={{
                    background: `linear-gradient(to bottom, ${headerColor} 0%, rgba(18, 18, 18, 1) 100%)`
                }}
            />

            <div className="relative z-10 pt-20 px-4 md:px-8 max-w-7xl mx-auto">
                {/* Header Profile Section */}
                <div className="flex flex-col md:flex-row items-center md:items-end gap-6 pb-6">
                    <div className="w-48 h-48 md:w-56 md:h-56 rounded-full bg-spotify-elevated shadow-2xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                        <User className="w-24 h-24 text-spotify-text/30" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <span className="text-sm font-bold text-white uppercase tracking-wider hidden md:block mb-2">Profile</span>
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-white mb-4 line-clamp-1">
                            {profile?.full_name || user?.email?.split('@')[0] || profile?.phone || 'User'}
                        </h1>
                        <p className="text-spotify-subtext font-medium text-lg mb-6">
                            {profile?.phone || profile?.phone_number || profile?.email}
                        </p>
                    </div>
                </div>

                {/* Actions Row */}
                <div className="flex items-center gap-4 py-8 mb-4 border-b border-white/10">
                    <button 
                        onClick={handleLogout}
                        className="px-6 py-2 rounded-full border border-white/30 text-white font-bold text-sm tracking-wide hover:-translate-y-1 hover:border-white transition-all flex items-center gap-2"
                    >
                        <LogOut size={16} />
                        Log Out
                    </button>
                </div>

                {/* Content Section */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="grid lg:grid-cols-2 gap-12 mt-8">
                        
                        {/* Listening History */}
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                                <Clock className="w-6 h-6 text-spotify-text" /> 
                                Recent Listening
                            </h2>
                            {listeningHistory.length === 0 ? (
                                <p className="text-spotify-subtext">You haven't listened to anything recently.</p>
                            ) : (
                                <div className="space-y-1">
                                    {listeningHistory.map((item, index) => (
                                        <div 
                                            key={item.id} 
                                            className="group flex items-center justify-between p-3 rounded-md hover:bg-white/5 transition-colors cursor-pointer"
                                            onClick={() => navigate(`/book/${item.book.id}/episode/${item.episode.id}`)}
                                        >
                                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                                <div className="w-12 h-12 flex-shrink-0 relative bg-black/50">
                                                    <img
                                                        src={getEpisodeArtwork(item.episode, item.book)}
                                                        alt={item.book.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <Play fill="white" size={20} className="text-white" />
                                                    </div>
                                                </div>
                                                <div className="truncate">
                                                    <h3 className="text-base font-medium text-white group-hover:underline truncate">{item.episode.title}</h3>
                                                    <p className="text-sm text-spotify-subtext truncate group-hover:text-white transition-colors">{item.book.title} • Episode {item.episode.episode_number}</p>
                                                </div>
                                            </div>
                                            <div className="text-sm text-spotify-subtext whitespace-nowrap hidden sm:block">
                                                Left off at {formatTime(item.position_seconds)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* Downloads */}
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                                <Download className="w-6 h-6 text-spotify-text" /> 
                                Your Downloads
                            </h2>
                            {downloads.length === 0 ? (
                                <p className="text-spotify-subtext">You have no downloaded episodes.</p>
                            ) : (
                                <div className="space-y-1">
                                    {downloads.map((download) => (
                                        <div 
                                            key={download.id} 
                                            className="group flex items-center justify-between p-3 rounded-md hover:bg-white/5 transition-colors"
                                        >
                                            <div 
                                                className="flex items-center gap-4 flex-1 min-w-0 cursor-pointer"
                                                onClick={() => navigate(`/book/${download.book.id}/episode/${download.episode.id}`)}
                                            >
                                                <div className="w-12 h-12 flex-shrink-0 relative bg-black/50">
                                                    <img
                                                        src={getEpisodeArtwork(download.episode, download.book)}
                                                        alt={download.book.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <Play fill="white" size={20} className="text-white" />
                                                    </div>
                                                </div>
                                                <div className="truncate">
                                                    <h3 className="text-base font-medium text-white group-hover:underline truncate">{download.episode.title}</h3>
                                                    <p className="text-sm text-spotify-subtext truncate group-hover:text-white transition-colors">{download.book.title} • {formatBytes(download.file_size)}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleDeleteDownload(download.id)
                                                }}
                                                className="p-3 text-spotify-subtext opacity-0 group-hover:opacity-100 hover:text-white hover:scale-110 transition-all rounded-full"
                                                title="Remove download"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                    </div>
                )}
            </div>
        </div>
    )
}

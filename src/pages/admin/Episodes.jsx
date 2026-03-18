import { useEffect, useState, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import Modal from '../../components/ui/Modal'
import { getEpisodeArtwork } from '../../lib/media'
import {
    uploadEpisodeAudio,
    uploadEpisodeThumbnail,
    validateFileSize,
    validateFileType,
    formatFileSize,
} from '../../lib/storage'
import { Plus, ArrowLeft, Music, Lock, Pencil, Upload, Image as ImageIcon } from 'lucide-react'

const createEpisodeForm = (episodeNumber = 1) => ({
    title: '',
    description: '',
    episode_number: episodeNumber,
    duration_seconds: 0,
    is_free: false,
    audio_url: '',
    thumbnail_url: '',
})

function Skel({ className = '' }) {
    return <div className={`animate-pulse rounded-lg bg-white/5 ${className}`} />
}

function fmtDuration(secs) {
    if (!secs) return '—'
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m}:${String(s).padStart(2, '0')}`
}

export default function Episodes() {
    const { id: bookId } = useParams()
    const navigate = useNavigate()
    const [book, setBook] = useState(null)
    const [episodes, setEpisodes] = useState([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingEpisodeId, setEditingEpisodeId] = useState(null)
    const [episodeForm, setEpisodeForm] = useState(createEpisodeForm())
    const [audioFile, setAudioFile] = useState(null)
    const [thumbnailFile, setThumbnailFile] = useState(null)

    const loadBookAndEpisodes = useCallback(async () => {
        try {
            const [bookRes, episodesRes] = await Promise.all([
                supabase.from('books').select('*').eq('id', bookId).single(),
                supabase.from('episodes').select('*').eq('book_id', bookId).order('episode_number')
            ])
            if (bookRes.error) throw bookRes.error
            setBook(bookRes.data)
            setEpisodes(episodesRes.data || [])
        } catch (error) {
            console.error('Failed to load:', error)
        } finally {
            setLoading(false)
        }
    }, [bookId])

    useEffect(() => { if (bookId) loadBookAndEpisodes() }, [bookId, loadBookAndEpisodes])

    const resetEpisodeForm = () => {
        setEditingEpisodeId(null)
        setAudioFile(null)
        setThumbnailFile(null)
        setEpisodeForm(createEpisodeForm((episodes.at(-1)?.episode_number || 0) + 1))
    }

    const openCreateModal = () => {
        resetEpisodeForm()
        setIsModalOpen(true)
    }

    const openEditModal = (episode) => {
        setEditingEpisodeId(episode.id)
        setAudioFile(null)
        setThumbnailFile(null)
        setEpisodeForm({
            title: episode.title || '',
            description: episode.description || '',
            episode_number: episode.episode_number || 1,
            duration_seconds: episode.duration_seconds || 0,
            is_free: !!episode.is_free,
            audio_url: episode.audio_url || '',
            thumbnail_url: episode.thumbnail_url || '',
        })
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setIsModalOpen(false)
        resetEpisodeForm()
    }

    const handleAudioChange = (event) => {
        const file = event.target.files?.[0]
        if (!file) return

        if (!validateFileType(file, ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/mp4', 'audio/x-m4a', 'audio/aac', 'audio/ogg'])) {
            alert('Please select an MP3, WAV, M4A, AAC, or OGG audio file.')
            event.target.value = ''
            return
        }

        if (!validateFileSize(file, 500)) {
            alert(`Audio file must be 500 MB or smaller. Selected file is ${formatFileSize(file.size)}.`)
            event.target.value = ''
            return
        }

        setAudioFile(file)
    }

    const handleThumbnailChange = (event) => {
        const file = event.target.files?.[0]
        if (!file) return

        if (!validateFileType(file, ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'])) {
            alert('Please select a JPG, PNG, or WebP image.')
            event.target.value = ''
            return
        }

        if (!validateFileSize(file, 5)) {
            alert(`Thumbnail image must be 5 MB or smaller. Selected file is ${formatFileSize(file.size)}.`)
            event.target.value = ''
            return
        }

        setThumbnailFile(file)
        setEpisodeForm((current) => ({
            ...current,
            thumbnail_url: URL.createObjectURL(file),
        }))
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        setSaving(true)

        try {
            const payload = {
                ...episodeForm,
                book_id: bookId,
                episode_number: Number(episodeForm.episode_number),
                duration_seconds: Number(episodeForm.duration_seconds) || 0,
            }

            if (audioFile) {
                const uploadedAudio = await uploadEpisodeAudio(audioFile, bookId)
                payload.audio_url = uploadedAudio.url
            }

            if (thumbnailFile) {
                const uploadedThumbnail = await uploadEpisodeThumbnail(thumbnailFile, bookId)
                payload.thumbnail_url = uploadedThumbnail.url
            }

            if (!payload.audio_url) {
                throw new Error('Audio is required. Upload a file or paste a hosted audio URL.')
            }

            if (editingEpisodeId) {
                const { error } = await supabase
                    .from('episodes')
                    .update(payload)
                    .eq('id', editingEpisodeId)

                if (error) throw error
            } else {
                const { error } = await supabase
                    .from('episodes')
                    .insert([payload])

                if (error) throw error
            }

            await loadBookAndEpisodes()
            closeModal()
        } catch (error) {
            console.error('Failed to save episode:', error)
            alert(error.message || 'Failed to save episode')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="p-4 md:p-6 lg:p-8 space-y-5">
            <button
                onClick={() => navigate('/admin/books')}
                className="flex items-center gap-1.5 text-white/40 hover:text-white text-sm transition-colors"
            >
                <ArrowLeft size={16} />
                Back to Books
            </button>

            {book && (
                <>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-4">
                            {book.cover_url && (
                                <img src={book.cover_url} alt={book.title} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                            )}
                            <div>
                                <h1 className="text-xl md:text-2xl font-bold text-white">{book.title}</h1>
                                <p className="text-white/40 text-sm">{episodes.length} episodes</p>
                            </div>
                        </div>
                        <button
                            onClick={openCreateModal}
                            className="flex items-center gap-2 bg-[#1DB954] hover:bg-[#1ed760] text-black px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors flex-shrink-0"
                        >
                            <Plus size={16} />
                            <span className="hidden sm:inline">Add Episode</span>
                        </button>
                    </div>

                    {loading ? (
                        <div className="space-y-2">{Array(5).fill(0).map((_, i) => <Skel key={i} className="h-14" />)}</div>
                    ) : episodes.length === 0 ? (
                        <div className="text-center py-16">
                            <Music className="w-12 h-12 mx-auto mb-3 text-white/10" />
                            <p className="text-white/30 text-sm">No episodes yet</p>
                        </div>
                    ) : (
                        <>
                            {/* Desktop table */}
                            <div className="hidden md:block bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-white/[0.06]">
                                            <th className="text-left px-5 py-3.5 text-white/40 text-xs font-semibold uppercase tracking-wider w-12">#</th>
                                            <th className="text-left px-5 py-3.5 text-white/40 text-xs font-semibold uppercase tracking-wider">Title</th>
                                            <th className="text-left px-5 py-3.5 text-white/40 text-xs font-semibold uppercase tracking-wider">Duration</th>
                                            <th className="text-left px-5 py-3.5 text-white/40 text-xs font-semibold uppercase tracking-wider">Access</th>
                                            <th className="text-right px-5 py-3.5 text-white/40 text-xs font-semibold uppercase tracking-wider">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/[0.04]">
                                        {episodes.map(ep => (
                                            <tr key={ep.id} className="hover:bg-white/[0.03] transition-colors">
                                                <td className="px-5 py-3.5 text-white/40 text-sm font-mono">{ep.episode_number}</td>
                                                <td className="px-5 py-3.5">
                                                    <div className="flex items-center gap-3">
                                                        <img
                                                            src={getEpisodeArtwork(ep, book)}
                                                            alt={ep.title}
                                                            className="w-12 h-12 rounded-lg object-cover flex-shrink-0 border border-white/10"
                                                        />
                                                        <div className="min-w-0">
                                                            <p className="text-white text-sm">{ep.title}</p>
                                                            {ep.description && <p className="text-white/30 text-xs truncate max-w-xs">{ep.description}</p>}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3.5 text-white/50 text-sm">{fmtDuration(ep.duration_seconds)}</td>
                                                <td className="px-5 py-3.5">
                                                    {ep.is_free ? (
                                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1DB954]/15 text-[#1DB954] font-medium">Free</span>
                                                    ) : (
                                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-400 font-medium">Premium</span>
                                                    )}
                                                </td>
                                                <td className="px-5 py-3.5 text-right">
                                                    <button
                                                        onClick={() => openEditModal(ep)}
                                                        className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-white/70 hover:bg-white/5 hover:text-white transition-colors"
                                                    >
                                                        <Pencil size={14} />
                                                        Edit
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile list */}
                            <div className="md:hidden space-y-2">
                                {episodes.map(ep => (
                                    <button
                                        key={ep.id}
                                        onClick={() => openEditModal(ep)}
                                        className="w-full flex items-center gap-3 bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-left"
                                    >
                                        <img
                                            src={getEpisodeArtwork(ep, book)}
                                            alt={ep.title}
                                            className="w-12 h-12 rounded-lg object-cover flex-shrink-0 border border-white/10"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 text-white/40 text-xs mb-1">
                                                <span className="font-mono">#{ep.episode_number}</span>
                                                <span>•</span>
                                                <span>{fmtDuration(ep.duration_seconds)}</span>
                                            </div>
                                            <p className="text-white text-sm truncate">{ep.title}</p>
                                        </div>
                                        {!ep.is_free && <Lock size={12} className="text-yellow-400 flex-shrink-0" />}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </>
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={editingEpisodeId ? 'Edit Episode' : 'Add Episode'}
                panelClassName="max-w-3xl"
                bodyClassName="max-h-[82vh] overflow-y-auto p-4 sm:p-6"
            >
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-white/70 mb-2">Episode Title</label>
                        <input
                            type="text"
                            value={episodeForm.title}
                            onChange={(event) => setEpisodeForm((current) => ({ ...current, title: event.target.value }))}
                            className="w-full bg-[#101010] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#1DB954]"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-white/70 mb-2">Description</label>
                        <textarea
                            value={episodeForm.description}
                            onChange={(event) => setEpisodeForm((current) => ({ ...current, description: event.target.value }))}
                            className="w-full bg-[#101010] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#1DB954] h-24"
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label className="block text-white/70 mb-2">Episode Number</label>
                            <input
                                type="number"
                                min="1"
                                value={episodeForm.episode_number}
                                onChange={(event) => setEpisodeForm((current) => ({ ...current, episode_number: event.target.value }))}
                                className="w-full bg-[#101010] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#1DB954]"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-white/70 mb-2">Duration (seconds)</label>
                            <input
                                type="number"
                                min="0"
                                value={episodeForm.duration_seconds}
                                onChange={(event) => setEpisodeForm((current) => ({ ...current, duration_seconds: event.target.value }))}
                                className="w-full bg-[#101010] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#1DB954]"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                        <div className="space-y-3 rounded-xl border border-white/10 bg-white/[0.02] p-4">
                            <div>
                                <p className="text-sm font-semibold text-white">Episode Thumbnail</p>
                                <p className="mt-1 text-xs text-white/45">Upload cover art or paste a direct image URL.</p>
                            </div>

                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                                <div className="h-24 w-24 rounded-lg overflow-hidden border border-white/10 bg-[#101010] flex items-center justify-center flex-shrink-0">
                                    {getEpisodeArtwork(episodeForm, book) ? (
                                        <img
                                            src={getEpisodeArtwork(episodeForm, book)}
                                            alt="Episode thumbnail preview"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <ImageIcon className="w-6 h-6 text-white/30" />
                                    )}
                                </div>

                                <div className="flex-1 space-y-3 min-w-0">
                                    <label className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-center font-medium text-black transition hover:bg-white/90 sm:w-auto sm:justify-start cursor-pointer">
                                        <Upload className="w-4 h-4" />
                                        Upload episode thumbnail
                                        <input
                                            type="file"
                                            accept="image/png,image/jpeg,image/webp"
                                            className="hidden"
                                            onChange={handleThumbnailChange}
                                        />
                                    </label>

                                    {thumbnailFile && (
                                        <p className="text-sm text-white/60 break-all">
                                            Selected: {thumbnailFile.name} ({formatFileSize(thumbnailFile.size)})
                                        </p>
                                    )}

                                    <input
                                        type="url"
                                        value={thumbnailFile ? '' : episodeForm.thumbnail_url}
                                        onChange={(event) => {
                                            setThumbnailFile(null)
                                            setEpisodeForm((current) => ({ ...current, thumbnail_url: event.target.value }))
                                        }}
                                        placeholder="Or paste an image URL"
                                        className="w-full bg-[#101010] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#1DB954]"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3 rounded-xl border border-white/10 bg-white/[0.02] p-4">
                            <div>
                                <p className="text-sm font-semibold text-white">Episode Audio</p>
                                <p className="mt-1 text-xs text-white/45">Upload an audio file or paste a hosted audio link.</p>
                            </div>

                            <label className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-center font-medium text-black transition hover:bg-white/90 sm:w-auto sm:justify-start cursor-pointer">
                                <Upload className="w-4 h-4" />
                                Upload episode audio
                                <input
                                    type="file"
                                    accept="audio/*"
                                    className="hidden"
                                    onChange={handleAudioChange}
                                />
                            </label>

                            {audioFile && (
                                <p className="text-sm text-white/60 break-all">
                                    Selected: {audioFile.name} ({formatFileSize(audioFile.size)})
                                </p>
                            )}

                            <input
                                type="url"
                                value={audioFile ? '' : episodeForm.audio_url}
                                onChange={(event) => {
                                    setAudioFile(null)
                                    setEpisodeForm((current) => ({ ...current, audio_url: event.target.value }))
                                }}
                                placeholder="Or paste a hosted audio URL"
                                className="w-full bg-[#101010] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#1DB954]"
                            />
                        </div>
                    </div>

                    <label className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4 text-white">
                        <input
                            type="checkbox"
                            checked={episodeForm.is_free}
                            onChange={(event) => setEpisodeForm((current) => ({ ...current, is_free: event.target.checked }))}
                            className="mt-0.5 h-5 w-5 flex-shrink-0"
                        />
                        <span>
                            <span className="block font-medium">Make this episode free to play</span>
                            <span className="mt-1 block text-sm text-white/45">Free episodes can be previewed without unlocking the full book.</span>
                        </span>
                    </label>

                    <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:justify-end">
                        <button
                            type="button"
                            onClick={closeModal}
                            className="w-full rounded-lg border border-white/10 px-4 py-2.5 text-white/70 transition-colors hover:bg-white/5 hover:text-white sm:w-auto"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full rounded-lg bg-[#1DB954] px-5 py-2.5 font-semibold text-black transition-colors hover:bg-[#1ed760] disabled:opacity-60 sm:w-auto"
                        >
                            {saving ? 'Saving...' : editingEpisodeId ? 'Update Episode' : 'Create Episode'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}

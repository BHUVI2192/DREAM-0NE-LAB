import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { uploadBookCover, validateFileSize, validateFileType, formatFileSize } from '../../lib/storage'
import { Save, ArrowLeft, Upload, Image as ImageIcon, ListMusic, CheckCircle2 } from 'lucide-react'

export default function BookForm() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [searchParams, setSearchParams] = useSearchParams()
    const [loading, setLoading] = useState(false)
    const [episodesLoading, setEpisodesLoading] = useState(false)
    const [bookId, setBookId] = useState(id && id !== 'new' ? id : null)
    const [episodes, setEpisodes] = useState([])
    const [coverFile, setCoverFile] = useState(null)
    const [currentStep, setCurrentStep] = useState(searchParams.get('step') === 'episodes' ? 2 : 1)
    const [formData, setFormData] = useState({
        title: '',
        author: '',
        description: '',
        blurb: '',
        genre: '',
        language: 'English',
        cover_url: '',
        is_published: false,
        is_premium: false,
        price: 49
    })

    const loadBook = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('books')
                .select('*')
                .eq('id', id)
                .single()

            if (error) throw error
            setFormData((current) => ({
                ...current,
                ...data,
                title: data.title || '',
                author: data.author || '',
                description: data.description || '',
                blurb: data.blurb || '',
                genre: data.genre || '',
                language: data.language || 'English',
                cover_url: data.cover_url || '',
                is_published: !!data.is_published,
                is_premium: !!data.is_premium,
                price: data.price ?? 49
            }))
            setBookId(data.id)
        } catch (error) {
            console.error('Failed to load book:', error)
        }
    }, [id])

    useEffect(() => {
        if (id && id !== 'new') {
            loadBook()
        }
    }, [id, loadBook])

    useEffect(() => {
        setCurrentStep(searchParams.get('step') === 'episodes' ? 2 : 1)
    }, [searchParams])

    useEffect(() => {
        if (currentStep === 2 && bookId) {
            loadEpisodes(bookId)
        }
    }, [currentStep, bookId])

    const loadEpisodes = async (currentBookId) => {
        setEpisodesLoading(true)
        try {
            const { data, error } = await supabase
                .from('episodes')
                .select('*')
                .eq('book_id', currentBookId)
                .order('episode_number', { ascending: true })

            if (error) throw error
            setEpisodes(data || [])
        } catch (error) {
            console.error('Failed to load episodes:', error)
        } finally {
            setEpisodesLoading(false)
        }
    }

    const goToStep = (step) => {
        const next = new URLSearchParams(searchParams)
        if (step === 2) {
            next.set('step', 'episodes')
        } else {
            next.delete('step')
        }
        setSearchParams(next, { replace: true })
    }

    const handleCoverChange = (event) => {
        const file = event.target.files?.[0]
        if (!file) return

        if (!validateFileType(file, ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'])) {
            alert('Please select a JPG, PNG, or WebP image.')
            event.target.value = ''
            return
        }

        if (!validateFileSize(file, 5)) {
            alert(`Cover image must be 5 MB or smaller. Selected file is ${formatFileSize(file.size)}.`)
            event.target.value = ''
            return
        }

        setCoverFile(file)
        setFormData((current) => ({
            ...current,
            cover_url: URL.createObjectURL(file)
        }))
    }

    const handleSubmit = async (e, continueToEpisodes = false) => {
        e.preventDefault()
        setLoading(true)

        try {
            const payload = {
                ...formData,
                price: Number.isFinite(Number(formData.price)) ? Number(formData.price) : 49
            }

            if (coverFile) {
                const uploadedCover = await uploadBookCover(coverFile)
                payload.cover_url = uploadedCover.url
            }

            let resolvedBookId = bookId

            if (id && id !== 'new') {
                const { error } = await supabase
                    .from('books')
                    .update(payload)
                    .eq('id', id)
                if (error) throw error
            } else {
                const { data, error } = await supabase
                    .from('books')
                    .insert([payload])
                    .select('id')
                    .single()
                if (error) throw error
                resolvedBookId = data.id
            }

            if (resolvedBookId) {
                setBookId(resolvedBookId)
            }

            if (continueToEpisodes && resolvedBookId) {
                navigate(`/admin/books/${resolvedBookId}/edit?step=episodes`)
                return
            }

            if (!id || id === 'new') {
                navigate(`/admin/books/${resolvedBookId}/edit`)
                return
            }

            alert('Book details saved successfully.')
        } catch (error) {
            console.error('Failed to save book:', error)
            alert('Failed to save book')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="p-4 md:p-6 lg:p-8 max-w-5xl space-y-6">
            <button
                onClick={() => navigate('/admin/books')}
                className="flex items-center gap-2 text-white/50 hover:text-white transition"
            >
                <ArrowLeft className="w-5 h-5" />
                Back to Books
            </button>

            <div className="space-y-4">
                <h1 className="text-3xl font-bold text-white tracking-tight">
                    {id && id !== 'new' ? 'Edit Book' : 'Create New Book'}
                </h1>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                        type="button"
                        onClick={() => goToStep(1)}
                        className={`rounded-2xl border p-4 text-left transition-all ${
                            currentStep === 1
                                ? 'border-[#1DB954]/60 bg-[#1DB954]/10'
                                : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.04]'
                        }`}
                    >
                        <p className="text-xs uppercase tracking-widest text-white/40">Phase 1</p>
                        <p className="text-white font-semibold mt-1">Book Details + Thumbnail</p>
                        <p className="text-white/50 text-sm mt-1">Title, metadata, pricing, and cover upload.</p>
                    </button>

                    <button
                        type="button"
                        onClick={() => bookId && goToStep(2)}
                        disabled={!bookId}
                        className={`rounded-2xl border p-4 text-left transition-all ${
                            currentStep === 2
                                ? 'border-[#1DB954]/60 bg-[#1DB954]/10'
                                : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.04]'
                        } ${!bookId ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <p className="text-xs uppercase tracking-widest text-white/40">Phase 2</p>
                        <p className="text-white font-semibold mt-1">Episode Data Entry</p>
                        <p className="text-white/50 text-sm mt-1">Add episode titles, audio, and thumbnails.</p>
                    </button>
                </div>
            </div>

            {currentStep === 1 && (
            <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6 rounded-2xl border border-white/10 bg-white/[0.02] p-5 md:p-6">
                <div>
                    <label className="block text-white/70 mb-2">Title *</label>
                    <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full bg-[#101010] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#1DB954]"
                        required
                    />
                </div>

                <div>
                    <label className="block text-white/70 mb-2">Author *</label>
                    <input
                        type="text"
                        value={formData.author}
                        onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                        className="w-full bg-[#101010] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#1DB954]"
                        required
                    />
                </div>

                <div>
                    <label className="block text-white/70 mb-2">Blurb (Short description) *</label>
                    <textarea
                        value={formData.blurb}
                        onChange={(e) => setFormData({ ...formData, blurb: e.target.value })}
                        className="w-full bg-[#101010] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#1DB954] h-24"
                        required
                    />
                </div>

                <div>
                    <label className="block text-white/70 mb-2">Full Description</label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full bg-[#101010] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#1DB954] h-32"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-white/70 mb-2">Genre *</label>
                        <input
                            type="text"
                            value={formData.genre}
                            onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                            className="w-full bg-[#101010] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#1DB954]"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-white/70 mb-2">Language</label>
                        <select
                            value={formData.language}
                            onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                            className="w-full bg-[#101010] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#1DB954]"
                        >
                            <option value="English">English</option>
                            <option value="Hindi">Hindi</option>
                            <option value="Kannada">Kannada</option>
                            <option value="Tamil">Tamil</option>
                            <option value="Telugu">Telugu</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-white/70 mb-2">Cover Image</label>
                    <div className="space-y-4 rounded-xl border border-white/10 bg-[#0f0f0f] p-4">
                        <div className="flex flex-col gap-4 md:flex-row md:items-start">
                            <div className="w-32 aspect-[3/4] overflow-hidden rounded-lg border border-white/10 bg-[#101010] flex items-center justify-center flex-shrink-0">
                                {formData.cover_url ? (
                                    <img
                                        src={formData.cover_url}
                                        alt="Book cover preview"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <ImageIcon className="w-8 h-8 text-text-muted" />
                                )}
                            </div>

                            <div className="flex-1 space-y-3">
                                <label className="inline-flex items-center gap-2 bg-white text-black px-4 py-2.5 rounded-lg font-medium cursor-pointer hover:bg-white/90 transition">
                                    <Upload className="w-4 h-4" />
                                    Upload cover from admin
                                    <input
                                        type="file"
                                        accept="image/png,image/jpeg,image/webp"
                                        className="hidden"
                                        onChange={handleCoverChange}
                                    />
                                </label>

                                {coverFile && (
                                    <p className="text-sm text-white/60">
                                        Selected: {coverFile.name} ({formatFileSize(coverFile.size)})
                                    </p>
                                )}

                                <div>
                                    <label className="block text-white/60 mb-2 text-sm">Or paste an existing cover URL</label>
                                    <input
                                        type="url"
                                        value={coverFile ? '' : formData.cover_url}
                                        onChange={(e) => {
                                            setCoverFile(null)
                                            setFormData({ ...formData, cover_url: e.target.value })
                                        }}
                                        placeholder="https://..."
                                        className="w-full bg-[#101010] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#1DB954]"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="is_published"
                            checked={formData.is_published}
                            onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                            className="w-5 h-5"
                        />
                        <label htmlFor="is_published" className="text-white">Publish this book (make it visible to users)</label>
                    </div>

                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="is_premium"
                            checked={formData.is_premium}
                            onChange={(e) => setFormData({ ...formData, is_premium: e.target.checked })}
                            className="w-5 h-5"
                        />
                        <label htmlFor="is_premium" className="text-white">Special Series (requires individual purchase, not included in subscription)</label>
                    </div>
                </div>

                {formData.is_premium && (
                    <div>
                        <label className="block text-white/70 mb-2">Price (₹)</label>
                        <input
                            type="number"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
                            className="w-full bg-[#101010] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#1DB954]"
                        />
                    </div>
                )}

                <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 bg-[#1DB954] text-black px-5 py-3 rounded-xl font-semibold hover:bg-[#1ed760] disabled:opacity-60 transition"
                    >
                        <Save className="w-5 h-5" />
                        {loading ? 'Saving...' : 'Save Book Details'}
                    </button>

                    <button
                        type="button"
                        onClick={(e) => handleSubmit(e, true)}
                        disabled={loading}
                        className="flex items-center gap-2 border border-white/15 text-white px-5 py-3 rounded-xl font-semibold hover:bg-white/5 disabled:opacity-60 transition"
                    >
                        <CheckCircle2 className="w-5 h-5" />
                        Save and Continue to Episodes
                    </button>
                </div>
            </form>
            )}

            {currentStep === 2 && (
                <div className="space-y-5 rounded-2xl border border-white/10 bg-white/[0.02] p-5 md:p-6">
                    {!bookId ? (
                        <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-yellow-300 text-sm">
                            Save Phase 1 first to create the book, then continue with episode data entry.
                        </div>
                    ) : (
                        <>
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                    <p className="text-xs uppercase tracking-widest text-white/40">Phase 2</p>
                                    <h2 className="text-xl font-semibold text-white mt-1">Episode Data Entry</h2>
                                    <p className="text-white/50 text-sm mt-1">Upload episode audio and thumbnails, set access, and arrange the sequence.</p>
                                </div>
                                <button
                                    onClick={() => navigate(`/admin/books/${bookId}/episodes`)}
                                    className="inline-flex items-center gap-2 bg-[#1DB954] hover:bg-[#1ed760] text-black px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors"
                                >
                                    <ListMusic className="w-4 h-4" />
                                    Manage Episodes
                                </button>
                            </div>

                            {episodesLoading ? (
                                <p className="text-white/50 text-sm">Loading episodes...</p>
                            ) : episodes.length === 0 ? (
                                <div className="rounded-xl border border-dashed border-white/20 p-8 text-center">
                                    <p className="text-white/60">No episodes added yet.</p>
                                    <p className="text-white/40 text-sm mt-1">Use Manage Episodes to add your first episode audio and thumbnail.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {episodes.map((ep) => (
                                        <div key={ep.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#0f0f0f] p-3">
                                            <div className="w-12 h-12 rounded-md overflow-hidden border border-white/10 bg-[#101010] flex items-center justify-center flex-shrink-0">
                                                {ep.thumbnail_url || formData.cover_url ? (
                                                    <img src={ep.thumbnail_url || formData.cover_url} alt={ep.title} className="w-full h-full object-cover" />
                                                ) : (
                                                    <ImageIcon className="w-4 h-4 text-white/30" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-white text-sm truncate">#{ep.episode_number} {ep.title}</p>
                                                <p className="text-white/45 text-xs">{ep.is_free ? 'Free' : 'Premium'}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="pt-2">
                                <button
                                    onClick={() => navigate('/admin/books')}
                                    className="text-sm text-white/60 hover:text-white transition-colors"
                                >
                                    Done for now, go back to books
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    )
}

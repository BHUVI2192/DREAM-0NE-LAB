import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { Plus, ArrowLeft, Music } from 'lucide-react'

export default function Episodes() {
    const { bookId } = useParams()
    const navigate = useNavigate()
    const [book, setBook] = useState(null)
    const [episodes, setEpisodes] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (bookId) {
            loadBookAndEpisodes()
        }
    }, [bookId])

    const loadBookAndEpisodes = async () => {
        try {
            const [bookRes, episodesRes] = await Promise.all([
                supabase.from('books').select('*').eq('id', bookId).single(),
                supabase.from('episodes').select('*').eq('book_id', bookId).order('episode_number')
            ])

            if (bookRes.error) throw bookRes.error
            if (episodesRes.error) throw episodesRes.error

            setBook(bookRes.data)
            setEpisodes(episodesRes.data || [])
        } catch (error) {
            console.error('Failed to load:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="p-8">
            <button
                onClick={() => navigate('/admin/books')}
                className="flex items-center gap-2 text-text-muted hover:text-white mb-6 transition"
            >
                <ArrowLeft className="w-5 h-5" />
                Back to Books
            </button>

            {book && (
                <>
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="font-display text-3xl font-bold text-white mb-2">{book.title}</h1>
                            <p className="text-text-muted">Manage episodes for this book</p>
                        </div>
                        <button className="flex items-center gap-2 bg-accent text-white px-6 py-3 rounded-xl font-semibold hover:bg-accent/90 transition">
                            <Plus className="w-5 h-5" />
                            Add Episode
                        </button>
                    </div>

                    {loading ? (
                        <div className="text-center text-text-muted py-12">Loading...</div>
                    ) : episodes.length === 0 ? (
                        <div className="text-center text-text-muted py-12">
                            <Music className="w-16 h-16 mx-auto mb-4 opacity-30" />
                            <p>No episodes yet. Create your first one!</p>
                        </div>
                    ) : (
                        <div className="bg-bg-elevated border border-border-subtle rounded-xl overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-bg-secondary">
                                    <tr>
                                        <th className="text-left px-6 py-4 text-text-muted font-semibold">#</th>
                                        <th className="text-left px-6 py-4 text-text-muted font-semibold">Title</th>
                                        <th className="text-left px-6 py-4 text-text-muted font-semibold">Duration</th>
                                        <th className="text-left px-6 py-4 text-text-muted font-semibold">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {episodes.map((episode) => (
                                        <tr key={episode.id} className="border-t border-border-subtle hover:bg-bg-secondary/50">
                                            <td className="px-6 py-4 text-white font-bold">{episode.episode_number}</td>
                                            <td className="px-6 py-4 text-white">{episode.title}</td>
                                            <td className="px-6 py-4 text-text-muted">{episode.duration || 'N/A'}</td>
                                            <td className="px-6 py-4">
                                                <span className="text-xs px-3 py-1 rounded-full bg-green-500/20 text-green-400">
                                                    Published
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

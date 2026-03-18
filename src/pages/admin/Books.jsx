import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { Plus, BookOpen, ArrowUpRight, Search } from 'lucide-react'

function Skel({ className = '' }) {
    return <div className={`animate-pulse rounded-xl bg-white/5 ${className}`} />
}

export default function Books() {
    const navigate = useNavigate()
    const [books, setBooks] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')

    useEffect(() => { loadBooks() }, [])

    const loadBooks = async () => {
        try {
            const { data, error } = await supabase
                .from('books')
                .select('*')
                .order('created_at', { ascending: false })
            if (error) throw error
            setBooks(data || [])
        } catch (error) {
            console.error('Failed to load books:', error)
        } finally {
            setLoading(false)
        }
    }

    const filtered = books.filter(b =>
        b.title?.toLowerCase().includes(search.toLowerCase()) ||
        b.author?.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="p-4 md:p-6 lg:p-8 space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-white">Books</h1>
                    <p className="text-white/40 text-sm mt-0.5">{books.length} titles in library</p>
                </div>
                <button
                    onClick={() => navigate('/admin/books/new')}
                    className="flex items-center gap-2 bg-[#1DB954] hover:bg-[#1ed760] text-black px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors flex-shrink-0"
                >
                    <Plus size={16} />
                    <span className="hidden sm:inline">Add Book</span>
                </button>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search by title or author…"
                    className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-white/20 placeholder-white/30 transition-colors"
                />
            </div>

            {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                    {Array(10).fill(0).map((_, i) => <Skel key={i} className="aspect-[3/4]" />)}
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-20">
                    <BookOpen className="w-12 h-12 mx-auto mb-3 text-white/10" />
                    <p className="text-white/30 text-sm">No books found</p>
                    <button
                        onClick={() => navigate('/admin/books/new')}
                        className="mt-4 text-[#1DB954] text-sm hover:underline"
                    >
                        Add your first book →
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                    {filtered.map(book => (
                        <div
                            key={book.id}
                            onClick={() => navigate(`/admin/books/${book.id}/edit`)}
                            className="group bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden hover:border-white/10 hover:bg-white/[0.05] transition-all cursor-pointer relative"
                        >
                            {/* Cover */}
                            <div className="relative aspect-[3/4] overflow-hidden">
                                <img
                                    src={book.cover_url || '/placeholder.jpg'}
                                    alt={book.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                                    <button
                                        onClick={e => { e.stopPropagation(); navigate(`/admin/books/${book.id}/episodes`) }}
                                        className="text-xs bg-white/10 hover:bg-white/20 text-white px-2 py-1 rounded-lg backdrop-blur-sm transition-colors"
                                    >
                                        Episodes
                                    </button>
                                </div>
                                <ArrowUpRight size={14} className="absolute top-2.5 right-2.5 text-white/0 group-hover:text-white/70 transition-colors" />
                                {/* Badges */}
                                <div className="absolute top-2 left-2 flex flex-col gap-1">
                                    {book.is_premium && (
                                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-yellow-500/80 text-black font-bold uppercase tracking-wide backdrop-blur-sm">
                                            Premium
                                        </span>
                                    )}
                                    {!book.is_published && (
                                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/20 text-white/80 font-semibold backdrop-blur-sm">
                                            Draft
                                        </span>
                                    )}
                                </div>
                            </div>
                            {/* Meta */}
                            <div className="p-3">
                                <p className="text-white text-xs font-semibold truncate leading-tight">{book.title}</p>
                                <p className="text-white/40 text-xs truncate mt-0.5">{book.author}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

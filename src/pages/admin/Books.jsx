import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { Plus, BookOpen } from 'lucide-react'

export default function Books() {
    const navigate = useNavigate()
    const [books, setBooks] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadBooks()
    }, [])

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

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <h1 className="font-display text-3xl font-bold text-white">Books</h1>
                <button
                    onClick={() => navigate('/admin/books/new')}
                    className="flex items-center gap-2 bg-accent text-white px-6 py-3 rounded-xl font-semibold hover:bg-accent/90 transition"
                >
                    <Plus className="w-5 h-5" />
                    Add New Book
                </button>
            </div>

            {loading ? (
                <div className="text-center text-text-muted py-12">Loading...</div>
            ) : books.length === 0 ? (
                <div className="text-center text-text-muted py-12">
                    <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p>No books yet. Create your first one!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {books.map((book) => (
                        <div
                            key={book.id}
                            onClick={() => navigate(`/admin/books/${book.id}`)}
                            className="bg-bg-elevated border border-border-subtle rounded-xl overflow-hidden hover:border-accent/50 transition cursor-pointer"
                        >
                            <img
                                src={book.cover_url || 'https://via.placeholder.com/300x400'}
                                alt={book.title}
                                className="w-full h-48 object-cover"
                            />
                            <div className="p-4">
                                <h3 className="font-bold text-white mb-1">{book.title}</h3>
                                <p className="text-text-muted text-sm">{book.author}</p>
                                <div className="mt-2 flex items-center gap-2">
                                    <span className={`text-xs px-2 py-1 rounded ${book.is_special ? 'bg-yellow-500/20 text-yellow-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                        {book.is_special ? 'Special' : 'Standard'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { BookOpen } from 'lucide-react'

export default function Home() {
    const [books, setBooks] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchBooks()
    }, [])

    const fetchBooks = async () => {
        try {
            const { data, error } = await supabase
                .from('books')
                .select('*')
                .eq('is_published', true)
                .order('created_at', { ascending: false })
                .limit(10)

            if (error) throw error
            setBooks(data || [])
        } catch (err) {
            console.error('Error fetching books:', err)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="text-center py-20">
                <div className="text-accent text-xl">Loading...</div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-4xl font-bold text-white mb-2">Welcome to Dream One Lab</h1>
                <p className="text-text-secondary">Discover amazing audio stories</p>
            </div>

            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
                {books.map((book) => (
                    <Link
                        key={book.id}
                        to={`/book/${book.id}`}
                        className="bg-bg-elevated rounded-2xl overflow-hidden border border-border-subtle hover:border-accent transition-all group"
                    >
                        <div className="aspect-square bg-bg-secondary flex items-center justify-center">
                            <BookOpen className="w-16 h-16 text-accent" />
                        </div>
                        <div className="p-4">
                            <h3 className="font-bold text-white group-hover:text-accent transition-colors">
                                {book.title}
                            </h3>
                            <p className="text-sm text-text-secondary mt-1">{book.author}</p>
                        </div>
                    </Link
>
                ))}
            </div>

            {books.length === 0 && (
                <div className="text-center py-20">
                    <p className="text-text-secondary">No books available yet</p>
                </div>
            )}
        </div>
    )
}

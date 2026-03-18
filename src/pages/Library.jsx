import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { fetchSuccessfulPurchases } from '../lib/purchases'
import { fetchActiveSubscription, isMissingSubscriptionsTableError } from '../lib/subscriptions'
import { BookOpen } from 'lucide-react'
import useAuth from '../hooks/useAuth'

export default function Library() {
    const { user } = useAuth()
    const [books, setBooks] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchLibrary = useCallback(async () => {
        try {
            if (!user) {
                setBooks([])
                return
            }

            const [{ data: allBooks, error: booksError }, { data: purchases }] = await Promise.all([
                supabase
                    .from('books')
                    .select('*')
                    .eq('is_published', true)
                    .order('created_at', { ascending: false }),
                fetchSuccessfulPurchases({
                    select: 'book_id',
                    filters: [{ column: 'user_id', value: user.id }],
                })
            ])

            if (booksError) throw booksError

            let hasSubscription = false
            const subResponse = await fetchActiveSubscription(user.id)

            if (!subResponse.error) {
                hasSubscription = !!subResponse.data
            } else if (!isMissingSubscriptionsTableError(subResponse.error)) {
                console.error('Error fetching active subscription:', subResponse.error)
            }

            const purchasedIds = new Set((purchases || []).map((row) => row.book_id).filter(Boolean))

            const accessibleBooks = (allBooks || []).filter((book) => {
                if (purchasedIds.has(book.id)) return true
                if (hasSubscription && !book.is_premium) return true
                return false
            })

            setBooks(accessibleBooks)
        } catch (err) {
            console.error('Error fetching library:', err)
            setBooks([])
        } finally {
            setLoading(false)
        }
    }, [user])

    useEffect(() => {
        fetchLibrary()
    }, [fetchLibrary])

    if (loading) {
        return (
            <div className="text-center py-20">
                <div className="text-accent text-xl">Loading...</div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <h1 className="text-4xl font-bold text-white">My Library</h1>

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
                            {book.genre && (
                                <span className="inline-block mt-2 px-3 py-1 bg-accent/20 text-accent text-xs rounded-full">
                                    {book.genre}
                                </span>
                            )}
                        </div>
                    </Link>
                ))}
            </div>

            {books.length === 0 && (
                <div className="text-center py-20">
                    <p className="text-text-secondary">Your library is empty. Start exploring!</p>
                    <Link to="/home" className="inline-block mt-4 text-accent hover:underline">
                        Browse Books
                    </Link>
                </div>
            )}
        </div>
    )
}

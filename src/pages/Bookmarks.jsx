import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Bookmark } from 'lucide-react'
import useAuth from '../hooks/useAuth'
import { getUserBookmarks } from '../lib/bookmarks'
import SpotifyBookCard from '../components/ui/SpotifyBookCard'

export default function Bookmarks() {
    const { user } = useAuth()
    const [books, setBooks] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchBookmarks = useCallback(async () => {
        try {
            if (!user) {
                setBooks([])
                return
            }
            const data = await getUserBookmarks(user.id)
            setBooks(data)
        } catch (err) {
            console.error('Error fetching bookmarks:', err)
            setBooks([])
        } finally {
            setLoading(false)
        }
    }, [user])

    useEffect(() => {
        fetchBookmarks()
    }, [fetchBookmarks])

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto"></div>
            </div>
        )
    }

    return (
        <div className="px-4 md:px-6 pt-20 md:pt-24 space-y-8 pb-32">
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tighter">Your Bookmarks</h1>

            {books.length === 0 ? (
                <div className="text-center py-20 space-y-4">
                    <Bookmark className="w-16 h-16 text-spotify-subtext opacity-50 mx-auto" strokeWidth={1} />
                    <h3 className="text-2xl font-bold text-white">No bookmarks yet</h3>
                    <p className="text-spotify-subtext max-w-sm mx-auto">
                        Keep track of the books and series you want to listen to by bookmarking them.
                    </p>
                    <Link 
                        to="/home" 
                        className="inline-block mt-4 px-8 py-3 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform"
                    >
                        Browse Books
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {books.map((book) => (
                        <SpotifyBookCard key={book.id} book={book} showPlayButton={true} />
                    ))}
                </div>
            )}
        </div>
    )
}

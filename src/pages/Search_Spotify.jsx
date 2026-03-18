import { useState, useEffect, useMemo } from 'react'
import { Search as SearchIcon } from 'lucide-react'
import { supabase } from '../lib/supabase'
import SpotifyBookCard from '../components/ui/SpotifyBookCard'
import Skeleton from '../components/ui/Skeleton'

export default function Search() {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState([])
    const [allBooks, setAllBooks] = useState([])
    const [loading, setLoading] = useState(true)

    // Load initial data (for "Browse All" or fast client-side searching)
    useEffect(() => {
        const fetchAllBooks = async () => {
            setLoading(true)
            try {
                const { data } = await supabase
                    .from('books')
                    .select('*')
                    .order('created_at', { ascending: false })
                
                setAllBooks(data || [])
                setResults(data || [])
            } catch (error) {
                console.error('Error fetching search data:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchAllBooks()
    }, [])

    // Client-side search for speed and simplicity
    useEffect(() => {
        if (!query.trim()) {
            setResults(allBooks)
            return
        }

        const lowerQuery = query.toLowerCase()
        const filtered = allBooks.filter(book => 
            book.title?.toLowerCase().includes(lowerQuery) ||
            book.author?.toLowerCase().includes(lowerQuery) ||
            book.genre?.toLowerCase().includes(lowerQuery) ||
            book.tags?.some(t => t.toLowerCase().includes(lowerQuery))
        )
        setResults(filtered)
    }, [query, allBooks])

    const headerColor = useMemo(() => {
        const colors = [
            'rgb(30, 50, 100)',
            'rgb(140, 20, 20)',
            'rgb(75, 0, 130)',
            'rgb(0, 80, 40)',
            'rgb(160, 80, 0)',
            'rgb(100, 30, 80)'
        ]
        return colors[Math.floor(Math.random() * colors.length)]
    }, [])

    return (
        <div className="pb-32 relative min-h-screen">
            {/* Subtle Gradient Background */}
            <div 
                className="absolute top-0 left-0 right-0 h-[332px] pointer-events-none z-0"
                style={{
                    background: `linear-gradient(to bottom, ${headerColor} 0%, rgba(18, 18, 18, 1) 100%)`
                }}
            />

            <div className="relative z-10 px-4 md:px-6 pt-20 md:pt-24 space-y-8">
                
                {/* Search Header */}
                <div className="max-w-xl">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                            <SearchIcon className="w-6 h-6 text-spotify-text/50 group-focus-within:text-white transition-colors" />
                        </div>
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="What do you want to listen to?"
                            className="w-full bg-white/10 hover:bg-white/15 focus:bg-white/20 border-2 border-transparent focus:border-white/50 rounded-full py-4 pl-14 pr-6 text-white placeholder:text-spotify-text/50 outline-none transition-all shadow-lg text-lg font-medium"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {[...Array(12)].map((_, i) => (
                            <Skeleton key={i} className="aspect-square rounded-md bg-white/5" />
                        ))}
                    </div>
                ) : (
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-6">
                            {query ? 'Search Results' : 'Browse All'}
                        </h2>
                        
                        {results.length === 0 ? (
                            <div className="text-center py-20 text-spotify-subtext">
                                <SearchIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                <h3 className="text-xl font-bold text-white mb-2">No results found for &quot;{query}&quot;</h3>
                                <p>Please make sure your words are spelled correctly or use fewer or different keywords.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                                {results.map(book => (
                                    <SpotifyBookCard key={book.id} book={book} showPlayButton={true} />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

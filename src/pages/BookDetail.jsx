import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { BookOpen, PlayCircle } from 'lucide-react'

export default function BookDetail() {
    const { bookId } = useParams()
    const [book, setBook] = useState(null)
    const [episodes, setEpisodes] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchBookDetails()
    }, [bookId])

    const fetchBookDetails = async () => {
        try {
            const { data: bookData } = await supabase
                .from('books')
                .select('*')
                .eq('id', bookId)
                .single()

            const { data: episodesData } = await supabase
                .from('episodes')
                .select('*')
                .eq('book_id', bookId)
                .order('episode_order', { ascending: true })

            setBook(bookData)
            setEpisodes(episodesData || [])
        } catch (err) {
            console.error('Error fetching book details:', err)
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

    if (!book) {
        return (
            <div className="text-center py-20">
                <p className="text-text-secondary">Book not found</p>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="bg-bg-elevated rounded-3xl p-8 border border-border-subtle">
                <div className="flex gap-6">
                    <div className="w-48 h-48 bg-bg-secondary rounded-2xl flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-24 h-24 text-accent" />
                    </div>
                    <div className="flex-1 space-y-4">
                        <div>
                            <h1 className="text-4xl font-bold text-white mb-2">{book.title}</h1>
                            <p className="text-xl text-text-secondary">{book.author}</p>
                        </div>
                        {book.blurb && (
                            <p className="text-text-secondary">{book.blurb}</p>
                        )}
                        {book.genre && (
                            <div className="flex gap-2">
                                <span className="px-4 py-2 bg-accent/20 text-accent rounded-xl">
                                    {book.genre}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-2xl font-bold text-white">Episodes</h2>
                {episodes.map((episode) => (
                    <div
                        key={episode.id}
                        className="bg-bg-elevated p-6 rounded-2xl border border-border-subtle hover:border-accent transition-all group cursor-pointer"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center">
                                <PlayCircle className="w-6 h-6 text-accent" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-white group-hover:text-accent transition-colors">
                                    Episode {episode.episode_order}: {episode.title}
                                </h3>
                                {episode.description && (
                                    <p className="text-sm text-text-secondary mt-1">{episode.description}</p>
                                )}
                            </div>
                            {!episode.is_free && (
                                <span className="px-3 py-1 bg-accent text-white text-sm rounded-full">
                                    Premium
                                </span>
                            )}
                        </div>
                    </div>
                ))}

                {episodes.length === 0 && (
                    <p className="text-center text-text-secondary py-10">No episodes available yet</p>
                )}
            </div>
        </div>
    )
}

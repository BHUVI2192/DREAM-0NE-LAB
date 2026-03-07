import { useNavigate } from 'react-router-dom'
import { Play, Lock } from 'lucide-react'

export default function BookCard({ book, hasAccess }) {
    const navigate = useNavigate()

    return (
        <div
            onClick={() => navigate(`/book/${book.id}`)}
            className="group relative bg-bg-elevated border border-border-subtle rounded-2xl overflow-hidden hover:border-accent/50 transition-all hover:scale-105 cursor-pointer"
        >
            <div className="relative aspect-[3/4] overflow-hidden">
                <img
                    src={book.cover_url || 'https://via.placeholder.com/300x400'}
                    alt={book.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                {!hasAccess && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end justify-center pb-4">
                        <Lock className="w-6 h-6 text-white" />
                    </div>
                )}
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1">
                    <Play className="w-3 h-3 text-accent" />
                    <span className="text-xs text-white font-semibold">{book.total_episodes || 0} eps</span>
                </div>
            </div>

            <div className="p-4">
                <h3 className="font-bold text-white mb-1 line-clamp-1">{book.title}</h3>
                <p className="text-text-muted text-sm mb-2">{book.author}</p>
                {book.genre && (
                    <span className="inline-block text-xs px-2 py-1 bg-accent/20 text-accent rounded-full">
                        {book.genre}
                    </span>
                )}
            </div>
        </div>
    )
}

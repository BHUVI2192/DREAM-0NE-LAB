import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Headphones, BookOpen, Unlock, Play } from 'lucide-react'
import Skeleton from '../components/ui/Skeleton'
import useAuth from '../hooks/useAuth'

export default function Landing() {
    const [books, setBooks] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedGenre, setSelectedGenre] = useState('All')
    const [mounted, setMounted] = useState(false)
    const { user } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        setMounted(true)
        fetchBooks()
    }, [])

    const fetchBooks = async () => {
        try {
            const { data, error } = await supabase
                .from('books')
                .select('*')
                .eq('is_published', true)
                .limit(10)

            if (error) throw error
            setBooks(data || [])
        } catch (error) {
            console.error('Error fetching books:', error)
        } finally {
            setLoading(false)
        }
    }

    const genres = ['All', 'Fiction', 'Non-Fiction', 'Self-Help', 'Mystery', 'Romance', 'Biography']
    const filteredBooks = selectedGenre === 'All' 
        ? books 
        : books.filter(book => book.genre === selectedGenre)

    const handleBookClick = (bookId) => {
        if (user) {
            navigate(`/book/${bookId}`)
        } else {
            navigate('/login')
        }
    }

    return (
        <div className="min-h-screen bg-[#0A0A0F] text-white">
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    50% { transform: translate(30px, 30px) scale(1.05); }
                }
                
                .gradient-orb {
                    position: absolute;
                    border-radius: 50%;
                    filter: blur(100px);
                    animation: float 12s ease-in-out infinite alternate;
                }
                
                .gradient-orb-1 {
                    top: -10%;
                    left: -10%;
                    width: 600px;
                    height: 600px;
                    background: rgba(123, 94, 167, 0.25);
                }
                
                .gradient-orb-2 {
                    bottom: -10%;
                    right: -10%;
                    width: 500px;
                    height: 500px;
                    background: rgba(232, 131, 74, 0.15);
                    animation-delay: -6s;
                }
                
                .book-card-float {
                    position: absolute;
                    animation: bookFloat 6s ease-in-out infinite;
                }
                
                @keyframes bookFloat {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                }
                
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .step-card {
                    opacity: 0;
                    animation: slideUp 0.6s ease-out forwards;
                }
            `}</style>

            {/* Minimal Top Bar */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0F]/80 backdrop-blur-md border-b border-white/5">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="font-display text-2xl font-bold text-white">Dream Lab</div>
                    <Link
                        to="/login"
                        className="px-6 py-2 border border-white/10 text-white rounded-xl hover:bg-white/5 transition-all"
                    >
                        Sign In
                   </Link>
                </div>
            </div>

            {/* SECTION 1: HERO */}
            <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
                {/* Animated Gradient Background */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="gradient-orb gradient-orb-1"></div>
                    <div className="gradient-orb gradient-orb-2"></div>
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        {/* Left Column - Content */}
                        <div className="space-y-6">
                            <div 
                                className={`inline-flex items-center gap-2 px-4 py-2 bg-[#2A2840] text-accent text-xs font-mono rounded-full border border-accent/20 transition-all duration-600 ${
                                    mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
                                }`}
                            >
                                ✦ For the Dream Lab Community
                            </div>
                            
                            <h1 
                                className={`font-display text-5xl md:text-6xl lg:text-7xl text-white leading-[1.1] transition-all duration-600 delay-150 ${
                                    mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
                                }`}
                            >
                                Your favourite books. Now in 6 episodes.
                            </h1>
                            
                            <p 
                                className={`text-lg md:text-xl text-text-secondary max-w-[480px] transition-all duration-600 delay-300 ${
                                    mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
                                }`}
                            >
                                Short, immersive audio adaptations made for people who love stories but hate excuses.
                            </p>
                            
                            <div 
                                className={`flex flex-col sm:flex-row gap-4 transition-all duration-600 delay-450 ${
                                    mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
                                }`}
                            >
                                <Link
                                    to="/signup"
                                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-accent text-white rounded-xl font-bold hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(124,58,237,0.5)] transition-all"
                                >
                                    Start Listening Free →
                                </Link>
                                <Link
                                    to="/login"
                                    className="text-accent hover:underline py-4 text-center"
                                >
                                    Already a member? Sign in
                                </Link>
                            </div>
                            
                            <div 
                                className={`flex flex-wrap items-center gap-3 text-xs font-mono text-text-muted transition-all duration-600 delay-600 ${
                                    mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
                                }`}
                            >
                                <span>🎧 100% Audio</span>
                                <span>·</span>
                                <span>📱 Mobile First</span>
                                <span>·</span>
                                <span>🔓 2 Free Episodes</span>
                            </div>
                        </div>

                        {/* Right Column - Floating Book Cards */}
                        <div className="hidden md:flex items-center justify-center relative h-[600px]">
                            <div className="book-card-float" style={{ transform: 'rotate(-8deg) translateX(-40px)' }}>
                                <div className="w-48 h-64 bg-gradient-to-br from-accent to-accent-warm rounded-xl shadow-2xl"></div>
                            </div>
                            <div className="book-card-float" style={{ transform: 'rotate(4deg) translateY(30px)', zIndex: 10 }}>
                                <div className="w-48 h-64 bg-gradient-to-br from-purple-600 to-pink-500 rounded-xl shadow-2xl"></div>
                            </div>
                            <div className="book-card-float" style={{ transform: 'rotate(-6deg) translateX(40px) translateY(-20px)' }}>
                                <div className="w-48 h-64 bg-gradient-to-br from-blue-500 to-teal-400 rounded-xl shadow-2xl"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION 2: FEATURED BOOKS SHELF */}
            <section className="py-20 px-4">
                <div className="container mx-auto">
                    <div className="mb-8">
                        <h2 className="font-display text-3xl md:text-4xl text-white mb-2">What's on Dream Lab</h2>
                        <p className="text-text-secondary">New adaptations drop every week</p>
                    </div>

                    <div className="relative">
                        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                            {loading ? (
                                <>
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="flex-shrink-0 w-40 md:w-44">
                                            <Skeleton className="w-full aspect-[3/4] rounded-xl mb-2" />
                                            <Skeleton className="w-full h-4 rounded mb-1" />
                                            <Skeleton className="w-3/4 h-3 rounded" />
                                        </div>
                                    ))}
                                </>
                            ) : books.length === 0 ? (
                                <div className="text-center py-12 text-text-muted w-full">
                                    No books available yet. Check back soon!
                                </div>
                            ) : (
                                books.map((book) => (
                                    <div 
                                        key={book.id} 
                                        className="flex-shrink-0 w-40 md:w-44 cursor-pointer"
                                        onClick={() => handleBookClick(book.id)}
                                    >
                                        <div className="relative group">
                                            <div className="aspect-[3/4] rounded-xl overflow-hidden mb-2 bg-gradient-to-br from-[#1A1A26] to-[#2A2840]">
                                                {book.cover_url ? (
                                                    <img 
                                                        src={book.cover_url} 
                                                        alt={book.title}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-4xl">📚</div>
                                                )}
                                            </div>
                                            <h3 className="font-display text-sm text-white line-clamp-2 mb-1">{book.title}</h3>
                                            <p className="text-xs text-text-secondary mb-2">{book.author}</p>
                                            {book.genre && (
                                                <span className="inline-block px-2 py-1 bg-accent/20 text-accent text-xs rounded-full mb-1">
                                                    {book.genre}
                                                </span>
                                            )}
                                            <div className="text-xs font-mono text-accent-warm">🔓 2 Free Eps</div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        {/* Blur gradient on right edge */}
                        <div className="absolute top-0 right-0 w-20 h-full bg-gradient-to-l from-[#0A0A0F] to-transparent pointer-events-none"></div>
                    </div>
                </div>
            </section>

            {/* SECTION 3: HOW IT WORKS */}
            <section className="py-20 px-4 bg-[#111118]">
                <div className="container mx-auto">
                    <h2 className="font-display text-3xl md:text-4xl text-center text-white mb-12">
                        Listen in 3 steps
                    </h2>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                step: '1',
                                icon: Headphones,
                                title: 'Sign in with your phone',
                                body: 'No password. Just your number and a quick OTP.'
                            },
                            {
                                step: '2',
                                icon: BookOpen,
                                title: 'Pick a book',
                                body: 'Browse our library of short audio adaptations.'
                            },
                            {
                                step: '3',
                                icon: Unlock,
                                title: 'Unlock the full story',
                                body: 'Episodes 1–2 are free. Unlock 3–6 for ₹49.'
                            }
                        ].map((item, idx) => (
                            <div
                                key={idx}
                                className="relative bg-bg-elevated border border-border-subtle rounded-card p-6 hover:border-accent/50 transition-all step-card"
                                style={{ animationDelay: `${idx * 150}ms` }}
                            >
                                <div className="absolute top-4 right-4 font-display text-[80px] font-bold text-accent opacity-15 leading-none pointer-events-none">
                                    {item.step}
                                </div>
                                <item.icon className="w-8 h-8 text-accent mb-4 relative z-10" />
                                <h3 className="font-display text-xl text-white mb-2 relative z-10">{item.title}</h3>
                                <p className="text-sm text-text-secondary relative z-10">{item.body}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* SECTION 4: COMMUNITY HOOK */}
            <section className="py-20 px-4">
                <div className="container mx-auto">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        {/* Left - YouTube Thumbnail */}
                        <a
                            href="https://youtube.com/@dreamlab"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block"
                        >
                            <div className="relative aspect-video bg-bg-elevated rounded-card overflow-hidden group cursor-pointer border border-border-subtle hover:border-accent/50 transition-all">
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <Play className="w-8 h-8 text-white fill-white ml-1" />
                                    </div>
                                    <p className="text-white font-bold">Dream Lab on YouTube</p>
                                </div>
                            </div>
                        </a>

                        {/* Right - Content */}
                        <div className="space-y-6">
                            <h2 className="font-display text-3xl md:text-4xl text-white">
                                Made for the Dream Lab YouTube Community
                            </h2>
                            <p className="text-text-secondary text-lg">
                                If you watch our channel, you already know the stories. Now hear them like never before.
                            </p>
                            <a
                                href="https://youtube.com/@dreamlab"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-bg-elevated border border-border-subtle text-white rounded-xl hover:border-accent transition-all"
                            >
                                Visit the Channel →
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION 5: GENRE FILTER SHELF */}
            <section className="py-20 px-4 bg-[#111118]">
                <div className="container mx-auto">
                    <h2 className="font-display text-3xl md:text-4xl text-white mb-8">Browse by genre</h2>

                    {/* Genre Pills */}
                    <div className="flex gap-2 overflow-x-auto pb-4 mb-8 scrollbar-hide">
                        {genres.map((genre) => (
                            <button
                                key={genre}
                                onClick={() => setSelectedGenre(genre)}
                                className={`flex-shrink-0 px-4 py-2 rounded-full border transition-all ${
                                    selectedGenre === genre
                                        ? 'bg-accent text-white border-accent'
                                        : 'bg-bg-elevated text-text-secondary border-border-subtle hover:text-white'
                                }`}
                            >
                                {genre}
                            </button>
                        ))}
                    </div>

                    {/* Filtered Books Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {loading ? (
                            <>
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <div key={i}>
                                        <Skeleton className="w-full aspect-[3/4] rounded-xl mb-2" />
                                        <Skeleton className="w-full h-4 rounded mb-1" />
                                        <Skeleton className="w-3/4 h-3 rounded" />
                                    </div>
                                ))}
                            </>
                        ) : filteredBooks.length === 0 ? (
                            <div className="col-span-full text-center py-12 text-text-muted">
                                No books in this genre yet.
                            </div>
                        ) : (
                            filteredBooks.map((book) => (
                                <div 
                                    key={book.id}
                                    className="cursor-pointer"
                                    onClick={() => handleBookClick(book.id)}
                                >
                                    <div className="relative group">
                                        <div className="aspect-[3/4] rounded-xl overflow-hidden mb-2 bg-gradient-to-br from-[#1A1A26] to-[#2A2840]">
                                            {book.cover_url ? (
                                                <img 
                                                    src={book.cover_url} 
                                                    alt={book.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-4xl">📚</div>
                                            )}
                                        </div>
                                        <h3 className="font-display text-sm text-white line-clamp-2 mb-1">{book.title}</h3>
                                        <p className="text-xs text-text-secondary">{book.author}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </section>

            {/* SECTION 6: FINAL CTA BANNER */}
            <section className="py-20 px-4">
                <div className="container mx-auto">
                    <div className="relative bg-gradient-to-r from-[#1A1A26] to-[#1A1030] border border-accent/30 rounded-card p-12 md:p-16 text-center overflow-hidden">
                        <div className="absolute inset-0 opacity-10">
                            <div className="absolute top-0 left-0 w-64 h-64 bg-accent rounded-full blur-3xl"></div>
                            <div className="absolute bottom-0 right-0 w-64 h-64 bg-accent-warm rounded-full blur-3xl"></div>
                        </div>
                        <div className="relative z-10">
                            <h2 className="font-display text-3xl md:text-5xl text-white mb-6">
                                Your next favourite story is waiting.
                            </h2>
                            <Link
                                to="/signup"
                                className="inline-flex items-center gap-2 px-10 py-4 bg-accent text-white text-lg font-bold rounded-xl hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(124,58,237,0.5)] transition-all"
                            >
                                Listen for Free →
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="border-t border-white/5 bg-[#0A0A0F] py-8 px-4">
                <div className="container mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
                        <div className="font-display text-xl font-bold text-white">
                            Dream Lab <span className="text-text-muted font-sans text-sm font-normal">· Stories worth your time</span>
                        </div>
                        <div className="flex gap-6 text-sm text-text-muted">
                            <a href="#" className="hover:text-white transition-colors">About</a>
                            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                            <a href="#" className="hover:text-white transition-colors">Terms</a>
                            <a href="#" className="hover:text-white transition-colors">Contact</a>
                        </div>
                    </div>
                    <div className="text-center text-xs font-mono text-text-muted">
                        © 2025 Dream Lab. Made with ❤️ in India.
                    </div>
                </div>
            </footer>
        </div>
    )
}

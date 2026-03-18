import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Headphones, BookOpen, Download, Star, ArrowRight, Play, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import useAuth from '../hooks/useAuth'

/* ─── tiny hook: detect when element enters viewport ─── */
function useInView(ref, threshold = 0.15) {
    const [inView, setInView] = useState(false)
    useEffect(() => {
        const el = ref.current
        if (!el) return
        const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true) }, { threshold })
        obs.observe(el)
        return () => obs.disconnect()
    }, [ref, threshold])
    return inView
}

/* ─── Animated section wrapper ─── */
function FadeUp({ children, delay = 0, className = '' }) {
    const ref = useRef(null)
    const inView = useInView(ref)
    return (
        <div
            ref={ref}
            className={className}
            style={{
                opacity: inView ? 1 : 0,
                transform: inView ? 'translateY(0)' : 'translateY(32px)',
                transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`
            }}
        >
            {children}
        </div>
    )
}

export default function Landing() {
    const [books, setBooks] = useState([])
    const [loading, setLoading] = useState(true)
    const [mounted, setMounted] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const shelfRef = useRef(null)
    const { user } = useAuth()
    const navigate = useNavigate()

    // Redirect authenticated users straight to the app
    useEffect(() => {
        if (user) navigate('/home', { replace: true })
    }, [user, navigate])

    useEffect(() => {
        setMounted(true)
        fetchBooks()
        const onScroll = () => setScrolled(window.scrollY > 40)
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    const fetchBooks = async () => {
        try {
            const { data } = await supabase
                .from('books')
                .select('id, title, author, cover_url, genre')
                .eq('is_published', true)
                .limit(12)
            setBooks(data || [])
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const handleBookClick = (id) => navigate(user ? `/book/${id}` : '/login')

    const scrollShelf = (dir) => {
        if (shelfRef.current) shelfRef.current.scrollBy({ left: dir * 260, behavior: 'smooth' })
    }

    const features = [
        { icon: Headphones, title: 'Immersive Audio', desc: 'Studio-quality narration across every title in our library.' },
        { icon: BookOpen,   title: '6-Episode Format', desc: 'Every book distilled into 6 punchy, bingeable episodes.' },
        { icon: Download,   title: 'Listen Offline', desc: 'Download any episode and take your stories anywhere.' },
        { icon: Star,       title: 'New Drops Weekly', desc: 'Fresh adaptations land every week — never run out.' },
    ]

    return (
        <div className="min-h-screen bg-[#080810] text-white overflow-x-hidden font-sans">

            {/* ── NAV ── */}
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#080810]/90 backdrop-blur-xl border-b border-white/[0.06] shadow-lg shadow-black/30' : 'bg-transparent'}`}>
                <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
                            <span className="text-white text-xs font-black tracking-tight">DL</span>
                        </div>
                        <span className="text-white font-bold text-lg tracking-tight">Dream One Lab</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link to="/login" className="hidden sm:block text-sm text-white/60 hover:text-white transition-colors px-4 py-2">
                            Sign In
                        </Link>
                        <Link
                            to="/signup"
                            className="text-sm font-semibold px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-600/30 hover:shadow-violet-600/50 transition-all hover:-translate-y-0.5"
                        >
                            Get Started
                        </Link>
                    </div>
                </div>
            </nav>

            {/* ── HERO ── */}
            <section className="relative min-h-screen flex items-center justify-center px-5 sm:px-8 pt-16 overflow-hidden">

                {/* Background orbs */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-violet-600/20 blur-[120px] animate-pulse" style={{ animationDuration: '6s' }} />
                    <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/15 blur-[120px] animate-pulse" style={{ animationDuration: '8s', animationDelay: '2s' }} />
                    <div className="absolute top-[40%] left-[50%] w-[300px] h-[300px] rounded-full bg-fuchsia-600/10 blur-[100px]" />
                    {/* Grid lines */}
                    <svg className="absolute inset-0 w-full h-full opacity-[0.025]" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.75"/>
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>
                </div>

                <div className="relative z-10 max-w-4xl mx-auto text-center">
                    {/* Badge */}
                    <div
                        className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-xs font-semibold tracking-wider uppercase transition-all duration-700"
                        style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(16px)' }}
                    >
                        <Sparkles className="w-3.5 h-3.5" />
                        For the Dream One Lab Community
                    </div>

                    {/* Headline */}
                    <h1
                        className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08] mb-6 transition-all duration-700 delay-150"
                        style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(24px)' }}
                    >
                        Your favourite books.{' '}
                        <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">
                            Now in&nbsp;6 episodes.
                        </span>
                    </h1>

                    {/* Sub */}
                    <p
                        className="text-base sm:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed transition-all duration-700 delay-300"
                        style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(24px)' }}
                    >
                        Short, immersive audio adaptations crafted for people who love stories but hate excuses.
                    </p>

                    {/* CTA buttons */}
                    <div
                        className="flex flex-col sm:flex-row gap-4 justify-center items-center transition-all duration-700 delay-500"
                        style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(24px)' }}
                    >
                        <Link
                            to="/signup"
                            className="group flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-base shadow-2xl shadow-violet-600/40 hover:shadow-violet-500/60 hover:-translate-y-1 transition-all duration-200"
                        >
                            Start Listening Free
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            to="/login"
                            className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-white/[0.05] border border-white/[0.1] text-white/80 font-semibold text-base hover:bg-white/[0.1] hover:text-white hover:-translate-y-1 transition-all duration-200"
                        >
                            Sign In
                        </Link>
                    </div>

                    {/* Trust bar */}
                    <div
                        className="mt-12 flex flex-wrap justify-center gap-x-8 gap-y-2 text-xs text-white/30 font-medium transition-all duration-700 delay-700"
                        style={{ opacity: mounted ? 1 : 0 }}
                    >
                        <span>🎧 100% Audio</span>
                        <span>·</span>
                        <span>📱 Mobile First</span>
                        <span>·</span>
                        <span>📥 Offline Downloads</span>
                        <span>·</span>
                        <span>🔓 2 Free Episodes</span>
                    </div>
                </div>

                {/* bottom fade */}
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#080810] to-transparent pointer-events-none" />
            </section>

            {/* ── FEATURES ── */}
            <section className="py-24 px-5 sm:px-8">
                <div className="max-w-6xl mx-auto">
                    <FadeUp className="text-center mb-16">
                        <p className="text-violet-400 text-xs font-bold uppercase tracking-[0.2em] mb-3">Why Dream One Lab</p>
                        <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                            Built for listeners who mean business
                        </h2>
                    </FadeUp>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {features.map((f, i) => (
                            <FadeUp key={i} delay={i * 80} className="group relative rounded-2xl p-6 bg-white/[0.03] border border-white/[0.07] hover:border-violet-500/40 hover:bg-white/[0.06] transition-all duration-300 cursor-default">
                                <div className="w-11 h-11 rounded-xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center mb-5 group-hover:bg-violet-500/25 transition-colors">
                                    <f.icon className="w-5 h-5 text-violet-400" />
                                </div>
                                <h3 className="font-bold text-white mb-2 text-[0.95rem]">{f.title}</h3>
                                <p className="text-sm text-white/45 leading-relaxed">{f.desc}</p>
                            </FadeUp>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── BOOKS SHELF ── */}
            <section className="py-20 px-5 sm:px-8 bg-white/[0.02] border-y border-white/[0.05]">
                <div className="max-w-6xl mx-auto">
                    <FadeUp className="flex items-end justify-between mb-8 gap-4 flex-wrap">
                        <div>
                            <p className="text-violet-400 text-xs font-bold uppercase tracking-[0.2em] mb-2">Now Available</p>
                            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">What's on Dream One Lab</h2>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => scrollShelf(-1)}
                                className="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center hover:bg-white/[0.12] transition-colors text-white/70 hover:text-white"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => scrollShelf(1)}
                                className="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center hover:bg-white/[0.12] transition-colors text-white/70 hover:text-white"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </FadeUp>

                    <div className="relative">
                        <div
                            ref={shelfRef}
                            className="flex gap-5 overflow-x-auto pb-4"
                            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                        >
                            {loading ? (
                                Array.from({ length: 6 }).map((_, i) => (
                                    <div key={i} className="flex-shrink-0 w-40 sm:w-44">
                                        <div className="aspect-[3/4] rounded-2xl mb-3 bg-white/[0.05] animate-pulse" />
                                        <div className="h-3.5 rounded bg-white/[0.05] animate-pulse mb-2 w-4/5" />
                                        <div className="h-3 rounded bg-white/[0.03] animate-pulse w-3/5" />
                                    </div>
                                ))
                            ) : books.length === 0 ? (
                                <div className="text-white/30 text-sm w-full text-center py-16">
                                    No books available yet — check back soon!
                                </div>
                            ) : (
                                books.map((book) => (
                                    <div
                                        key={book.id}
                                        onClick={() => handleBookClick(book.id)}
                                        className="flex-shrink-0 w-40 sm:w-44 cursor-pointer group"
                                    >
                                        <div className="aspect-[3/4] rounded-2xl overflow-hidden mb-3 bg-gradient-to-br from-violet-900/40 to-indigo-900/40 relative border border-white/[0.06] group-hover:border-violet-500/40 transition-all duration-300 shadow-lg shadow-black/30 group-hover:shadow-violet-500/20 group-hover:scale-[1.03]">
                                            {book.cover_url ? (
                                                <img
                                                    src={book.cover_url}
                                                    alt={book.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-4xl">📚</div>
                                            )}
                                            {/* play overlay */}
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-xl">
                                                    <Play className="w-5 h-5 text-black fill-black ml-0.5" />
                                                </div>
                                            </div>
                                        </div>
                                        <h3 className="text-sm font-bold text-white line-clamp-2 mb-1 leading-snug">{book.title}</h3>
                                        <p className="text-xs text-white/40">{book.author}</p>
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="absolute top-0 right-0 w-24 h-[calc(100%-1rem)] bg-gradient-to-l from-[#080810] to-transparent pointer-events-none" />
                    </div>

                    <FadeUp delay={200} className="mt-8 text-center">
                        <Link
                            to="/signup"
                            className="inline-flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300 font-semibold group transition-colors"
                        >
                            Browse the full library
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </FadeUp>
                </div>
            </section>

            {/* ── HOW IT WORKS ── */}
            <section className="py-24 px-5 sm:px-8">
                <div className="max-w-6xl mx-auto">
                    <FadeUp className="text-center mb-16">
                        <p className="text-violet-400 text-xs font-bold uppercase tracking-[0.2em] mb-3">Simple Start</p>
                        <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">Start listening in 3 steps</h2>
                    </FadeUp>

                    <div className="grid md:grid-cols-3 gap-6 relative">
                        {/* connector line (desktop) */}
                        <div className="hidden md:block absolute top-[2.75rem] left-[calc(16.66%+1.5rem)] right-[calc(16.66%+1.5rem)] h-px bg-gradient-to-r from-violet-500/40 via-fuchsia-500/40 to-indigo-500/40" />

                        {[
                            { num: '01', icon: Headphones, color: 'from-violet-600 to-violet-500', title: 'Create an account', body: 'Sign up with email or phone — takes under 30 seconds.' },
                            { num: '02', icon: BookOpen,   color: 'from-fuchsia-600 to-violet-600', title: 'Pick a book',        body: 'Browse by genre or search for your next story.' },
                            { num: '03', icon: Play,       color: 'from-indigo-600 to-fuchsia-600', title: 'Listen & enjoy',     body: 'Two episodes free every book. Download for offline.' },
                        ].map((step, i) => (
                            <FadeUp key={i} delay={i * 120} className="relative rounded-2xl p-7 bg-white/[0.03] border border-white/[0.07] hover:border-violet-500/30 transition-all group">
                                {/* Number */}
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-6 shadow-lg shadow-violet-600/30 relative z-10 group-hover:scale-110 transition-transform`}>
                                    <step.icon className="w-5 h-5 text-white" />
                                </div>
                                <span className="absolute top-5 right-6 text-7xl font-black text-white/[0.04] leading-none pointer-events-none select-none">{step.num}</span>
                                <h3 className="text-white font-bold text-lg mb-2">{step.title}</h3>
                                <p className="text-sm text-white/45 leading-relaxed">{step.body}</p>
                            </FadeUp>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── YOUTUBE COMMUNITY ── */}
            <section className="py-16 px-5 sm:px-8">
                <div className="max-w-6xl mx-auto">
                    <FadeUp>
                        <div className="relative rounded-3xl overflow-hidden border border-white/[0.07] bg-gradient-to-br from-[#0f0f1e] via-[#12102a] to-[#0f0f1e] p-8 sm:p-12">
                            {/* glow */}
                            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-violet-600/20 blur-[80px] pointer-events-none" />
                            <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-indigo-600/15 blur-[80px] pointer-events-none" />

                            <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                                {/* YouTube button */}
                                <a
                                    href="https://youtube.com/@dreamlab"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-shrink-0 w-full md:w-56 h-36 rounded-2xl bg-black/50 border border-white/10 flex flex-col items-center justify-center gap-3 hover:border-red-500/50 hover:bg-red-500/5 transition-all group cursor-pointer"
                                >
                                    <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-red-600/40">
                                        <Play className="w-6 h-6 text-white fill-white ml-0.5" />
                                    </div>
                                    <span className="text-xs text-white/50 group-hover:text-white/80 transition-colors font-medium">Watch on YouTube</span>
                                </a>

                                <div className="text-center md:text-left">
                                    <p className="text-violet-400 text-xs font-bold uppercase tracking-[0.2em] mb-3">YouTube Community</p>
                                    <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-4">
                                        Made for the Dream One Lab YouTube community
                                    </h2>
                                    <p className="text-white/50 text-base leading-relaxed mb-6 max-w-lg">
                                        If you already watch our channel, you know the stories. Now hear them like never before — fully produced, immersive audio.
                                    </p>
                                    <a
                                        href="https://youtube.com/@dreamlab"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white font-semibold group transition-colors"
                                    >
                                        Visit the Channel
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </FadeUp>
                </div>
            </section>

            {/* ── FINAL CTA ── */}
            <section className="py-24 px-5 sm:px-8">
                <div className="max-w-3xl mx-auto text-center">
                    <FadeUp>
                        <div className="relative rounded-3xl p-10 sm:p-16 overflow-hidden border border-violet-500/20 bg-gradient-to-br from-violet-900/30 via-[#0f0f1e] to-indigo-900/20">
                            <div className="absolute inset-0 pointer-events-none">
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-violet-600/20 blur-[80px]" />
                            </div>
                            <div className="relative z-10">
                                <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-xs font-bold uppercase tracking-wider">
                                    <Sparkles className="w-3.5 h-3.5" />
                                    Free to Start
                                </div>
                                <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-5 leading-tight">
                                    Your next favourite<br />story is waiting.
                                </h2>
                                <p className="text-white/50 text-base mb-10 max-w-md mx-auto">
                                    Create your free account and start exploring Dream One Lab's growing library of audio stories.
                                </p>
                                <Link
                                    to="/signup"
                                    className="inline-flex items-center gap-3 px-10 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-lg shadow-2xl shadow-violet-600/40 hover:shadow-violet-500/60 hover:-translate-y-1 transition-all duration-200 group"
                                >
                                    Listen for Free
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </div>
                    </FadeUp>
                </div>
            </section>

            {/* ── FOOTER ── */}
            <footer className="border-t border-white/[0.05] bg-[#060608] py-10 px-5 sm:px-8">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mb-8">
                        <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                                <span className="text-white text-[10px] font-black">DL</span>
                            </div>
                            <span className="text-white font-bold">Dream One Lab</span>
                            <span className="text-white/25 text-sm">· Stories worth your time</span>
                        </div>
                        <div className="flex gap-7 text-sm text-white/40">
                            {['About', 'Privacy Policy', 'Terms', 'Contact'].map(l => (
                                <a key={l} href="#" className="hover:text-white transition-colors">{l}</a>
                            ))}
                        </div>
                    </div>
                    <div className="border-t border-white/[0.04] pt-6 text-center text-xs text-white/20">
                        © {new Date().getFullYear()} Dream One Lab. Made with ❤️ in India.
                    </div>
                </div>
            </footer>
        </div>
    )
}

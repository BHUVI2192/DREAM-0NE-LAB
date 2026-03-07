import { useState } from 'react'
import { supabase } from '../lib/supabase'

const sampleBooks = [
    {
        title: 'The Midnight Library',
        author: 'Matt Haig',
        genre: 'Fiction',
        language: 'English',
        blurb: 'Between life and death there is a library, and within that library, the shelves go on forever. Every book provides a chance to try another life you could have lived.',
        tags: ['Philosophy', 'Self-Discovery', 'Magical Realism'],
        cover_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=600&fit=crop',
        is_published: true,
        episodes: [
            { title: 'The Library Between Life and Death', description: 'Nora Seed discovers the mysterious Midnight Library', episode_number: 1, duration_seconds: 1620, is_free: true },
            { title: 'The Book of Regrets', description: 'Exploring the infinite possibilities of different lives', episode_number: 2, duration_seconds: 1580, is_free: true },
            { title: 'The Lives Not Lived', description: 'Nora experiences her alternate lives as a rock star', episode_number: 3, duration_seconds: 1720, is_free: false },
            { title: 'Swimming with Seals', description: 'A life as a glaciologist in the Arctic', episode_number: 4, duration_seconds: 1650, is_free: false },
            { title: 'The Perfect Life?', description: 'Finding meaning in the lives she never chose', episode_number: 5, duration_seconds: 1700, is_free: false },
            { title: 'The Real Library', description: 'Nora makes her final choice', episode_number: 6, duration_seconds: 1800, is_free: false }
        ]
    },
    {
        title: 'Atomic Habits',
        author: 'James Clear',
        genre: 'Self-Help',
        language: 'English',
        blurb: 'No matter your goals, Atomic Habits offers a proven framework for improving every day. James Clear reveals practical strategies that will teach you exactly how to form good habits.',
        tags: ['Productivity', 'Self-Improvement', 'Psychology'],
        cover_url: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=600&fit=crop',
        is_published: true,
        episodes: [
            { title: 'The Fundamentals', description: 'Why tiny changes make a big difference', episode_number: 1, duration_seconds: 1440, is_free: true },
            { title: 'The Four Laws of Behavior Change', description: 'How your habits shape your identity', episode_number: 2, duration_seconds: 1520, is_free: true },
            { title: 'Make It Obvious', description: 'The 1st Law: Implementation intentions', episode_number: 3, duration_seconds: 1600, is_free: false },
            { title: 'Make It Attractive', description: 'The 2nd Law: Temptation bundling', episode_number: 4, duration_seconds: 1560, is_free: false },
            { title: 'Make It Easy', description: 'The 3rd Law: The two-minute rule', episode_number: 5, duration_seconds: 1580, is_free: false },
            { title: 'Make It Satisfying', description: 'The 4th Law: Immediate rewards', episode_number: 6, duration_seconds: 1640, is_free: false }
        ]
    },
    {
        title: 'The Silent Patient',
        author: 'Alex Michaelides',
        genre: 'Mystery',
        language: 'English',
        blurb: "Alicia Berenson's life is seemingly perfect. One evening her husband returns home late from a fashion shoot, and Alicia shoots him five times in the face, and then never speaks another word.",
        tags: ['Thriller', 'Psychological', 'Crime'],
        cover_url: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop',
        is_published: true,
        episodes: [
            { title: 'The Murder', description: 'Alicia Berenson shoots her husband', episode_number: 1, duration_seconds: 1500, is_free: true },
            { title: 'The Therapist', description: 'Theo Faber becomes obsessed', episode_number: 2, duration_seconds: 1480, is_free: true },
            { title: 'The Sessions Begin', description: 'Therapy with the silent patient', episode_number: 3, duration_seconds: 1620, is_free: false },
            { title: 'Uncovering the Past', description: 'Dark secrets emerge', episode_number: 4, duration_seconds: 1580, is_free: false },
            { title: 'The Diary', description: 'Alicia\'s diary reveals truths', episode_number: 5, duration_seconds: 1700, is_free: false },
            { title: 'The Truth', description: 'The stunning revelation', episode_number: 6, duration_seconds: 1750, is_free: false }
        ]
    },
    {
        title: 'Sapiens',
        author: 'Yuval Noah Harari',
        genre: 'Non-Fiction',
        language: 'English',
        blurb: 'From a renowned historian comes a groundbreaking narrative of humanity\'s creation and evolution that explores what it means to be "human."',
        tags: ['History', 'Anthropology', 'Science'],
        cover_url: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=600&fit=crop',
        is_published: true,
        episodes: [
            { title: 'The Cognitive Revolution', description: 'How Homo sapiens conquered the world', episode_number: 1, duration_seconds: 1800, is_free: true },
            { title: 'The Agricultural Revolution', description: 'History\'s biggest fraud', episode_number: 2, duration_seconds: 1720, is_free: true },
            { title: 'The Unification of Humankind', description: 'Money, empires, and religions', episode_number: 3, duration_seconds: 1680, is_free: false },
            { title: 'The Scientific Revolution', description: 'The discovery of ignorance', episode_number: 4, duration_seconds: 1750, is_free: false },
            { title: 'The Industrial Revolution', description: 'Science and capitalism', episode_number: 5, duration_seconds: 1820, is_free: false },
            { title: 'The Future of Sapiens', description: 'The end of Homo sapiens?', episode_number: 6, duration_seconds: 1900, is_free: false }
        ]
    },
    {
        title: 'The Psychology of Money',
        author: 'Morgan Housel',
        genre: 'Non-Fiction',
        language: 'English',
        blurb: 'Doing well with money isn\'t necessarily about what you know. It\'s about how you behave. And behavior is hard to teach, even to really smart people.',
        tags: ['Finance', 'Psychology', 'Business'],
        cover_url: 'https://images.unsplash.com/photo-1633158829585-23ba8f7c8caf?w=400&h=600&fit=crop',
        is_published: true,
        episodes: [
            { title: 'No One\'s Crazy', description: 'Personal experiences shape financial decisions', episode_number: 1, duration_seconds: 1380, is_free: true },
            { title: 'Luck vs Risk', description: 'Understanding the role of chance', episode_number: 2, duration_seconds: 1420, is_free: true },
            { title: 'Never Enough', description: 'The danger of always wanting more', episode_number: 3, duration_seconds: 1460, is_free: false },
            { title: 'Compounding Magic', description: 'The eighth wonder of the world', episode_number: 4, duration_seconds: 1500, is_free: false },
            { title: 'Wealth is What You Don\'t See', description: 'Rich vs wealthy', episode_number: 5, duration_seconds: 1440, is_free: false },
            { title: 'Room for Error', description: 'The most important part of every plan', episode_number: 6, duration_seconds: 1520, is_free: false }
        ]
    }
]

export default function SeedData() {
    const [seeding, setSeeding] = useState(false)
    const [status, setStatus] = useState('')
    const [progress, setProgress] = useState([])

    const handleSeed = async () => {
        setSeeding(true)
        setProgress([])
        setStatus('Starting database seeding...')

        for (const bookData of sampleBooks) {
            const { episodes, ...book } = bookData
            
            setStatus(`Creating book: ${book.title}`)
            
            const { data: createdBook, error: bookError } = await supabase
                .from('books')
                .insert(book)
                .select()
                .single()

            if (bookError) {
                setProgress(prev => [...prev, `❌ Error: ${book.title} - ${bookError.message}`])
                continue
            }

            setProgress(prev => [...prev, `✅ Created: ${book.title}`])

            // Insert episodes
            const episodesWithBookId = episodes.map(ep => ({
                ...ep,
                book_id: createdBook.id,
                audio_url: `https://example.com/audio/${book.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-ep${ep.episode_number}.mp3`
            }))

            const { error: episodesError } = await supabase
                .from('episodes')
                .insert(episodesWithBookId)

            if (episodesError) {
                setProgress(prev => [...prev, `⚠️ Episodes error for ${book.title}: ${episodesError.message}`])
            } else {
                setProgress(prev => [...prev, `  ✅ Added ${episodes.length} episodes`])
            }

            await new Promise(resolve => setTimeout(resolve, 500))
        }

        setStatus('🎉 Database seeding completed!')
        setSeeding(false)
    }

    return (
        <div className="min-h-screen bg-bg-primary p-8">
            <div className="max-w-2xl mx-auto">
                <h1 className="font-display text-4xl text-white mb-8">Seed Database</h1>
                
                <div className="bg-bg-elevated border border-border-subtle rounded-card p-6 mb-6">
                    <p className="text-text-secondary mb-4">
                        This will create 5 sample books with 6 episodes each (first 2 free).
                    </p>
                    
                    <button
                        onClick={handleSeed}
                        disabled={seeding}
                        className="px-6 py-3 bg-accent text-white rounded-xl font-bold hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {seeding ? 'Seeding...' : 'Seed Database'}
                    </button>
                </div>

                {status && (
                    <div className="bg-bg-elevated border border-border-subtle rounded-card p-6">
                        <h2 className="text-white font-bold mb-4">{status}</h2>
                        <div className="space-y-2 font-mono text-sm">
                            {progress.map((line, i) => (
                                <div key={i} className="text-text-secondary">
                                    {line}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

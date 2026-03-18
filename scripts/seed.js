import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables from .env file
const envPath = resolve(__dirname, '../.env')
const envContent = readFileSync(envPath, 'utf-8')
const envVars = {}
envContent.split('\n').forEach(line => {
    const [key, ...value] = line.split('=')
    if (key && value.length) {
        envVars[key.trim()] = value.join('=').trim()
    }
})

const supabaseUrl = envVars.VITE_SUPABASE_URL
const supabaseKey = envVars.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in .env file')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const books = [
    {
        title: 'The Midnight Library',
        author: 'Matt Haig',
        genre: 'Fiction',
        language: 'English',
        blurb: 'Between life and death there is a library, and within that library, the shelves go on forever. Every book provides a chance to try another life you could have lived. To see how things would be if you had made other choices.',
        tags: ['Philosophy', 'Self-Discovery', 'Magical Realism'],
        cover_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=600&fit=crop',
        is_published: true,
        is_special: false
    },
    {
        title: 'Atomic Habits',
        author: 'James Clear',
        genre: 'Self-Help',
        language: 'English',
        blurb: 'No matter your goals, Atomic Habits offers a proven framework for improving every day. James Clear reveals practical strategies that will teach you exactly how to form good habits, break bad ones, and master the tiny behaviors that lead to remarkable results.',
        tags: ['Productivity', 'Self-Improvement', 'Psychology'],
        cover_url: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=600&fit=crop',
        is_published: true,
        is_special: false
    },
    {
        title: 'The Silent Patient',
        author: 'Alex Michaelides',
        genre: 'Mystery',
        language: 'English',
        blurb: "Alicia Berenson's life is seemingly perfect. A famous painter married to an in-demand fashion photographer, she lives in a grand house. One evening her husband returns home late from a fashion shoot, and Alicia shoots him five times in the face, and then never speaks another word.",
        tags: ['Thriller', 'Psychological', 'Crime'],
        cover_url: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop',
        is_published: true,
        is_special: false
    },
    {
        title: 'Sapiens: A Brief History of Humankind',
        author: 'Yuval Noah Harari',
        genre: 'Non-Fiction',
        language: 'English',
        blurb: 'From a renowned historian comes a groundbreaking narrative of humanity\'s creation and evolution that explores the ways in which biology and history have defined us and enhanced our understanding of what it means to be "human."',
        tags: ['History', 'Anthropology', 'Science'],
        cover_url: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=600&fit=crop',
        is_published: true,
        is_special: false
    },
    {
        title: 'The Psychology of Money',
        author: 'Morgan Housel',
        genre: 'Non-Fiction',
        language: 'English',
        blurb: 'Doing well with money isn\'t necessarily about what you know. It\'s about how you behave. And behavior is hard to teach, even to really smart people. Money―investing, personal finance, and business decisions―is typically taught as a math-based field, where data and formulas tell us exactly what to do.',
        tags: ['Finance', 'Psychology', 'Business'],
        cover_url: 'https://images.unsplash.com/photo-1633158829585-23ba8f7c8caf?w=400&h=600&fit=crop',
        is_published: true,
        is_special: false
    }
]

const episodesData = {
    'The Midnight Library': [
        { title: 'The Library Between Life and Death', description: 'Nora Seed discovers the mysterious Midnight Library', episode_number: 1, duration_seconds: 1620, is_free: true },
        { title: 'The Book of Regrets', description: 'Exploring the infinite possibilities of different lives', episode_number: 2, duration_seconds: 1580, is_free: true },
        { title: 'The Lives Not Lived', description: 'Nora experiences her alternate lives as a rock star', episode_number: 3, duration_seconds: 1720, is_free: false },
        { title: 'Swimming with Seals', description: 'A life as a glaciologist in the Arctic', episode_number: 4, duration_seconds: 1650, is_free: false },
        { title: 'The Perfect Life?', description: 'Finding meaning in the lives she never chose', episode_number: 5, duration_seconds: 1700, is_free: false },
        { title: 'The Real Library', description: 'Nora makes her final choice', episode_number: 6, duration_seconds: 1800, is_free: false }
    ],
    'Atomic Habits': [
        { title: 'The Fundamentals', description: 'Why tiny changes make a big difference', episode_number: 1, duration_seconds: 1440, is_free: true },
        { title: 'The Four Laws of Behavior Change', description: 'How your habits shape your identity', episode_number: 2, duration_seconds: 1520, is_free: true },
        { title: 'Make It Obvious', description: 'The 1st Law: Implementation intentions and habit stacking', episode_number: 3, duration_seconds: 1600, is_free: false },
        { title: 'Make It Attractive', description: 'The 2nd Law: Temptation bundling and motivation', episode_number: 4, duration_seconds: 1560, is_free: false },
        { title: 'Make It Easy', description: 'The 3rd Law: The two-minute rule and friction', episode_number: 5, duration_seconds: 1580, is_free: false },
        { title: 'Make It Satisfying', description: 'The 4th Law: Immediate rewards and habit tracking', episode_number: 6, duration_seconds: 1640, is_free: false }
    ],
    'The Silent Patient': [
        { title: 'The Murder', description: 'Alicia Berenson shoots her husband and never speaks again', episode_number: 1, duration_seconds: 1500, is_free: true },
        { title: 'The Therapist', description: 'Theo Faber becomes obsessed with treating Alicia', episode_number: 2, duration_seconds: 1480, is_free: true },
        { title: 'The Sessions Begin', description: 'Theo starts therapy with the silent patient', episode_number: 3, duration_seconds: 1620, is_free: false },
        { title: 'Uncovering the Past', description: 'Dark secrets from Alicia\'s childhood emerge', episode_number: 4, duration_seconds: 1580, is_free: false },
        { title: 'The Diary', description: 'Alicia\'s diary reveals shocking truths', episode_number: 5, duration_seconds: 1700, is_free: false },
        { title: 'The Truth', description: 'The stunning revelation behind the silence', episode_number: 6, duration_seconds: 1750, is_free: false }
    ],
    'Sapiens: A Brief History of Humankind': [
        { title: 'The Cognitive Revolution', description: 'How Homo sapiens conquered the world', episode_number: 1, duration_seconds: 1800, is_free: true },
        { title: 'The Agricultural Revolution', description: 'History\'s biggest fraud', episode_number: 2, duration_seconds: 1720, is_free: true },
        { title: 'The Unification of Humankind', description: 'Money, empires, and universal religions', episode_number: 3, duration_seconds: 1680, is_free: false },
        { title: 'The Scientific Revolution', description: 'The discovery of ignorance', episode_number: 4, duration_seconds: 1750, is_free: false },
        { title: 'The Industrial Revolution', description: 'The marriage of science and capitalism', episode_number: 5, duration_seconds: 1820, is_free: false },
        { title: 'The Future of Sapiens', description: 'The end of Homo sapiens?', episode_number: 6, duration_seconds: 1900, is_free: false }
    ],
    'The Psychology of Money': [
        { title: 'No One\'s Crazy', description: 'How your personal experiences shape your financial decisions', episode_number: 1, duration_seconds: 1380, is_free: true },
        { title: 'Luck vs Risk', description: 'Understanding the role of chance in success', episode_number: 2, duration_seconds: 1420, is_free: true },
        { title: 'Never Enough', description: 'The danger of always wanting more', episode_number: 3, duration_seconds: 1460, is_free: false },
        { title: 'Compounding Magic', description: 'The eighth wonder of the world', episode_number: 4, duration_seconds: 1500, is_free: false },
        { title: 'Wealth is What You Don\'t See', description: 'The difference between rich and wealthy', episode_number: 5, duration_seconds: 1440, is_free: false },
        { title: 'Room for Error', description: 'The most important part of every plan', episode_number: 6, duration_seconds: 1520, is_free: false }
    ]
}

async function seedDatabase() {
    console.log('🌱 Starting database seeding...\n')

    for (const book of books) {
        console.log(`📚 Creating book: ${book.title}`)
        
        const { data: bookData, error: bookError } = await supabase
            .from('books')
            .insert(book)
            .select()
            .single()

        if (bookError) {
            console.error(`❌ Error creating ${book.title}:`, bookError.message)
            continue
        }

        console.log(`✅ Book created with ID: ${bookData.id}`)

        // Insert episodes for this book
        const episodes = episodesData[book.title]
        if (episodes) {
            const episodesWithBookId = episodes.map(ep => ({
                ...ep,
                book_id: bookData.id,
                audio_url: `https://example.com/audio/${book.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-ep${ep.episode_number}.mp3`
            }))

                const { error: episodesError } = await supabase
                .from('episodes')
                .insert(episodesWithBookId)

            if (episodesError) {
                console.error(`❌ Error creating episodes for ${book.title}:`, episodesError.message)
            } else {
                console.log(`✅ Added ${episodes.length} episodes\n`)
            }
        }
    }

    console.log('🎉 Database seeding completed!')
}

seedDatabase().catch(console.error)

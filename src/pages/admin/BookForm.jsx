import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { Save, ArrowLeft } from 'lucide-react'

export default function BookForm() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        title: '',
        author: '',
        description: '',
        blurb: '',
        genre: '',
        language: 'English',
        cover_url: '',
        is_published: false,
        is_premium: false,
        is_special: false,
        price: 49
    })

    useEffect(() => {
        if (id && id !== 'new') {
            loadBook()
        }
    }, [id])

    const loadBook = async () => {
        try {
            const { data, error } = await supabase
                .from('books')
                .select('*')
                .eq('id', id)
                .single()

            if (error) throw error
            setFormData(data)
        } catch (error) {
            console.error('Failed to load book:', error)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            if (id && id !== 'new') {
                const { error } = await supabase
                    .from('books')
                    .update(formData)
                    .eq('id', id)
                if (error) throw error
            } else {
                const { error } = await supabase
                    .from('books')
                    .insert([formData])
                if (error) throw error
            }

            navigate('/admin/books')
        } catch (error) {
            console.error('Failed to save book:', error)
            alert('Failed to save book')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="p-8 max-w-3xl">
            <button
                onClick={() => navigate('/admin/books')}
                className="flex items-center gap-2 text-text-muted hover:text-white mb-6 transition"
            >
                <ArrowLeft className="w-5 h-5" />
                Back to Books
            </button>

            <h1 className="font-display text-3xl font-bold text-white mb-8">
                {id && id !== 'new' ? 'Edit Book' : 'Create New Book'}
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-text-secondary mb-2">Title *</label>
                    <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full bg-bg-secondary border border-border-subtle rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent"
                        required
                    />
                </div>

                <div>
                    <label className="block text-text-secondary mb-2">Author *</label>
                    <input
                        type="text"
                        value={formData.author}
                        onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                        className="w-full bg-bg-secondary border border-border-subtle rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent"
                        required
                    />
                </div>

                <div>
                    <label className="block text-text-secondary mb-2">Blurb (Short description) *</label>
                    <textarea
                        value={formData.blurb}
                        onChange={(e) => setFormData({ ...formData, blurb: e.target.value })}
                        className="w-full bg-bg-secondary border border-border-subtle rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent h-24"
                        required
                    />
                </div>

                <div>
                    <label className="block text-text-secondary mb-2">Full Description</label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full bg-bg-secondary border border-border-subtle rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent h-32"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-text-secondary mb-2">Genre *</label>
                        <input
                            type="text"
                            value={formData.genre}
                            onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                            className="w-full bg-bg-secondary border border-border-subtle rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-text-secondary mb-2">Language</label>
                        <select
                            value={formData.language}
                            onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                            className="w-full bg-bg-secondary border border-border-subtle rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent"
                        >
                            <option value="English">English</option>
                            <option value="Hindi">Hindi</option>
                            <option value="Tamil">Tamil</option>
                            <option value="Telugu">Telugu</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-text-secondary mb-2">Cover URL</label>
                    <input
                        type="url"
                        value={formData.cover_url}
                        onChange={(e) => setFormData({ ...formData, cover_url: e.target.value })}
                        className="w-full bg-bg-secondary border border-border-subtle rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent"
                    />
                </div>

                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="is_published"
                            checked={formData.is_published}
                            onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                            className="w-5 h-5"
                        />
                        <label htmlFor="is_published" className="text-white">Publish this book (make it visible to users)</label>
                    </div>

                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="is_premium"
                            checked={formData.is_premium}
                            onChange={(e) => setFormData({ ...formData, is_premium: e.target.checked })}
                            className="w-5 h-5"
                        />
                        <label htmlFor="is_premium" className="text-white">Premium book (requires subscription)</label>
                    </div>

                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="is_special"
                            checked={formData.is_special}
                            onChange={(e) => setFormData({ ...formData, is_special: e.target.checked })}
                            className="w-5 h-5"
                        />
                        <label htmlFor="is_special" className="text-white">Special series (requires individual purchase)</label>
                    </div>
                </div>

                {formData.is_special && (
                    <div>
                        <label className="block text-text-secondary mb-2">Price (₹)</label>
                        <input
                            type="number"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
                            className="w-full bg-bg-secondary border border-border-subtle rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent"
                        />
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 bg-accent text-white px-8 py-3 rounded-xl font-semibold hover:bg-accent/90 disabled:opacity-50 transition"
                >
                    <Save className="w-5 h-5" />
                    {loading ? 'Saving...' : 'Save Book'}
                </button>
            </form>
        </div>
    )
}

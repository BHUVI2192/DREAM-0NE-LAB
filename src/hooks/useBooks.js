import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function useBooks() {
    const [books, setBooks] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        loadBooks()
    }, [])

    const loadBooks = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('books')
                .select(`
                    *,
                    episodes:episodes(count)
                `)
                .order('created_at', { ascending: false })

            if (error) throw error

            const booksWithCount = data.map(book => ({
                ...book,
                total_episodes: book.episodes[0]?.count || 0
            }))

            setBooks(booksWithCount)
        } catch (err) {
            console.error('Failed to load books:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
                        // Filter books uploaded by admin and remove duplicates by title
                        const adminEmail = 'cnbhuvan011@gmail.com';
                        const uploadedBooks = data.filter(book => book.uploaded_by === adminEmail);
                        const uniqueBooks = [];
                        const seenTitles = new Set();
                        for (const book of uploadedBooks) {
                            if (!seenTitles.has(book.title)) {
                                uniqueBooks.push({
                                    ...book,
                                    total_episodes: book.episodes[0]?.count || 0
                                });
                                seenTitles.add(book.title);
                            }
                        }
                        setBooks(uniqueBooks);

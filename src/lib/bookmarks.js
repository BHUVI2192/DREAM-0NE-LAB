import { supabase } from './supabase'

/**
 * Toggle bookmark for a user and book
 */
export async function toggleBookmark(userId, bookId) {
    if (!userId || !bookId) return { success: false, error: 'Missing parameters' }

    // Check if it exists
    const { data: existing } = await supabase
        .from('bookmarks')
        .select('id')
        .eq('user_id', userId)
        .eq('book_id', bookId)
        .single()

    if (existing) {
        // Remove bookmark
        const { error } = await supabase
            .from('bookmarks')
            .delete()
            .eq('id', existing.id)
        if (error) return { success: false, error: error.message }
        return { success: true, bookmarked: false }
    } else {
        // Add bookmark
        const { error } = await supabase
            .from('bookmarks')
            .insert({ user_id: userId, book_id: bookId })
        if (error) return { success: false, error: error.message }
        return { success: true, bookmarked: true }
    }
}

/**
 * Check if book is bookmarked
 */
export async function checkIsBookmarked(userId, bookId) {
    if (!userId || !bookId) return false
    
    const { data } = await supabase
        .from('bookmarks')
        .select('id')
        .eq('user_id', userId)
        .eq('book_id', bookId)
        .single()

    return !!data
}

/**
 * Get all user bookmarks
 */
export async function getUserBookmarks(userId) {
    const { data, error } = await supabase
        .from('bookmarks')
        .select('book:books(*)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching bookmarks:', error)
        return []
    }

    return (data || []).map(row => row.book).filter(Boolean)
}

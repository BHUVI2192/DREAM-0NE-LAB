import { supabase } from './supabase'

export async function canAccessEpisode(userId, episodeId, bookId, isFree) {
    // Free episodes are accessible to everyone
    if (isFree) return true

    // If not logged in, can't access paid episodes
    if (!userId) return false

    try {
        // Check if user has purchased this book
        const { data, error } = await supabase
            .from('purchases')
            .select('id')
            .eq('user_id', userId)
            .eq('book_id', bookId)
            .eq('payment_status', 'success')
            .single()

        if (error && error.code !== 'PGRST116') {
            console.error('Error checking episode access:', error)
            return false
        }

        return !!data
    } catch (error) {
        console.error('Error checking episode access:', error)
        return false
    }
}

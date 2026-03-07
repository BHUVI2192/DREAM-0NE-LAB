import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import useAuth from './useAuth'

export default function useBookAccess(bookId) {
    const { user, profile } = useAuth()
    const [hasAccess, setHasAccess] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (user && bookId) {
            checkAccess()
        } else {
            setHasAccess(false)
            setLoading(false)
        }
    }, [user, bookId, profile])

    const checkAccess = async () => {
        try {
            const { data: book } = await supabase
                .from('books')
                .select('is_special')
                .eq('id', bookId)
                .single()

            if (!book) {
                setHasAccess(false)
                setLoading(false)
                return
            }

            if (book.is_special) {
                const { data: purchase } = await supabase
                    .from('purchases')
                    .select('id')
                    .eq('user_id', user.id)
                    .eq('book_id', bookId)
                    .eq('status', 'success')
                    .single()

                setHasAccess(!!purchase)
            } else {
                const hasSubscription = profile?.subscription_end && 
                    new Date(profile.subscription_end) > new Date()
                setHasAccess(!!hasSubscription)
            }
        } catch (error) {
            console.error('Failed to check access:', error)
            setHasAccess(false)
        } finally {
            setLoading(false)
        }
    }

    return { hasAccess, loading, refetch: checkAccess }
}

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
                .select('is_special, is_premium')
                .eq('id', bookId)
                .single()

            if (!book) {
                setHasAccess(false)
                setLoading(false)
                return
            }

            // Special books require purchase
            if (book.is_special) {
                const { data: purchase } = await supabase
                    .from('purchases')
                    .select('id')
                    .eq('user_id', user.id)
                    .eq('book_id', bookId)
                    .eq('payment_status', 'success')
                    .single()

                setHasAccess(!!purchase)
                setLoading(false)
                return
            }

            // Premium books require subscription or purchase
            if (book.is_premium) {
                const { data: purchase } = await supabase
                    .from('purchases')
                    .select('id')
                    .eq('user_id', user.id)
                    .eq('book_id', bookId)
                    .eq('payment_status', 'success')
                    .single()

                const hasSubscription = profile?.subscription_tier === 'premium' && 
                    profile?.subscription_expiry &&
                    new Date(profile.subscription_expiry) > new Date()

                setHasAccess(!!purchase || !!hasSubscription)
                setLoading(false)
                return
            }

            // Free books accessible to all
            setHasAccess(true)
            setLoading(false)
        } catch (error) {
            console.error('Failed to check access:', error)
            setHasAccess(false)
            setLoading(false)
        }
    }

    return { hasAccess, loading, refetch: checkAccess }
}

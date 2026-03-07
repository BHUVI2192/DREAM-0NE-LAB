import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import useAuth from './useAuth'

export default function useBookAccess(bookId) {
    const { user } = useAuth()
    const [hasPurchased, setHasPurchased] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (user && bookId) {
            checkAccess()
        } else {
            setHasPurchased(false)
            setIsLoading(false)
        }
    }, [user, bookId])

    const checkAccess = async () => {
        try {
            const { data, error } = await supabase
                .from('purchases')
                .select('id')
                .eq('user_id', user.id)
                .eq('book_id', bookId)
                .eq('payment_status', 'success')
                .single()

            if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
                console.error('Error checking book access:', error)
            }

            setHasPurchased(!!data)
            setIsLoading(false)
        } catch (error) {
            console.error('Failed to check access:', error)
            setHasPurchased(false)
            setIsLoading(false)
        }
    }

    return { hasPurchased, isLoading, refetch: checkAccess }
}

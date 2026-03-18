import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { fetchSuccessfulPurchases } from '../lib/purchases'
import { fetchActiveSubscription, isMissingSubscriptionsTableError } from '../lib/subscriptions'
import useAuth from './useAuth'

export default function useBookAccess(bookId) {
    const { user } = useAuth()
    const [hasPurchased, setHasPurchased] = useState(false)
    const [hasSubscription, setHasSubscription] = useState(false)
    const [isPremiumBook, setIsPremiumBook] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    const checkAccess = useCallback(async () => {
        try {
            const [{ data: purchase, error: purchaseError }, { data: book, error: bookError }] = await Promise.all([
                fetchSuccessfulPurchases({
                    select: 'id',
                    filters: [
                        { column: 'user_id', value: user.id },
                        { column: 'book_id', value: bookId },
                    ],
                    maybeSingle: true,
                }),
                supabase
                    .from('books')
                    .select('is_premium')
                    .eq('id', bookId)
                    .maybeSingle()
            ])

            let subscription = null
            let subscriptionError = null

            if (user?.id) {
                const response = await fetchActiveSubscription(user.id)

                subscription = response.data
                subscriptionError = response.error
            }

            const hasSchemaFallbackError = subscriptionError && !isMissingSubscriptionsTableError(subscriptionError)

            if (purchaseError || bookError || hasSchemaFallbackError) {
                console.error('Error checking book access:', purchaseError || bookError || subscriptionError)
            }

            setHasPurchased(!!purchase)
            setHasSubscription(!!subscription)
            setIsPremiumBook(!!book?.is_premium)
            setIsLoading(false)
        } catch (error) {
            console.error('Failed to check access:', error)
            setHasPurchased(false)
            setHasSubscription(false)
            setIsPremiumBook(false)
            setIsLoading(false)
        }
    }, [user, bookId])

    useEffect(() => {
        if (user && bookId) {
            checkAccess()
        } else {
            setHasPurchased(false)
            setHasSubscription(false)
            setIsPremiumBook(false)
            setIsLoading(false)
        }
    }, [user, bookId, checkAccess])

    const hasAccess = hasPurchased || !isPremiumBook || hasSubscription

    return {
        hasPurchased,
        hasSubscription,
        isPremiumBook,
        hasAccess,
        isLoading,
        refetch: checkAccess
    }
}

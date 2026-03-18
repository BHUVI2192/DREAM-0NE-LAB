import { supabase } from './supabase'

function readCachedValue(key) {
    if (typeof window === 'undefined') return null
    return window.localStorage.getItem(key)
}

function writeCachedValue(key, value) {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(key, value)
}

function orderedCandidates(cachedValue, defaults) {
    if (!cachedValue || !defaults.includes(cachedValue)) return defaults
    return [cachedValue, ...defaults.filter((item) => item !== cachedValue)]
}

const LIST_SELECT_CANDIDATES = [
    'id, amount, status, plan_type, created_at, starts_at, expires_at',
    'id, status, created_at, starts_at, expires_at',
    'id, status, starts_at, expires_at',
]

const ACTIVE_SELECT_CANDIDATES = [
    'id, status, expires_at',
    'id, status',
]

let resolvedListSelect = readCachedValue('dreamlab:subscriptions:list-select')
let resolvedActiveSelect = readCachedValue('dreamlab:subscriptions:active-select')
let resolvedRequiresExpiryFilter = readCachedValue('dreamlab:subscriptions:requires-expiry-filter')

export function isMissingSubscriptionsTableError(error) {
    if (!error) return false

    const combined = `${error.code || ''} ${error.message || ''}`.toLowerCase()
    return combined.includes('subscriptions') && (
        combined.includes('relation') ||
        combined.includes('does not exist') ||
        combined.includes('schema cache')
    )
}

export async function fetchActiveSubscription(userId) {
    if (!userId) return { data: null, error: null }

    const selectCandidates = orderedCandidates(resolvedActiveSelect, ACTIVE_SELECT_CANDIDATES)
    const filterCandidates = orderedCandidates(
        resolvedRequiresExpiryFilter,
        ['with_expiry', 'without_expiry']
    )

    let lastError = null

    for (const selectColumns of selectCandidates) {
        for (const filterMode of filterCandidates) {
            let query = supabase
                .from('subscriptions')
                .select(selectColumns)
                .eq('user_id', userId)
                .eq('status', 'active')

            if (filterMode === 'with_expiry') {
                query = query.gt('expires_at', new Date().toISOString())
            }

            const response = await query.maybeSingle()

            if (!response.error) {
                resolvedActiveSelect = selectColumns
                resolvedRequiresExpiryFilter = filterMode
                writeCachedValue('dreamlab:subscriptions:active-select', selectColumns)
                writeCachedValue('dreamlab:subscriptions:requires-expiry-filter', filterMode)

                return response
            }

            lastError = response.error
        }
    }

    return { data: null, error: lastError }
}

export async function fetchUserSubscriptions(userId) {
    if (!userId) return { data: [], error: null }

    const selectCandidates = orderedCandidates(resolvedListSelect, LIST_SELECT_CANDIDATES)
    let lastError = null

    for (const selectColumns of selectCandidates) {
        const response = await supabase
            .from('subscriptions')
            .select(selectColumns)
            .eq('user_id', userId)

        if (!response.error) {
            resolvedListSelect = selectColumns
            writeCachedValue('dreamlab:subscriptions:list-select', selectColumns)
            return {
                ...response,
                data: response.data || [],
            }
        }

        lastError = response.error
    }

    return {
        data: [],
        error: lastError,
    }
}

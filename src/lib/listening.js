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

const SELECT_VARIANTS = {
    rich: `
        *,
        episode:episodes(id, title, episode_number, book_id, duration_seconds, thumbnail_url, book:books(id, title, author, cover_url))
    `,
    basic: `
        *,
        episode:episodes(id, title, episode_number, book_id, duration_seconds, book:books(id, title, author, cover_url))
    `,
}

const ORDER_COLUMNS = ['updated_at', 'last_position_updated']

let resolvedSelectVariant = readCachedValue('dreamlab:listening:select-variant')
let resolvedOrderColumn = readCachedValue('dreamlab:listening:order-column')

export async function fetchUserListenProgress(userId, { limit = 20 } = {}) {
    const selectCandidates = orderedCandidates(resolvedSelectVariant, Object.keys(SELECT_VARIANTS))
    const orderCandidates = orderedCandidates(resolvedOrderColumn, ORDER_COLUMNS)
    let lastError = null

    for (const selectVariant of selectCandidates) {
        for (const orderColumn of orderCandidates) {
            const { data, error } = await supabase
                .from('listen_progress')
                .select(SELECT_VARIANTS[selectVariant])
                .eq('user_id', userId)
                .order(orderColumn, { ascending: false })
                .limit(limit)

            if (!error) {
                resolvedSelectVariant = selectVariant
                resolvedOrderColumn = orderColumn
                writeCachedValue('dreamlab:listening:select-variant', selectVariant)
                writeCachedValue('dreamlab:listening:order-column', orderColumn)

                return (data || []).map((item) => ({
                    ...item,
                    book: item.episode?.book || null,
                }))
            }

            lastError = error
        }
    }

    console.error('Error fetching listening progress:', lastError)
    return []
}

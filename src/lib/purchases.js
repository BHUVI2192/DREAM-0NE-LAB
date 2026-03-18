import { supabase } from './supabase'

const STATUS_COLUMNS = ['payment_status', 'status']
const ORDER_COLUMNS = ['created_at', 'purchased_at', null]

function readCachedValue(key) {
    if (typeof window === 'undefined') return null
    return window.localStorage.getItem(key)
}

function writeCachedValue(key, value) {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(key, value)
}

let resolvedStatusColumn = readCachedValue('dreamlab:purchases:status-column')
let resolvedWriteMode = readCachedValue('dreamlab:purchases:write-mode')
let resolvedOrderColumn = readCachedValue('dreamlab:purchases:order-column')

function orderedCandidates(cachedValue, defaults) {
    if (!cachedValue) return defaults
    return [cachedValue, ...defaults.filter(item => item !== cachedValue)]
}

function normalizePurchase(purchase) {
    if (!purchase) return purchase

    return {
        ...purchase,
        amount: purchase.amount ?? purchase.amount_inr ?? null,
        payment_status: purchase.payment_status ?? purchase.status ?? null,
    }
}

function applyPurchaseFilters(query, filters = []) {
    return filters.reduce((currentQuery, filter) => {
        if (filter.value === undefined) {
            return currentQuery
        }

        return currentQuery.eq(filter.column, filter.value)
    }, query)
}

export async function fetchSuccessfulPurchases({
    select = '*',
    filters = [],
    maybeSingle = false,
    orderByCreatedAt = false,
}) {
    const candidates = orderedCandidates(resolvedStatusColumn, STATUS_COLUMNS)
    const orderCandidates = orderByCreatedAt
        ? orderedCandidates(resolvedOrderColumn, ORDER_COLUMNS)
        : [null]
    let lastError = null

    for (const statusColumn of candidates) {
        for (const orderColumn of orderCandidates) {
            let query = supabase.from('purchases').select(select)
            query = applyPurchaseFilters(query, filters)
            query = query.eq(statusColumn, 'success')

            if (orderColumn) {
                query = query.order(orderColumn, { ascending: false })
            }

            const response = maybeSingle ? await query.maybeSingle() : await query

            if (!response.error) {
                resolvedStatusColumn = statusColumn
                writeCachedValue('dreamlab:purchases:status-column', statusColumn)

                if (orderByCreatedAt) {
                    resolvedOrderColumn = orderColumn
                    if (orderColumn) {
                        writeCachedValue('dreamlab:purchases:order-column', orderColumn)
                    }
                }

                return {
                    ...response,
                    data: maybeSingle
                        ? normalizePurchase(response.data)
                        : (response.data || []).map(normalizePurchase),
                }
            }

            lastError = response.error
        }
    }

    return {
        data: maybeSingle ? null : [],
        error: lastError,
    }
}

export async function createPurchase({
    userId,
    bookId = null,
    amount,
    paymentRef,
    purchaseType = 'book',
    isSpecial = false,
}) {
    const modernFullPayload = {
        user_id: userId,
        book_id: bookId,
        amount_inr: amount,
        payment_status: 'pending',
        payment_ref: paymentRef,
        is_special: isSpecial,
        purchase_type: purchaseType,
    }

    const modernBasicPayload = {
        user_id: userId,
        book_id: bookId,
        amount_inr: amount,
        payment_status: 'pending',
        payment_ref: paymentRef,
    }

    const legacyPayload = {
        user_id: userId,
        book_id: bookId,
        amount,
        status: 'pending',
        payment_ref: paymentRef,
    }

    const payloadByMode = {
        modern_full: modernFullPayload,
        modern_basic: modernBasicPayload,
        legacy: legacyPayload,
    }

    const candidates = orderedCandidates(resolvedWriteMode, ['modern_full', 'modern_basic', 'legacy'])
    let lastError = null

    for (const mode of candidates) {
        const payload = payloadByMode[mode]
        if (!payload) continue

        const response = await supabase.from('purchases').insert(payload).select().single()

        if (!response.error) {
            resolvedWriteMode = mode
            writeCachedValue('dreamlab:purchases:write-mode', mode)
            return {
                ...response,
                data: normalizePurchase(response.data),
            }
        }

        lastError = response.error
    }

    return { data: null, error: lastError }
}

export async function markPurchaseSuccess(purchaseId, purchasedAt = null) {
    const modernFullUpdate = { payment_status: 'success' }
    if (purchasedAt) {
        modernFullUpdate.purchased_at = purchasedAt
    }

    const modernBasicUpdate = { payment_status: 'success' }

    const payloadByMode = {
        modern_full: modernFullUpdate,
        modern_basic: modernBasicUpdate,
        legacy: { status: 'success' },
    }

    const candidates = orderedCandidates(resolvedWriteMode, ['modern_full', 'modern_basic', 'legacy'])
    let lastError = null

    for (const mode of candidates) {
        const payload = payloadByMode[mode]
        if (!payload) continue

        const response = await supabase.from('purchases').update(payload).eq('id', purchaseId)

        if (!response.error) {
            resolvedWriteMode = mode
            writeCachedValue('dreamlab:purchases:write-mode', mode)
            return response
        }

        lastError = response.error
    }

    return { error: lastError }
}
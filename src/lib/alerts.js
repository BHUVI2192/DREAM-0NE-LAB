export const ALERT_TYPE_STYLES = {
    info: 'border-sky-400/30 bg-sky-500/10 text-sky-100',
    success: 'border-emerald-400/30 bg-emerald-500/10 text-emerald-100',
    warning: 'border-amber-400/30 bg-amber-500/10 text-amber-100',
    error: 'border-rose-400/30 bg-rose-500/10 text-rose-100',
}

export function normalizeAlertAudience(alert) {
    if (!alert || !alert.audience) return 'all'
    if (['all', 'premium', 'free'].includes(alert.audience)) return alert.audience
    return 'all'
}

export function shouldShowAlertForUser(alert, { hasSubscription = false } = {}) {
    const audience = normalizeAlertAudience(alert)

    if (audience === 'premium') return hasSubscription
    if (audience === 'free') return !hasSubscription
    return true
}

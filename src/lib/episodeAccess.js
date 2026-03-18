export function canAccessEpisode(episode, access = {}) {
    if (!episode) return false
    if (episode.is_free) return true

    const { hasPurchased = false, hasAccess = false } = access
    return !!(hasPurchased || hasAccess)
}

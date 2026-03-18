import { supabase } from './supabase'

function readCachedDownloadsMode() {
    if (typeof window === 'undefined') return null
    return window.localStorage.getItem('dreamlab:downloads:query-mode')
}

function writeCachedDownloadsMode(mode) {
    if (typeof window === 'undefined') return
    window.localStorage.setItem('dreamlab:downloads:query-mode', mode)
}

let resolvedDownloadsMode = readCachedDownloadsMode()

/**
 * Download an episode audio file
 * @param {string} episodeId - Episode ID
 * @param {string} bookId - Book ID
 * @param {string} audioUrl - Audio file URL
 * @param {string} episodeTitle - Episode title for filename
 * @param {Function} onProgress - Progress callback (0-100)
 */
export async function downloadEpisode(episodeId, bookId, audioUrl, episodeTitle, onProgress) {
    try {
        // Track download in database
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        // Fetch the audio file with progress tracking
        const response = await fetch(audioUrl)
        if (!response.ok) throw new Error('Download failed')

        const contentLength = response.headers.get('content-length')
        const total = parseInt(contentLength, 10)
        let loaded = 0

        const reader = response.body.getReader()
        const chunks = []

        while (true) {
            const { done, value } = await reader.read()
            if (done) break

            chunks.push(value)
            loaded += value.length

            if (onProgress && total) {
                onProgress(Math.round((loaded / total) * 100))
            }
        }

        // Create blob from chunks
        const blob = new Blob(chunks, { type: 'audio/mpeg' })
        const url = URL.createObjectURL(blob)

        // Create download link
        const a = document.createElement('a')
        a.href = url
        a.download = `${episodeTitle.replace(/[^a-z0-9]/gi, '_')}.mp3`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        // Record download in database
        await supabase.from('downloads').insert({
            user_id: user.id,
            episode_id: episodeId,
            book_id: bookId,
            file_size: blob.size
        })

        return { success: true }
    } catch (error) {
        console.error('Download failed:', error)
        return { success: false, error: error.message }
    }
}

/**
 * Get user's downloads
 * @param {string} userId - User ID
 */
export async function getUserDownloads(userId) {
    const tryPrimary = async () => supabase
        .from('downloads')
        .select(`
            *,
            episode:episodes(id, title, episode_number, duration_seconds, thumbnail_url),
            book:books(id, title, author, cover_url)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

    const tryFallback = async () => supabase
        .from('downloads')
        .select(`
            id,
            user_id,
            episode_id,
            file_size,
            downloaded_at,
            episode:episodes(id, title, episode_number, duration_seconds, thumbnail_url, book:books(id, title, author, cover_url))
        `)
        .eq('user_id', userId)
        .order('downloaded_at', { ascending: false })

    const response = resolvedDownloadsMode === 'fallback'
        ? await tryFallback()
        : await tryPrimary()

    let rows = response.data
    let queryError = response.error

    if (!queryError) {
        resolvedDownloadsMode = resolvedDownloadsMode || 'primary'
        writeCachedDownloadsMode(resolvedDownloadsMode)
    }

    // Backward-compatible fallback: some schemas use downloaded_at and no direct book relation on downloads.
    if (queryError && resolvedDownloadsMode !== 'fallback') {
        const fallback = await tryFallback()

        if (!fallback.error) {
            resolvedDownloadsMode = 'fallback'
            writeCachedDownloadsMode('fallback')
        }

        rows = fallback.data
        queryError = fallback.error
    }

    if (queryError) {
        console.error('Error fetching downloads:', queryError)
        return []
    }

    return (rows || []).map((row) => ({
        ...row,
        book: row.book || row.episode?.book || null,
        created_at: row.created_at || row.downloaded_at || null,
    }))
}

/**
 * Delete a download record
 * @param {string} downloadId - Download ID
 */
export async function deleteDownload(downloadId) {
    const { error } = await supabase
        .from('downloads')
        .delete()
        .eq('id', downloadId)

    if (error) {
        console.error('Error deleting download:', error)
        return { success: false, error: error.message }
    }

    return { success: true }
}

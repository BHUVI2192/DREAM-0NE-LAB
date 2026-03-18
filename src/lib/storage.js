import { supabase } from './supabase'

/**
 * Upload file to Supabase Storage
 * @param {File} file - File to upload
 * @param {string} bucket - Storage bucket name ('covers' or 'audio')
 * @param {string} folder - Optional folder path
 * @returns {Promise<{url: string, path: string}>}
 */
export async function uploadFile(file, bucket, folder = '') {
    try {
        // Generate unique filename
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
        const filePath = folder ? `${folder}/${fileName}` : fileName

        // Upload file
        const { error } = await supabase.storage
            .from(bucket)
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            })

        if (error) throw error

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from(bucket)
            .getPublicUrl(filePath)

        return {
            url: publicUrl,
            path: filePath
        }
    } catch (error) {
        console.error('Upload error:', error)
        throw error
    }
}

/**
 * Upload book cover image
 * @param {File} file - Image file
 * @returns {Promise<{url: string, path: string}>}
 */
export async function uploadBookCover(file) {
    return uploadFile(file, 'covers', 'books')
}

/**
 * Upload episode thumbnail image
 * @param {File} file - Image file
 * @param {string} bookId - Book ID for organization
 * @returns {Promise<{url: string, path: string}>}
 */
export async function uploadEpisodeThumbnail(file, bookId) {
    return uploadFile(file, 'covers', `episodes/book_${bookId}`)
}

/**
 * Upload episode audio file
 * @param {File} file - Audio file
 * @param {string} bookId - Book ID for organization
 * @returns {Promise<{url: string, path: string}>}
 */
export async function uploadEpisodeAudio(file, bookId) {
    return uploadFile(file, 'audio', `book_${bookId}`)
}

/**
 * Delete file from storage
 * @param {string} bucket - Storage bucket name
 * @param {string} path - File path
 */
export async function deleteFile(bucket, path) {
    try {
        const { error } = await supabase.storage
            .from(bucket)
            .remove([path])

        if (error) throw error
        return { success: true }
    } catch (error) {
        console.error('Delete error:', error)
        return { success: false, error }
    }
}

/**
 * Get file size and validate
 * @param {File} file
 * @param {number} maxSizeMB - Maximum size in MB
 * @returns {boolean}
 */
export function validateFileSize(file, maxSizeMB = 100) {
    const maxSize = maxSizeMB * 1024 * 1024 // Convert to bytes
    return file.size <= maxSize
}

/**
 * Validate file type
 * @param {File} file
 * @param {string[]} allowedTypes - Array of MIME types
 * @returns {boolean}
 */
export function validateFileType(file, allowedTypes) {
    return allowedTypes.includes(file.type)
}

/**
 * Format file size for display
 * @param {number} bytes
 * @returns {string}
 */
export function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Create storage buckets if they don't exist
 * Note: Run this once during setup
 */
export async function initializeStorageBuckets() {
    try {
        // Create covers bucket
        await supabase.storage.createBucket('covers', {
            public: true,
            fileSizeLimit: 5242880 // 5MB
        })

        // Create audio bucket
        await supabase.storage.createBucket('audio', {
            public: true,
            fileSizeLimit: 524288000 // 500MB
        })

        console.log('Storage buckets initialized')
    } catch (error) {
        // Buckets may already exist
        console.log('Storage initialization:', error.message)
    }
}

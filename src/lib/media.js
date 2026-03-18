export function getEpisodeArtwork(episode, book) {
    return episode?.thumbnail_url || book?.cover_url || '/placeholder.jpg'
}
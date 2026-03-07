export default function GenrePill({ genre, isActive, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition whitespace-nowrap ${
                isActive
                    ? 'bg-accent text-white'
                    : 'bg-bg-secondary text-text-secondary hover:text-white'
            }`}
        >
            {genre}
        </button>
    )
}

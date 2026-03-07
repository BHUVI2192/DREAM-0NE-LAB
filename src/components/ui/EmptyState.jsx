export default function EmptyState({ icon: Icon, message }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            {Icon && <Icon className="w-16 h-16 text-text-muted/30 mb-4" />}
            <p className="text-text-muted">{message}</p>
        </div>
    )
}

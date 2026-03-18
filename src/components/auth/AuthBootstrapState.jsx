function retryAuthBootstrap() {
    window.dispatchEvent(new Event('dreamlab:retry-auth-bootstrap'))
}

export default function AuthBootstrapState({
    title,
    message,
    actionLabel = 'Retry',
}) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-bg-primary px-4">
            <div className="w-full max-w-md rounded-3xl border border-border-subtle bg-bg-elevated p-8 text-center shadow-2xl">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/15 text-2xl text-amber-300">
                    !
                </div>
                <h1 className="mb-3 text-2xl font-bold text-white">{title}</h1>
                <p className="mb-6 text-sm leading-6 text-text-secondary">{message}</p>
                <button
                    type="button"
                    onClick={retryAuthBootstrap}
                    className="w-full rounded-xl bg-accent px-4 py-3 font-semibold text-white transition-colors hover:bg-accent-light"
                >
                    {actionLabel}
                </button>
            </div>
        </div>
    )
}
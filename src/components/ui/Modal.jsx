import { X } from 'lucide-react'

export default function Modal({
    isOpen,
    onClose,
    children,
    title,
    panelClassName = 'max-w-md',
    bodyClassName = '',
}) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className={`relative w-full overflow-hidden rounded-2xl border border-white/10 bg-[#121212] shadow-xl ${panelClassName}`}>
                {title && (
                    <div className="flex items-center justify-between border-b border-white/10 px-4 py-4 sm:px-6 sm:py-5">
                        <h2 className="text-lg font-bold text-white sm:text-xl">{title}</h2>
                        <button
                            onClick={onClose}
                            className="p-2 text-white/40 hover:text-white transition rounded-lg hover:bg-white/5"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                )}
                <div className={bodyClassName || (title ? 'p-4 sm:p-6' : '')}>{children}</div>
            </div>
        </div>
    )
}

import { X } from 'lucide-react'

export default function Modal({ isOpen, onClose, children, title }) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className="relative w-full max-w-md bg-bg-elevated border border-border-subtle rounded-2xl shadow-xl">
                <div className="flex items-center justify-between p-6 border-b border-border-subtle">
                    <h2 className="font-display text-xl font-bold text-white">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-text-muted hover:text-white transition rounded-lg hover:bg-bg-secondary"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-6">{children}</div>
            </div>
        </div>
    )
}

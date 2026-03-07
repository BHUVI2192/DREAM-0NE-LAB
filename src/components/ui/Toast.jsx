import { useEffect, useState } from 'react'
import { CheckCircle2, XCircle, Info } from 'lucide-react'

export default function Toast({ message, type = 'info', duration = 3000, onClose }) {
    const [isVisible, setIsVisible] = useState(true)

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false)
            setTimeout(onClose, 300)
        }, duration)

        return () => clearTimeout(timer)
    }, [duration, onClose])

    const icons = {
        success: <CheckCircle2 className="w-5 h-5 text-green-400" />,
        error: <XCircle className="w-5 h-5 text-red-400" />,
        info: <Info className="w-5 h-5 text-blue-400" />
    }

    const colors = {
        success: 'bg-green-500/20 border-green-500/30',
        error: 'bg-red-500/20 border-red-500/30',
        info: 'bg-blue-500/20 border-blue-500/30'
    }

    return (
        <div
            className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
        >
            <div className={`flex items-center gap-3 px-6 py-4 rounded-xl border backdrop-blur-sm ${colors[type]}`}>
                {icons[type]}
                <span className="text-white font-medium">{message}</span>
            </div>
        </div>
    )
}

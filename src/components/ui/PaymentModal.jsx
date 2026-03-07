import { useState, useEffect } from 'react'
import { X, CheckCircle2, ShieldCheck, Lock } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import useAuth from '../../hooks/useAuth'

function usePhonePeScript() {
    const [loaded, setLoaded] = useState(false)
    useEffect(() => {
        if (window.PhonePe) { setLoaded(true); return }
        const script = document.createElement('script')
        script.src = 'https://mercury-t2.phonepe.com/transact/js/phonepe.js'
        script.onload = () => setLoaded(true)
        script.onerror = () => console.error('Failed to load PhonePe script')
        document.body.appendChild(script)
        return () => { document.body.removeChild(script) }
    }, [])
    return loaded
}

export default function PaymentModal({ bookId, isSpecial, price, isOpen, onClose, onSuccess }) {
    const { user } = useAuth()
    const phonepeReady = usePhonePeScript()
    const [isProcessing, setIsProcessing] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [error, setError] = useState(null)

    if (!isOpen) return null

    const amount = isSpecial ? (price || 49) : 79

    const handlePayment = async () => {
        if (!user || !phonepeReady) {
            setError('Payment system not ready. Please try again in a moment.')
            return
        }

        setIsProcessing(true)
        setError(null)

        try {
            const { data: sessionData } = await supabase.auth.getSession()
            const token = sessionData?.session?.access_token

            const response = await fetch(
                `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-phonepe-order`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
                    },
                    body: JSON.stringify({
                        userId: user.id,
                        bookId: isSpecial ? bookId : null,
                        isSpecial: !!isSpecial
                    })
                }
            )

            const orderData = await response.json()

            if (!response.ok || orderData.error) {
                throw new Error(orderData.error || 'Could not create payment order.')
            }

            if (orderData.redirectUrl) {
                localStorage.setItem('pending_transaction', JSON.stringify({
                    transactionId: orderData.transactionId,
                    bookId: isSpecial ? bookId : null,
                    isSpecial: !!isSpecial,
                    amount
                }))
                
                window.location.href = orderData.redirectUrl
            } else {
                throw new Error('Failed to get payment redirect URL')
            }

        } catch (err) {
            console.error('Payment initiation failed:', err)
            setError(err.message || 'Failed to initiate payment. Please try again.')
            setIsProcessing(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-[#0A0A0F]/80 backdrop-blur-sm"
                onClick={() => !isProcessing && onClose()}
            />

            <div className="relative w-full max-w-md bg-bg-elevated border border-border-subtle rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden animate-fade-up">

                {!isProcessing && !isSuccess && (
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 text-text-muted hover:text-white bg-bg-secondary rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}

                {isSuccess ? (
                    <div className="p-10 text-center flex flex-col items-center justify-center min-h-[400px]">
                        <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-6">
                            <CheckCircle2 className="w-10 h-10 text-green-400" />
                        </div>
                        <h2 className="font-display text-2xl font-bold text-white mb-2">
                            🎉 Payment Successful!
                        </h2>
                        <p className="text-text-secondary">
                            {isSpecial ? 'This book is now fully unlocked.' : 'Your subscription is now active!'}
                        </p>
                    </div>
                ) : (
                    <div className="p-8">
                        <div className="text-center mb-8">
                            <h2 className="font-display text-2xl font-bold text-white mb-2">
                                {isSpecial ? 'Unlock Special Series' : 'Start Your Subscription'}
                            </h2>
                            <p className="text-text-secondary text-sm">
                                {isSpecial
                                    ? 'Get permanent access to this premium series.'
                                    : 'Unlimited access to all standard stories for 30 days.'}
                            </p>

                            <div className="mt-6 mb-2">
                                <span className="font-display text-5xl font-bold text-accent">
                                    ₹{amount}
                                </span>
                            </div>
                            <p className="text-text-muted text-xs uppercase tracking-wider font-semibold">
                                {isSpecial ? 'One-time • Permanent Access' : 'Monthly • Cancel anytime'}
                            </p>
                        </div>

                        <div className="bg-bg-secondary border border-border-subtle rounded-2xl p-4 mb-6 space-y-2">
                            {isSpecial ? (
                                <>
                                    <div className="flex items-center gap-2 text-sm text-text-secondary"><CheckCircle2 className="w-4 h-4 text-accent shrink-0" /> Permanent access to all episodes</div>
                                    <div className="flex items-center gap-2 text-sm text-text-secondary"><CheckCircle2 className="w-4 h-4 text-accent shrink-0" /> Listen offline anytime</div>
                                    <div className="flex items-center gap-2 text-sm text-text-secondary"><CheckCircle2 className="w-4 h-4 text-accent shrink-0" /> One-time payment, no subscriptions</div>
                                </>
                            ) : (
                                <>
                                    <div className="flex items-center gap-2 text-sm text-text-secondary"><CheckCircle2 className="w-4 h-4 text-accent shrink-0" /> Unlimited access to all standard books</div>
                                    <div className="flex items-center gap-2 text-sm text-text-secondary"><CheckCircle2 className="w-4 h-4 text-accent shrink-0" /> New titles added monthly</div>
                                    <div className="flex items-center gap-2 text-sm text-text-secondary"><CheckCircle2 className="w-4 h-4 text-accent shrink-0" /> Cancel anytime before renewal</div>
                                </>
                            )}
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
                                {error}
                            </div>
                        )}

                        <button
                            onClick={handlePayment}
                            disabled={isProcessing || !phonepeReady}
                            className="w-full bg-accent text-white py-4 rounded-xl font-bold text-base hover:bg-accent/90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-lg shadow-accent/20"
                        >
                            {isProcessing
                                ? 'Redirecting to PhonePe...'
                                : !phonepeReady
                                    ? 'Loading...'
                                    : `Pay ₹${amount} with PhonePe`}
                        </button>

                        <div className="flex items-center justify-center gap-2 mt-4 text-text-muted text-xs">
                            <Lock className="w-3 h-3" />
                            <span>Secured by PhonePe</span>
                            <ShieldCheck className="w-3 h-3" />
                            <span>Bank-grade Security</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

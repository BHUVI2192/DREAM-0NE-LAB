import { useState } from 'react'
import { X, CheckCircle2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import useAuth from '../../hooks/useAuth'
import Modal from './Modal'

export default function PaymentModal({ bookId, isOpen, onClose, onSuccess }) {
    const { user } = useAuth()
    const [tab, setTab] = useState('upi') // 'upi' or 'card'
    const [isProcessing, setIsProcessing] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [error, setError] = useState(null)
    
    // Form states
    const [upiId, setUpiId] = useState('')
    const [cardNumber, setCardNumber] = useState('')
    const [expiry, setExpiry] = useState('')
    const [cvv, setCvv] = useState('')

    const price = 49

    const handlePayment = async () => {
        if (!user) {
            setError('Please sign in to make a purchase')
            return
        }

        // Basic validation
        if (tab === 'upi' && !upiId.includes('@')) {
            setError('Please enter a valid UPI ID')
            return
        }

        if (tab === 'card') {
            if (!cardNumber || cardNumber.length < 16) {
                setError('Please enter a valid card number')
                return
            }
            if (!expiry || !cvv) {
                setError('Please fill in all card details')
                return
            }
        }

        setIsProcessing(true)
        setError(null)

        try {
            // Step 1: Create purchases row with pending status
            const { data: purchase, error: purchaseError } = await supabase
                .from('purchases')
                .insert({
                    user_id: user.id,
                    book_id: bookId,
                    amount_inr: price,
                    payment_status: 'pending',
                    payment_ref: `DL${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
                    is_special: false
                })
                .select()
                .single()

            if (purchaseError) throw purchaseError

            // Step 2: Simulate payment processing (2 seconds)
            await new Promise(resolve => setTimeout(resolve, 2000))

            // Step 3: Update purchase to success
            const { error: updateError } = await supabase
                .from('purchases')
                .update({ payment_status: 'success' })
                .eq('id', purchase.id)

            if (updateError) throw updateError

            // Step 4: Show success state
            setIsSuccess(true)

            // Step 5: Close modal and trigger callback after 1.5s
            setTimeout(() => {
                onSuccess?.()
                onClose()
                setIsSuccess(false)
                setIsProcessing(false)
            }, 1500)

        } catch (err) {
            console.error('Payment failed:', err)
            setError(err.message || 'Payment failed. Please try again.')
            setIsProcessing(false)
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="w-full max-w-md bg-bg-elevated border border-border-subtle rounded-card p-8 relative">
                {/* Close button */}
                <button
                    onClick={onClose}
                    disabled={isProcessing}
                    className="absolute top-4 right-4 p-2 text-text-muted hover:text-white transition-colors disabled:opacity-50"
                >
                    <X className="w-5 h-5" />
                </button>

                {isSuccess ? (
                    /* Success State */
                    <div className="text-center py-8">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 mb-4 animate-bounce">
                            <CheckCircle2 className="w-12 h-12 text-green-500" />
                        </div>
                        <h2 className="font-display text-2xl text-white mb-2">🎉 All episodes unlocked!</h2>
                        <p className="text-text-secondary">You can now listen to all 6 episodes</p>
                    </div>
                ) : (
                    /* Payment Form */
                    <>
                        <h2 className="font-display text-2xl text-white mb-2">Unlock the full story</h2>
                        <p className="text-text-secondary text-sm mb-6">
                            You've heard the beginning. Unlock all 4 remaining episodes.
                        </p>

                        {/* Price Display */}
                        <div className="text-center mb-6">
                            <div className="font-display text-5xl text-accent mb-1">₹{price}</div>
                            <div className="text-xs text-text-muted">One-time · This book only</div>
                        </div>

                        {/* Tab Buttons */}
                        <div className="flex gap-2 mb-6">
                            <button
                                onClick={() => setTab('upi')}
                                className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                                    tab === 'upi'
                                        ? 'bg-accent text-white'
                                        : 'bg-bg-secondary text-text-secondary hover:text-white'
                                }`}
                            >
                                UPI
                            </button>
                            <button
                                onClick={() => setTab('card')}
                                className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                                    tab === 'card'
                                        ? 'bg-accent text-white'
                                        : 'bg-bg-secondary text-text-secondary hover:text-white'
                                }`}
                            >
                                Card
                            </button>
                        </div>

                        {/* UPI Tab */}
                        {tab === 'upi' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-text-secondary text-sm mb-2">Enter UPI ID</label>
                                    <input
                                        type="text"
                                        value={upiId}
                                        onChange={(e) => setUpiId(e.target.value)}
                                        placeholder="yourname@upi"
                                        className="w-full bg-bg-secondary px-4 py-3 rounded-xl border border-border-subtle text-white focus:outline-none focus:border-accent"
                                        disabled={isProcessing}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Card Tab */}
                        {tab === 'card' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-text-secondary text-sm mb-2">Card Number</label>
                                    <input
                                        type="text"
                                        value={cardNumber}
                                        onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
                                        placeholder="1234 5678 9012 3456"
                                        className="w-full bg-bg-secondary px-4 py-3 rounded-xl border border-border-subtle text-white focus:outline-none focus:border-accent"
                                        disabled={isProcessing}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-text-secondary text-sm mb-2">Expiry</label>
                                        <input
                                            type="text"
                                            value={expiry}
                                            onChange={(e) => setExpiry(e.target.value)}
                                            placeholder="MM/YY"
                                            maxLength={5}
                                            className="w-full bg-bg-secondary px-4 py-3 rounded-xl border border-border-subtle text-white focus:outline-none focus:border-accent"
                                            disabled={isProcessing}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-text-secondary text-sm mb-2">CVV</label>
                                        <input
                                            type="text"
                                            value={cvv}
                                            onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                                            placeholder="123"
                                            maxLength={3}
                                            className="w-full bg-bg-secondary px-4 py-3 rounded-xl border border-border-subtle text-white focus:outline-none focus:border-accent"
                                            disabled={isProcessing}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Error Display */}
                        {error && (
                            <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        {/* Pay Button */}
                        <button
                            onClick={handlePayment}
                            disabled={isProcessing}
                            className="w-full mt-6 bg-accent text-white py-4 rounded-xl font-bold hover:bg-accent/90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                        >
                            {isProcessing ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                `Pay ₹${price}`
                            )}
                        </button>

                        {/* Maybe Later Button */}
                        <button
                            onClick={onClose}
                            disabled={isProcessing}
                            className="w-full mt-3 text-text-secondary hover:text-white py-2 transition-colors disabled:opacity-50"
                        >
                            Maybe later
                        </button>
                    </>
                )}
            </div>
        </Modal>
    )
}

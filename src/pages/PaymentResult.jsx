import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'

export default function PaymentResult() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const [status, setStatus] = useState('loading') // loading, success, failed
    const [transactionData, setTransactionData] = useState(null)

    useEffect(() => {
        const urlStatus = searchParams.get('status')
        const pendingTransaction = localStorage.getItem('pending_transaction')

        if (urlStatus === 'success') {
            setStatus('success')
            if (pendingTransaction) {
                try {
                    setTransactionData(JSON.parse(pendingTransaction))
                } catch (e) {
                    console.error('Failed to parse transaction data:', e)
                }
            }
            localStorage.removeItem('pending_transaction')
        } else if (urlStatus === 'failure') {
            setStatus('failed')
            localStorage.removeItem('pending_transaction')
        } else {
            setStatus('failed')
        }
    }, [searchParams])

    const handleContinue = () => {
        if (status === 'success' && transactionData?.bookId) {
            navigate(`/book/${transactionData.bookId}`)
        } else {
            navigate('/library')
        }
    }

    return (
        <div className="min-h-screen bg-bg-primary flex items-center justify-center p-6">
            <div className="w-full max-w-md">
                {status === 'loading' && (
                    <div className="text-center">
                        <Loader2 className="w-16 h-16 text-accent mx-auto mb-6 animate-spin" />
                        <h1 className="font-display text-2xl font-bold text-white mb-2">
                            Processing Your Payment...
                        </h1>
                        <p className="text-text-secondary">This may take a few moments</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="bg-bg-elevated border border-border-subtle rounded-3xl p-10 text-center">
                        <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="w-10 h-10 text-green-400" />
                        </div>

                        <h1 className="font-display text-3xl font-bold text-white mb-3">
                            Payment Successful! 🎉
                        </h1>

                        <p className="text-text-secondary mb-8">
                            {transactionData?.isSpecial
                                ? 'This special series is now unlocked and ready to enjoy.'
                                : 'Your subscription is now active. Start listening to unlimited stories!'}
                        </p>

                        {transactionData && (
                            <div className="bg-bg-secondary border border-border-subtle rounded-xl p-4 mb-8 text-left space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-text-muted">Transaction ID</span>
                                    <span className="text-white font-mono text-xs">
                                        {transactionData.transactionId?.slice(0, 16)}...
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-text-muted">Amount Paid</span>
                                    <span className="text-white font-bold">₹{transactionData.amount}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-text-muted">Type</span>
                                    <span className="text-white">
                                        {transactionData.isSpecial ? 'Special Series' : 'Monthly Subscription'}
                                    </span>
                                </div>
                            </div>
                        )}

                        <button
                            onClick={handleContinue}
                            className="w-full bg-accent text-white py-4 rounded-xl font-bold text-base hover:bg-accent/90 active:scale-[0.98] transition-all shadow-lg shadow-accent/20"
                        >
                            {transactionData?.isSpecial ? 'Start Listening' : 'Explore Library'}
                        </button>
                    </div>
                )}

                {status === 'failed' && (
                    <div className="bg-bg-elevated border border-border-subtle rounded-3xl p-10 text-center">
                        <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
                            <XCircle className="w-10 h-10 text-red-400" />
                        </div>

                        <h1 className="font-display text-3xl font-bold text-white mb-3">
                            Payment Failed
                        </h1>

                        <p className="text-text-secondary mb-8">
                            Your payment could not be processed. No charges were made to your account.
                        </p>

                        <div className="space-y-3">
                            <button
                                onClick={() => navigate(-1)}
                                className="w-full bg-accent text-white py-4 rounded-xl font-bold text-base hover:bg-accent/90 active:scale-[0.98] transition-all shadow-lg shadow-accent/20"
                            >
                                Try Again
                            </button>
                            <button
                                onClick={() => navigate('/library')}
                                className="w-full bg-bg-secondary text-white py-4 rounded-xl font-bold text-base hover:bg-bg-secondary/80 active:scale-[0.98] transition-all border border-border-subtle"
                            >
                                Back to Library
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

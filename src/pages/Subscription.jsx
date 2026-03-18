import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { createPurchase, markPurchaseSuccess } from '../lib/purchases'
import useAuth from '../hooks/useAuth'
import { Crown, CheckCircle, X, Zap, Shield, Download, Headphones } from 'lucide-react'

export default function Subscription() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [selectedPlan, setSelectedPlan] = useState('monthly')

    const plans = {
        monthly: {
            name: 'Monthly Premium',
            price: 49,
            billingCycle: 'per month',
            savings: null
        },
        yearly: {
            name: 'Yearly Premium',
            price: 499,
            billingCycle: 'per year',
            savings: 'Save ₹89'
        }
    }

    const features = [
        {icon: <Crown className="w-5 h-5" />, text: 'Unlimited access to all regular audiobooks'},
        { icon: <Download className="w-5 h-5" />, text: 'Download for offline listening'},
        {icon: <Headphones className="w-5 h-5" />, text: 'Ad-free listening experience'},
        {icon: <Zap className="w-5 h-5" />, text: 'Early access to new releases'},
        {icon: <Shield className="w-5 h-5" />, text: 'Cancel anytime, no commitment'}
    ]

    const handleSubscribe = async () => {
        if (!user) {
            navigate('/login')
            return
        }

        setLoading(true)
        try {
            const plan = plans[selectedPlan]
            
            // Create subscription purchase
            const { data: purchase, error } = await createPurchase({
                userId: user.id,
                amount: plan.price,
                paymentRef: `SUB_${Date.now()}`,
                purchaseType: 'subscription',
            })

            if (error) throw error

            // For now, simulate successful payment
            // In production, integrate with payment gateway
            await simulatePayment(purchase.id, selectedPlan)
            
        } catch (error) {
            console.error('Subscription error:', error)
            alert('Failed to process subscription. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const simulatePayment = async (purchaseId, planType) => {
        // Simulate 2-second payment processing
        await new Promise(resolve => setTimeout(resolve, 2000))

        // Calculate expiry date
        const expiryDate = new Date()
        if (planType === 'monthly') {
            expiryDate.setMonth(expiryDate.getMonth() + 1)
        } else {
            expiryDate.setFullYear(expiryDate.getFullYear() + 1)
        }

        // Create subscription record
        const { error: subError } = await supabase
            .from('subscriptions')
            .insert({
                user_id: user.id,
                plan_type: planType,
                amount: plans[planType].price,
                status: 'active',
                starts_at: new Date().toISOString(),
                expires_at: expiryDate.toISOString()
            })

        if (subError) throw subError

        // Update purchase status
        const { error: purchaseUpdateError } = await markPurchaseSuccess(purchaseId, new Date().toISOString())

        if (purchaseUpdateError) throw purchaseUpdateError

        // Update profile
        await supabase
            .from('profiles')
            .update({
                subscription_tier: 'premium',
                subscription_expiry: expiryDate.toISOString()
            })
            .eq('id', user.id)

        alert('Subscription activated successfully!')
        navigate('/home')
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-bg-primary via-bg-primary to-accent/5 py-6 pb-32">
            <div className="container max-w-4xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-6">
                    <button
                        onClick={() => navigate('/home')}
                        className="inline-flex items-center gap-2 text-text-secondary hover:text-white mb-4"
                    >
                        <X size={18} />
                        <span className="text-sm">Back to Home</span>
                    </button>
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <Crown className="w-8 h-8 text-yellow-400" />
                        <h1 className="text-2xl md:text-3xl font-bold text-white">Dream One Lab Premium</h1>
                    </div>
                    <p className="text-base text-text-secondary">Unlock unlimited audiobooks for one low price</p>
                </div>

                {/* Plan Selector */}
                <div className="max-w-2xl mx-auto mb-6">
                    <div className="grid grid-cols-2 gap-3">
                        {Object.entries(plans).map(([key, plan]) => (
                            <button
                                key={key}
                                onClick={() => setSelectedPlan(key)}
                                className={`relative p-4 rounded-xl border-2 transition-all ${
                                    selectedPlan === key
                                        ? 'border-accent bg-accent/10'
                                        : 'border-border-subtle bg-bg-elevated hover:border-accent/50'
                                }`}
                            >
                                {plan.savings && (
                                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-green-500 text-white text-2xs font-bold px-2 py-0.5 rounded-full">
                                        {plan.savings}
                                    </div>
                                )}
                                <div className="text-center">
                                    <h3 className="text-base font-bold text-white mb-1">{plan.name}</h3>
                                    <div className="flex items-baseline justify-center gap-1">
                                        <span className="text-2xl font-bold text-accent">₹{plan.price}</span>
                                        <span className="text-text-secondary text-xs">{plan.billingCycle}</span>
                                    </div>
                                </div>
                                {selectedPlan === key && (
                                    <div className="absolute top-3 right-3">
                                        <CheckCircle className="w-5 h-5 text-accent" />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Features */}
                <div className="max-w-2xl mx-auto mb-6">
                    <div className="bg-bg-elevated/50 backdrop-blur-sm rounded-2xl border border-border-subtle p-5">
                        <h2 className="text-xl font-bold text-white mb-4 text-center">What's Included</h2>
                        <div className="space-y-3">
                            {features.map((feature, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                                        {feature.icon}
                                    </div>
                                    <p className="text-white text-sm">{feature.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* CTA */}
                <div className="max-w-2xl mx-auto text-center">
                    <button
                        onClick={handleSubscribe}
                        disabled={loading}
                        className="w-full px-6 py-4 bg-gradient-to-r from-accent to-accent-light text-white font-bold text-base rounded-xl hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Processing...' : `Subscribe for ₹${plans[selectedPlan].price}`}
                    </button>
                    <p className="text-text-secondary text-xs mt-3">
                        Cancel anytime. No hidden fees. Special series sold separately.
                    </p>
                </div>
            </div>
        </div>
    )
}

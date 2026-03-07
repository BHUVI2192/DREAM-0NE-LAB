import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Login() {
    const [phone, setPhone] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const navigate = useNavigate()

    const handleLogin = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { error } = await supabase.auth.signInWithOtp({
                phone: `+91${phone}`,
                options: {
                    data: { is_phone_user: true }
                }
            })

            if (error) throw error

            alert('OTP sent to your phone!')
            const otp = prompt('Enter OTP:')
            
            if (otp) {
                const { error: verifyError } = await supabase.auth.verifyOtp({
                    phone: `+91${phone}`,
                    token: otp,
                    type: 'sms'
                })

                if (verifyError) throw verifyError
                navigate('/home')
            }
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <div className="bg-bg-elevated p-8 rounded-3xl border border-border-subtle">
                    <h2 className="text-3xl font-bold text-white mb-6 text-center">Welcome Back</h2>
                    
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-text-secondary mb-2">Phone Number</label>
                            <div className="flex">
                                <span className="bg-bg-secondary px-4 py-3 rounded-l-xl border border-border-subtle text-text-secondary">+91</span>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="9876543210"
                                    required
                                    maxLength={10}
                                    className="flex-1 bg-bg-secondary px-4 py-3 rounded-r-xl border border-l-0 border-border-subtle text-white focus:outline-none focus:border-accent"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-accent text-white py-3 rounded-xl font-bold hover:bg-accent/90 disabled:opacity-50 transition-all"
                        >
                            {loading ? 'Sending OTP...' : 'Send OTP'}
                        </button>
                    </form>

                    <p className="text-center text-text-secondary mt-6">
                        Don't have an account?{' '}
                        <Link to="/signup" className="text-accent hover:underline">
                            Sign Up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

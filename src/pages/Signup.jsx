import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Signup() {
    const [signupMethod, setSignupMethod] = useState('email') // 'email' or 'phone'
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const navigate = useNavigate()

    const handleEmailSignup = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        if (password !== confirmPassword) {
            setError('Passwords do not match')
            setLoading(false)
            return
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters')
            setLoading(false)
            return
        }

        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: name
                    }
                }
            })

            if (error) throw error
            navigate('/home')
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handlePhoneSignup = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        if (password !== confirmPassword) {
            setError('Passwords do not match')
            setLoading(false)
            return
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters')
            setLoading(false)
            return
        }

        try {
            const { error } = await supabase.auth.signUp({
                phone: `+91${phone}`,
                password,
                options: {
                    data: {
                        full_name: name,
                        phone_number: `+91${phone}`
                    }
                }
            })

            if (error) throw error
            navigate('/home')
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleSignup = async () => {
        setLoading(true)
        setError(null)

        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/home`
                }
            })

            if (error) throw error
        } catch (err) {
            setError(err.message)
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-md">
                <div className="bg-bg-elevated p-8 rounded-3xl border border-border-subtle">
                    <h2 className="text-3xl font-bold text-white mb-6 text-center">Create Account</h2>
                    
                    {/* Signup Method Toggle */}
                    <div className="flex gap-2 mb-6">
                        <button
                            type="button"
                            onClick={() => setSignupMethod('email')}
                            className={`flex-1 py-2 rounded-xl font-medium transition-all ${
                                signupMethod === 'email'
                                    ? 'bg-accent text-white'
                                    : 'bg-bg-secondary text-text-secondary hover:text-white'
                            }`}
                        >
                            Email
                        </button>
                        <button
                            type="button"
                            onClick={() => setSignupMethod('phone')}
                            className={`flex-1 py-2 rounded-xl font-medium transition-all ${
                                signupMethod === 'phone'
                                    ? 'bg-accent text-white'
                                    : 'bg-bg-secondary text-text-secondary hover:text-white'
                            }`}
                        >
                            Phone
                        </button>
                    </div>

                    {/* Email Signup Form */}
                    {signupMethod === 'email' && (
                        <form onSubmit={handleEmailSignup} className="space-y-4">
                            <div>
                                <label className="block text-text-secondary mb-2">Full Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter your name"
                                    required
                                    className="w-full bg-bg-secondary px-4 py-3 rounded-xl border border-border-subtle text-white focus:outline-none focus:border-accent"
                                />
                            </div>

                            <div>
                                <label className="block text-text-secondary mb-2">Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    required
                                    className="w-full bg-bg-secondary px-4 py-3 rounded-xl border border-border-subtle text-white focus:outline-none focus:border-accent"
                                />
                            </div>

                            <div>
                                <label className="block text-text-secondary mb-2">Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                    className="w-full bg-bg-secondary px-4 py-3 rounded-xl border border-border-subtle text-white focus:outline-none focus:border-accent"
                                />
                            </div>

                            <div>
                                <label className="block text-text-secondary mb-2">Confirm Password</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                    className="w-full bg-bg-secondary px-4 py-3 rounded-xl border border-border-subtle text-white focus:outline-none focus:border-accent"
                                />
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
                                {loading ? 'Creating Account...' : 'Sign Up'}
                            </button>
                        </form>
                    )}

                    {/* Phone Signup Form */}
                    {signupMethod === 'phone' && (
                        <form onSubmit={handlePhoneSignup} className="space-y-4">
                            <div>
                                <label className="block text-text-secondary mb-2">Full Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter your name"
                                    required
                                    className="w-full bg-bg-secondary px-4 py-3 rounded-xl border border-border-subtle text-white focus:outline-none focus:border-accent"
                                />
                            </div>

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

                            <div>
                                <label className="block text-text-secondary mb-2">Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                    className="w-full bg-bg-secondary px-4 py-3 rounded-xl border border-border-subtle text-white focus:outline-none focus:border-accent"
                                />
                            </div>

                            <div>
                                <label className="block text-text-secondary mb-2">Confirm Password</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                    className="w-full bg-bg-secondary px-4 py-3 rounded-xl border border-border-subtle text-white focus:outline-none focus:border-accent"
                                />
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
                                {loading ? 'Creating Account...' : 'Sign Up'}
                            </button>
                        </form>
                    )}

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-border-subtle"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-bg-elevated text-text-secondary">Or continue with</span>
                        </div>
                    </div>

                    {/* Google Sign In */}
                    <button
                        type="button"
                        onClick={handleGoogleSignup}
                        disabled={loading}
                        className="w-full bg-white text-gray-900 py-3 rounded-xl font-bold hover:bg-gray-100 disabled:opacity-50 transition-all flex items-center justify-center gap-3"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Continue with Google
                    </button>

                    <p className="text-center text-text-secondary mt-6">
                        Already have an account?{' '}
                        <Link to="/login" className="text-accent hover:underline">
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

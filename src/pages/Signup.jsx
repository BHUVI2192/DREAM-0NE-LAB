import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Signup() {
    const [signupMethod, setSignupMethod] = useState('email') // 'email' or 'phone'
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
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
        <div className="min-h-[100dvh] bg-[#0A0A0A] flex flex-col justify-center items-center py-12 px-4 sm:p-4 relative overflow-x-hidden overflow-y-auto">
            {/* Ambient Background Effects */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-accent/20 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />
            
            <div className="w-full max-w-[420px] relative z-10">
                {/* Logo/Brand Area */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-accent to-blue-500 mb-4 shadow-lg shadow-accent/20">
                        <span className="text-2xl font-bold text-white tracking-wider">DL</span>
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Create an account</h2>
                    <p className="text-text-secondary text-sm">Join us to start your journey</p>
                </div>

                {/* Main Auth Card */}
                <div className="bg-[#141414]/80 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-white/[0.05] shadow-2xl relative">
                    {/* Inner highlight */}
                    <div className="absolute inset-0 rounded-3xl border border-white/[0.02] pointer-events-none" />
                    
                    {/* Method Toggle */}
                    <div className="flex p-1 bg-[#0A0A0A] rounded-2xl mb-8 relative">
                        <button
                            type="button"
                            onClick={() => setSignupMethod('email')}
                            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 z-10 ${
                                signupMethod === 'email'
                                    ? 'text-white shadow-md'
                                    : 'text-text-secondary hover:text-white'
                            }`}
                        >
                            Email
                        </button>
                        <button
                            type="button"
                            onClick={() => setSignupMethod('phone')}
                            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 z-10 ${
                                signupMethod === 'phone'
                                    ? 'text-white shadow-md'
                                    : 'text-text-secondary hover:text-white'
                            }`}
                        >
                            Phone
                        </button>
                        {/* Animated pill background */}
                        <div 
                            className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-[#1A1A1A] rounded-xl transition-all duration-300 ease-out border border-white/[0.05] shadow-[0_2px_8px_rgba(0,0,0,0.4)] ${
                                signupMethod === 'email' ? 'left-1' : 'left-[calc(50%+2px)]'
                            }`}
                        />
                    </div>

                    {/* Email Signup Form */}
                    {signupMethod === 'email' && (
                        <form onSubmit={handleEmailSignup} className="space-y-4">
                            <div className="group relative">
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder=" "
                                    required
                                    className="w-full bg-[#0A0A0A] px-4 pt-6 pb-2 rounded-2xl border border-white/[0.05] text-white focus:outline-none focus:border-accent/50 focus:bg-[#0F0F0F] transition-all peer"
                                />
                                <label className="absolute left-4 top-4 text-text-secondary text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-xs peer-valid:top-2 peer-valid:text-xs pointer-events-none">
                                    Full Name
                                </label>
                            </div>

                            <div className="group relative">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder=" "
                                    required
                                    className="w-full bg-[#0A0A0A] px-4 pt-6 pb-2 rounded-2xl border border-white/[0.05] text-white focus:outline-none focus:border-accent/50 focus:bg-[#0F0F0F] transition-all peer"
                                />
                                <label className="absolute left-4 top-4 text-text-secondary text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-xs peer-valid:top-2 peer-valid:text-xs pointer-events-none">
                                    Email address
                                </label>
                            </div>

                            <div className="group relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder=" "
                                    required
                                    minLength={6}
                                    className="w-full bg-[#0A0A0A] px-4 pt-6 pb-2 rounded-2xl border border-white/[0.05] text-white focus:outline-none focus:border-accent/50 focus:bg-[#0F0F0F] transition-all peer pr-12"
                                />
                                <label className="absolute left-4 top-4 text-text-secondary text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-xs peer-valid:top-2 peer-valid:text-xs pointer-events-none">
                                    Password
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-white transition-colors p-1"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            <div className="group relative">
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder=" "
                                    required
                                    minLength={6}
                                    className="w-full bg-[#0A0A0A] px-4 pt-6 pb-2 rounded-2xl border border-white/[0.05] text-white focus:outline-none focus:border-accent/50 focus:bg-[#0F0F0F] transition-all peer pr-12"
                                />
                                <label className="absolute left-4 top-4 text-text-secondary text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-xs peer-valid:top-2 peer-valid:text-xs pointer-events-none">
                                    Confirm Password
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword((v) => !v)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-white transition-colors p-1"
                                    tabIndex={-1}
                                >
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-sm flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-accent text-white py-3.5 rounded-2xl font-bold hover:bg-accent/90 disabled:opacity-50 transition-all duration-300 shadow-[0_0_20px_rgba(var(--color-accent),0.3)] hover:shadow-[0_0_25px_rgba(var(--color-accent),0.4)] relative overflow-hidden group/btn mt-2"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 ease-out" />
                                <span className="relative z-10">{loading ? 'Creating Account...' : 'Sign Up'}</span>
                            </button>
                        </form>
                    )}

                    {/* Phone Signup Form */}
                    {signupMethod === 'phone' && (
                        <form onSubmit={handlePhoneSignup} className="space-y-4">
                            <div className="group relative">
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder=" "
                                    required
                                    className="w-full bg-[#0A0A0A] px-4 pt-6 pb-2 rounded-2xl border border-white/[0.05] text-white focus:outline-none focus:border-accent/50 focus:bg-[#0F0F0F] transition-all peer"
                                />
                                <label className="absolute left-4 top-4 text-text-secondary text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-xs peer-valid:top-2 peer-valid:text-xs pointer-events-none">
                                    Full Name
                                </label>
                            </div>

                            <div className="group relative flex">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary font-medium pr-3 border-r border-white/[0.1] z-10 mt-2">
                                    +91
                                </div>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder=" "
                                    required
                                    maxLength={10}
                                    className="w-full bg-[#0A0A0A] pl-[4.5rem] pr-4 pt-6 pb-2 rounded-2xl border border-white/[0.05] text-white focus:outline-none focus:border-accent/50 focus:bg-[#0F0F0F] transition-all peer"
                                />
                                <label className="absolute left-[4.5rem] top-4 text-text-secondary text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-xs peer-valid:top-2 peer-valid:text-xs pointer-events-none z-10">
                                    Phone Number
                                </label>
                            </div>

                            <div className="group relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder=" "
                                    required
                                    minLength={6}
                                    className="w-full bg-[#0A0A0A] px-4 pt-6 pb-2 rounded-2xl border border-white/[0.05] text-white focus:outline-none focus:border-accent/50 focus:bg-[#0F0F0F] transition-all peer pr-12"
                                />
                                <label className="absolute left-4 top-4 text-text-secondary text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-xs peer-valid:top-2 peer-valid:text-xs pointer-events-none">
                                    Password
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-white transition-colors p-1"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            <div className="group relative">
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder=" "
                                    required
                                    minLength={6}
                                    className="w-full bg-[#0A0A0A] px-4 pt-6 pb-2 rounded-2xl border border-white/[0.05] text-white focus:outline-none focus:border-accent/50 focus:bg-[#0F0F0F] transition-all peer pr-12"
                                />
                                <label className="absolute left-4 top-4 text-text-secondary text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-xs peer-valid:top-2 peer-valid:text-xs pointer-events-none">
                                    Confirm Password
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword((v) => !v)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-white transition-colors p-1"
                                    tabIndex={-1}
                                >
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-sm flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-accent text-white py-3.5 rounded-2xl font-bold hover:bg-accent/90 disabled:opacity-50 transition-all duration-300 shadow-[0_0_20px_rgba(var(--color-accent),0.3)] hover:shadow-[0_0_25px_rgba(var(--color-accent),0.4)] relative overflow-hidden group/btn mt-2"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 ease-out" />
                                <span className="relative z-10">{loading ? 'Creating Account...' : 'Sign Up'}</span>
                            </button>
                        </form>
                    )}

                    {/* Divider */}
                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/[0.05]"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-[#141414] text-text-secondary">Or continue with</span>
                        </div>
                    </div>

                    {/* Google Sign In */}
                    <button
                        type="button"
                        onClick={handleGoogleSignup}
                        disabled={loading}
                        className="w-full bg-[#0A0A0A] border border-white/[0.1] text-white py-3.5 rounded-2xl font-semibold hover:bg-[#1A1A1A] hover:border-white/[0.2] disabled:opacity-50 transition-all duration-300 flex items-center justify-center gap-3 relative overflow-hidden group/google"
                    >
                        <div className="absolute inset-0 bg-white/[0.02] opacity-0 group-hover/google:opacity-100 transition-opacity duration-300" />
                        <svg className="w-5 h-5 relative z-10" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        <span className="relative z-10">Google</span>
                    </button>

                    <p className="text-center text-text-secondary mt-8 text-sm">
                        Already have an account?{' '}
                        <Link to="/login" className="text-white hover:text-accent font-semibold transition-colors">
                            Sign In
                        </Link>
                    </p>
                </div>

                {/* Optional Footer Link */}
                <div className="text-center mt-6">
                    <Link to="/" className="text-text-secondary hover:text-white text-sm transition-colors font-medium">
                        &larr; Back to website
                    </Link>
                </div>
            </div>
        </div>
    )
}

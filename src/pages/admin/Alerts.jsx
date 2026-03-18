import { useEffect, useState } from 'react'
import { Bell, Send, Users, Crown, Info, Loader2, RefreshCw } from 'lucide-react'
import { supabase } from '../../lib/supabase'

const TEMPLATES = [
    { id: 'new_book', label: 'New Book Available', body: 'A new audiobook has just been added to Dream One Lab. Check it out now!' },
    { id: 'renewal', label: 'Subscription Renewal', body: 'Your Dream One Lab Premium subscription renews tomorrow. Enjoy uninterrupted listening!' },
    { id: 'promo',   label: 'Promotional Offer',   body: 'Special offer: Upgrade to Premium today and get 10% off your first month!' },
]

export default function Alerts() {
    const [audience, setAudience] = useState('all')
    const [severity, setSeverity] = useState('info')
    const [title, setTitle] = useState('')
    const [message, setMessage] = useState('')
    const [selectedTemplate, setSelectedTemplate] = useState(null)
    const [sending, setSending] = useState(false)
    const [status, setStatus] = useState('')
    const [recentAlerts, setRecentAlerts] = useState([])
    const [loadingRecent, setLoadingRecent] = useState(true)

    const applyTemplate = (t) => {
        setSelectedTemplate(t.id)
        setTitle(t.label)
        setMessage(t.body)
    }

    useEffect(() => {
        loadRecentAlerts()
    }, [])

    const loadRecentAlerts = async () => {
        setLoadingRecent(true)
        try {
            // Prefer audience-aware fetch; fallback keeps compatibility with older DBs.
            let query = supabase
                .from('alerts')
                .select('id, title, content, type, is_active, created_at, audience')
                .order('created_at', { ascending: false })
                .limit(12)

            let { data, error } = await query

            if (error) {
                // audience column may not exist yet — fall back to schema without it
                const fallback = await supabase
                    .from('alerts')
                    .select('id, title, content, type, is_active, created_at')
                    .order('created_at', { ascending: false })
                    .limit(12)

                if (!fallback.error) {
                    data = (fallback.data || []).map((row) => ({ ...row, audience: 'all' }))
                    error = null
                } else {
                    error = fallback.error
                }
            }

            if (error) throw error
            setRecentAlerts(data || [])
        } catch (error) {
            console.error('Failed to load alerts:', error)
            setStatus('Could not load recent alerts.')
        } finally {
            setLoadingRecent(false)
        }
    }

    const sendAlert = async () => {
        const resolvedTitle = title.trim() || 'Admin Announcement'
        const resolvedMessage = message.trim()
        if (!resolvedMessage) return

        setSending(true)
        setStatus('')

        try {
            const payload = {
                title: resolvedTitle,
                content: resolvedMessage,
                type: severity,
                is_active: true,
                audience,
            }

            let { error } = await supabase.from('alerts').insert([payload])

            if (error) {
                // audience column may not exist yet — fall back to insert without it
                const payloadWithoutAudience = { ...payload }
                delete payloadWithoutAudience.audience
                const fallback = await supabase.from('alerts').insert([payloadWithoutAudience])
                error = fallback.error
                if (!error) {
                    setStatus('Alert sent. Run supabase/FIX_ALL_ERRORS.sql to enable audience targeting.')
                }
            }

            if (error) throw error

            if (!status) {
                setStatus('Alert sent successfully.')
            }

            setMessage('')
            setTitle('')
            setSelectedTemplate(null)
            await loadRecentAlerts()
        } catch (error) {
            console.error('Failed to send alert:', error)
            setStatus(error.message || 'Failed to send alert.')
        } finally {
            setSending(false)
        }
    }

    const toggleAlertActive = async (alertId, nextActive) => {
        try {
            const { error } = await supabase
                .from('alerts')
                .update({ is_active: nextActive })
                .eq('id', alertId)

            if (error) throw error

            setRecentAlerts((current) =>
                current.map((item) =>
                    item.id === alertId ? { ...item, is_active: nextActive } : item
                )
            )
        } catch (error) {
            console.error('Failed to update alert:', error)
            setStatus('Could not update alert state.')
        }
    }

    return (
        <div className="p-4 md:p-6 lg:p-8 space-y-5">
            <div>
                <h1 className="text-xl md:text-2xl font-bold text-white">Alerts & Notifications</h1>
                <p className="text-white/40 text-sm mt-0.5">Send announcements to your users</p>
            </div>

            {/* Audience selector */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 md:p-5">
                <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-3">Audience</p>
                <div className="flex flex-wrap gap-2">
                    {[{ id: 'all', label: 'All Users', icon: Users }, { id: 'premium', label: 'Premium Only', icon: Crown }, { id: 'free', label: 'Free Tier', icon: Bell }].map(opt => (
                        <button
                            key={opt.id}
                            onClick={() => setAudience(opt.id)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all border ${
                                audience === opt.id
                                    ? 'bg-[#1DB954]/15 border-[#1DB954]/30 text-[#1DB954]'
                                    : 'border-white/[0.06] text-white/50 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            <opt.icon size={14} />
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Templates */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 md:p-5">
                <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-3">Templates</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {TEMPLATES.map(t => (
                        <button
                            key={t.id}
                            onClick={() => applyTemplate(t)}
                            className={`text-left px-3 py-2.5 rounded-lg border text-sm transition-all ${
                                selectedTemplate === t.id
                                    ? 'border-[#1DB954]/30 bg-[#1DB954]/10 text-white'
                                    : 'border-white/[0.06] text-white/50 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Compose */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 md:p-5">
                <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-3">Title</p>
                <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Optional title (defaults to Admin Announcement)"
                    className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-3 text-white text-sm placeholder-white/30 focus:outline-none focus:border-white/20 transition-colors mb-4"
                />

                <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-3">Severity</p>
                <div className="flex flex-wrap gap-2 mb-4">
                    {['info', 'success', 'warning', 'error'].map((type) => (
                        <button
                            key={type}
                            onClick={() => setSeverity(type)}
                            className={`rounded-lg border px-3 py-2 text-sm font-medium capitalize transition-all ${
                                severity === type
                                    ? 'border-[#1DB954]/30 bg-[#1DB954]/10 text-[#1DB954]'
                                    : 'border-white/[0.06] text-white/50 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>

                <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-3">Message</p>
                <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    rows={4}
                    placeholder="Type your notification message…"
                    className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-3 text-white text-sm placeholder-white/30 focus:outline-none focus:border-white/20 resize-none transition-colors"
                />
                <div className="flex items-center justify-between mt-3">
                    <span className="flex items-center gap-1.5 text-xs text-white/30">
                        <Info size={12} />
                        Alerts are saved in Supabase and shown to users by audience.
                    </span>
                    <button
                        disabled={!message.trim() || sending}
                        onClick={sendAlert}
                        className="flex items-center gap-2 bg-[#1DB954] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#1ed760] text-black px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                    >
                        {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                        {sending ? 'Sending...' : 'Send'}
                    </button>
                </div>
                {status && <p className="mt-3 text-sm text-white/70">{status}</p>}
            </div>

            {/* Recent Alerts */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 md:p-5">
                <div className="mb-3 flex items-center justify-between">
                    <p className="text-white/60 text-xs font-semibold uppercase tracking-widest">Recent Alerts</p>
                    <button
                        onClick={loadRecentAlerts}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] px-2.5 py-1.5 text-xs text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                    >
                        <RefreshCw size={12} />
                        Refresh
                    </button>
                </div>

                {loadingRecent ? (
                    <p className="text-sm text-white/40">Loading alerts...</p>
                ) : recentAlerts.length === 0 ? (
                    <p className="text-sm text-white/40">No alerts yet.</p>
                ) : (
                    <div className="space-y-2">
                        {recentAlerts.map((item) => (
                            <div key={item.id} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div className="space-y-1">
                                        <p className="text-sm font-semibold text-white">{item.title}</p>
                                        <p className="text-xs text-white/50 capitalize">
                                            {item.type} • Audience: {item.audience || 'all'} • {new Date(item.created_at).toLocaleString()}
                                        </p>
                                        <p className="text-sm text-white/80">{item.content}</p>
                                    </div>
                                    <button
                                        onClick={() => toggleAlertActive(item.id, !item.is_active)}
                                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                                            item.is_active
                                                ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                                                : 'bg-white/10 text-white/60 hover:bg-white/20'
                                        }`}
                                    >
                                        {item.is_active ? 'Active' : 'Inactive'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

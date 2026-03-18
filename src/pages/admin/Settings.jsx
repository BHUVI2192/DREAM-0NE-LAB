import { Bell, Shield, Palette, Globe, ChevronRight } from 'lucide-react'

const GROUPS = [
    {
        label: 'General',
        items: [
            { icon: Globe, title: 'App Name & Branding', desc: 'Change app name, logo, and tagline' },
            { icon: Palette, title: 'Theme & Colors', desc: 'Customize primary accent color' },
        ]
    },
    {
        label: 'Notifications',
        items: [
            { icon: Bell, title: 'Push Notifications', desc: 'Configure notification templates' },
        ]
    },
    {
        label: 'Security',
        items: [
            { icon: Shield, title: 'Admin Access', desc: 'Manage admin email whitelist' },
        ]
    },
]

export default function Settings() {
    return (
        <div className="p-4 md:p-6 lg:p-8 space-y-6">
            <div>
                <h1 className="text-xl md:text-2xl font-bold text-white">Settings</h1>
                <p className="text-white/40 text-sm mt-0.5">App configuration and preferences</p>
            </div>

            {GROUPS.map(group => (
                <div key={group.label}>
                    <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-2">{group.label}</p>
                    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden divide-y divide-white/[0.04]">
                        {group.items.map(item => (
                            <button
                                key={item.title}
                                className="w-full flex items-center gap-4 px-5 py-4 hover:bg-white/[0.04] transition-colors text-left"
                            >
                                <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-white/50 flex-shrink-0">
                                    <item.icon size={18} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-white text-sm font-medium">{item.title}</p>
                                    <p className="text-white/40 text-xs mt-0.5">{item.desc}</p>
                                </div>
                                <ChevronRight size={16} className="text-white/20 flex-shrink-0" />
                            </button>
                        ))}
                    </div>
                </div>
            ))}

            <p className="text-white/20 text-xs text-center pt-2">Dream Lab Admin v1.0 — Full settings coming soon</p>
        </div>
    )
}

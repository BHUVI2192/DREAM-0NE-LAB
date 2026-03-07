import useAuth from '../hooks/useAuth'
import { User } from 'lucide-react'

export default function Profile() {
    const { user, profile } = useAuth()

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <h1 className="text-4xl font-bold text-white">My Profile</h1>

            <div className="bg-bg-elevated rounded-3xl p-8 border border-border-subtle">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center">
                        <User className="w-10 h-10 text-accent" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">
                            {profile?.display_name || profile?.full_name || 'User'}
                        </h2>
                        <p className="text-text-secondary">{profile?.phone || profile?.email}</p>
                    </div>
                </div>

                <div className="space-y-4 border-t border-border-subtle pt-6">
                    <div>
                        <label className="text-text-muted text-sm">Phone</label>
                        <p className="text-white">{profile?.phone || 'Not set'}</p>
                    </div>
                    <div>
                        <label className="text-text-muted text-sm">Email</label>
                        <p className="text-white">{profile?.email || 'Not set'}</p>
                    </div>
                    <div>
                        <label className="text-text-muted text-sm">Subscription Status</label>
                        <p className="text-white">
                            {profile?.subscription_expiry 
                                ? new Date(profile.subscription_expiry) > new Date() 
                                    ? '✅ Active' 
                                    : '❌ Expired'
                                : '❌ No Subscription'
                            }
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

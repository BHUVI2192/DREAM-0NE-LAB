import { Mail, Phone } from 'lucide-react'

export default function Support() {
    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <h1 className="text-4xl font-bold text-white">Support</h1>

            <div className="bg-bg-elevated rounded-3xl p-8 border border-border-subtle space-y-6">
                <p className="text-text-secondary">
                    Need help? We're here for you! Reach out to our support team.
                </p>

                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center">
                            <Mail className="w-6 h-6 text-accent" />
                        </div>
                        <div>
                            <div className="text-text-muted text-sm">Email</div>
                            <a href="mailto:support@dreamonelab.com" className="text-white hover:text-accent">
                                support@dreamonelab.com
                            </a>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center">
                            <Phone className="w-6 h-6 text-accent" />
                        </div>
                        <div>
                            <div className="text-text-muted text-sm">Phone</div>
                            <a href="tel:+911234567890" className="text-white hover:text-accent">
                                +91 12345 67890
                            </a>
                        </div>
                    </div>
                </div>

                <div className="border-t border-border-subtle pt-6">
                    <h3 className="text-white font-bold mb-4">Frequently Asked Questions</h3>
                    <div className="space-y-4">
                        <details className="group">
                            <summary className="cursor-pointer text-text-secondary hover:text-white">
                                How do I subscribe?
                            </summary>
                            <p className="mt-2 text-text-muted text-sm">
                                Click on any premium book and you'll be prompted to subscribe or purchase.
                            </p>
                        </details>
                        <details className="group">
                            <summary className="cursor-pointer text-text-secondary hover:text-white">
                                How do payments work?
                            </summary>
                            <p className="mt-2 text-text-muted text-sm">
                                We use PhonePe for secure payments. All major payment methods are supported.
                            </p>
                        </details>
                    </div>
                </div>
            </div>
        </div>
    )
}

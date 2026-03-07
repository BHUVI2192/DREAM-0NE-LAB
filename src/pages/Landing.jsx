import { Link } from 'react-router-dom'
import { PlayCircle, Headphones, Sparkles } from 'lucide-react'

export default function Landing() {
    return (
        <div className="min-h-screen bg-bg-primary">
            <div className="container mx-auto px-4 py-16">
                <div className="text-center space-y-8">
                    <div className="space-y-4">
                        <h1 className="text-6xl font-bold text-white">
                            Dream One Lab
                        </h1>
                        <p className="text-xl text-text-secondary max-w-2xl mx-auto">
                            Immerse yourself in captivating audio stories. Listen anytime, anywhere.
                        </p>
                    </div>

                    <div className="flex justify-center gap-4">
                        <Link
                            to="/signup"
                            className="bg-accent text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-accent/90 transition-all shadow-lg shadow-accent/20"
                        >
                            Get Started
                        </Link>
                        <Link
                            to="/login"
                            className="bg-bg-elevated text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-bg-secondary transition-all border border-border-subtle"
                        >
                            Sign In
                        </Link>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 mt-16 max-w-4xl mx-auto">
                        <div className="bg-bg-elevated p-6 rounded-2xl border border-border-subtle">
                            <PlayCircle className="w-12 h-12 text-accent mb-4 mx-auto" />
                            <h3 className="text-xl font-bold text-white mb-2">Unlimited Listening</h3>
                            <p className="text-text-secondary">Access thousands of audio stories</p>
                        </div>
                        <div className="bg-bg-elevated p-6 rounded-2xl border border-border-subtle">
                            <Headphones className="w-12 h-12 text-accent mb-4 mx-auto" />
                            <h3 className="text-xl font-bold text-white mb-2">High Quality Audio</h3>
                            <p className="text-text-secondary">Crystal clear sound experience</p>
                        </div>
                        <div className="bg-bg-elevated p-6 rounded-2xl border border-border-subtle">
                            <Sparkles className="w-12 h-12 text-accent mb-4 mx-auto" />
                            <h3 className="text-xl font-bold text-white mb-2">Premium Content</h3>
                            <p className="text-text-secondary">Exclusive stories and series</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

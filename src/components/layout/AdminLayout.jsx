import { Outlet } from 'react-router-dom'

export default function AdminLayout() {
    return (
        <div className="min-h-screen bg-bg-primary">
            <nav className="bg-bg-elevated border-b border-border-subtle">
                <div className="container mx-auto px-4 py-4">
                    <h1 className="text-2xl font-bold text-accent">Admin Dashboard</h1>
                </div>
            </nav>
            <main className="container mx-auto px-4 py-8">
                <Outlet />
            </main>
        </div>
    )
}

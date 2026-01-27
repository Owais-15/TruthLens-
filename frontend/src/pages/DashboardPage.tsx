import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import VerificationInterface from '../components/VerificationInterface';

export default function DashboardPage() {
    const { user, logout } = useAuthStore();

    return (
        <div className="min-h-screen">
            {/* Header */}
            <header className="glass-card mx-4 mt-4 mb-6">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
                            TruthLens
                        </h1>
                        <nav className="flex gap-4">
                            <Link
                                to="/"
                                className="text-primary-400 font-medium"
                            >
                                Verify
                            </Link>
                            <Link
                                to="/history"
                                className="text-text-secondary hover:text-text-primary transition-colors"
                            >
                                History
                            </Link>
                        </nav>
                    </div>

                    <div className="flex items-center gap-4">
                        {user && (
                            <div className="text-sm">
                                <p className="text-text-primary font-medium">{user.name || user.email}</p>
                                <p className="text-text-secondary text-xs">
                                    {user.verificationsUsed} / {user.verificationsLimit} verifications
                                </p>
                            </div>
                        )}
                        <button
                            onClick={logout}
                            className="px-4 py-2 text-sm bg-bg-secondary hover:bg-bg-tertiary rounded-lg transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 pb-8">
                <VerificationInterface />
            </main>
        </div>
    );
}

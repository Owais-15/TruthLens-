import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { verificationAPI } from '../services/api';

interface Verification {
    id: number;
    inputText: string;
    trustScore: number;
    processingTime: number;
    createdAt: string;
}

export default function HistoryPage() {
    const { user, logout } = useAuthStore();
    const [verifications, setVerifications] = useState<Verification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            setIsLoading(true);
            const response = await verificationAPI.getHistory(50, 0);
            setVerifications(response.data.verifications);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to load history');
        } finally {
            setIsLoading(false);
        }
    };

    const getTrustScoreColor = (score: number) => {
        if (score >= 80) return 'text-verified';
        if (score >= 50) return 'text-neutral';
        return 'text-contradicted';
    };

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
                                className="text-text-secondary hover:text-text-primary transition-colors"
                            >
                                Verify
                            </Link>
                            <Link
                                to="/history"
                                className="text-primary-400 font-medium"
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
                <div className="glass-card p-6">
                    <h2 className="text-2xl font-bold mb-6">Verification History</h2>

                    {isLoading ? (
                        <div className="flex justify-center py-12">
                            <div className="spinner"></div>
                        </div>
                    ) : error ? (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg">
                            {error}
                        </div>
                    ) : verifications.length === 0 ? (
                        <div className="text-center py-12 text-text-secondary">
                            <p className="mb-4">No verifications yet</p>
                            <Link to="/" className="text-primary-400 hover:text-primary-300">
                                Create your first verification
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {verifications.map((verification) => (
                                <div
                                    key={verification.id}
                                    className="bg-bg-secondary p-4 rounded-lg hover:bg-bg-tertiary transition-colors"
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1">
                                            <p className="text-text-primary line-clamp-2 mb-2">
                                                {verification.inputText}
                                            </p>
                                            <p className="text-xs text-text-secondary">
                                                {new Date(verification.createdAt).toLocaleString()} • {verification.processingTime}ms
                                            </p>
                                        </div>
                                        <div className="ml-4 text-right">
                                            <div className={`text-2xl font-bold ${getTrustScoreColor(verification.trustScore)}`}>
                                                {verification.trustScore}%
                                            </div>
                                            <p className="text-xs text-text-secondary">Trust Score</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

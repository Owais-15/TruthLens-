import { useState } from 'react';
import VerificationInterface from '../components/VerificationInterface';
import VerificationHistory from '../components/VerificationHistory';
import AccountPanel from '../components/AccountPanel';
import { useAuthStore } from '../store/auth.store';

export default function TestVerificationPage() {
    const [showHistory, setShowHistory] = useState(false);
    const [showAccount, setShowAccount] = useState(false);
    const { user } = useAuthStore();

    // Get user initial for avatar
    const userInitial = user ? (user.name || user.email).charAt(0).toUpperCase() : 'T';

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header with Account Icon */}
                <div className="flex items-center justify-between mb-8">
                    <div className="text-center flex-1">
                        <h1 className="text-5xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent mb-2">
                            TruthLens
                        </h1>
                        <p className="text-text-secondary">AI Hallucination Detection - Test Interface</p>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* History Button */}
                        <button
                            onClick={() => setShowHistory(!showHistory)}
                            className="flex items-center gap-2 px-4 py-2 bg-bg-secondary hover:bg-bg-tertiary border border-glass-border rounded-lg transition-all hover:scale-105"
                            title="View History"
                        >
                            <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm font-medium text-text-primary">History</span>
                        </button>

                        {/* Account Icon */}
                        <button
                            onClick={() => setShowAccount(true)}
                            className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-xl font-bold text-white hover:scale-110 transition-transform shadow-lg"
                            title="Account"
                        >
                            {userInitial}
                        </button>
                    </div>
                </div>

                {/* History Panel (Toggleable) */}
                {showHistory && (
                    <div className="mb-8 glass-card p-6 animate-slide-up">
                        <VerificationHistory />
                    </div>
                )}

                {/* Verification Interface */}
                <VerificationInterface />
            </div>

            {/* Account Panel (Slide-in) */}
            <AccountPanel isOpen={showAccount} onClose={() => setShowAccount(false)} />
        </div>
    );
}

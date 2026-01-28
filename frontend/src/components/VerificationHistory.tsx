import { useState } from 'react';

interface VerificationHistoryItem {
    id: number;
    timestamp: Date;
    textPreview: string;
    trustScore: number;
    summary: {
        totalClaims: number;
        verified: number;
        contradicted: number;
        unverified: number;
    };
}

// Mock data for demonstration
const MOCK_HISTORY: VerificationHistoryItem[] = [
    {
        id: 1,
        timestamp: new Date(Date.now() - 3600000),
        textPreview: "The Eiffel Tower, a remarkable iron lattice structure standing proudly in Paris, was originally built as a giant sundial in 1822...",
        trustScore: 25,
        summary: { totalClaims: 5, verified: 0, contradicted: 4, unverified: 1 }
    },
    {
        id: 2,
        timestamp: new Date(Date.now() - 7200000),
        textPreview: "Albert Einstein developed the theory of relativity in 1905 and won the Nobel Prize in Physics in 1921...",
        trustScore: 75,
        summary: { totalClaims: 4, verified: 3, contradicted: 0, unverified: 1 }
    },
    {
        id: 3,
        timestamp: new Date(Date.now() - 86400000),
        textPreview: "The Eiffel Tower, located in Paris, France, was completed in 1889 and stands approximately 300 meters tall...",
        trustScore: 95,
        summary: { totalClaims: 4, verified: 4, contradicted: 0, unverified: 0 }
    }
];

export default function VerificationHistory() {
    const [history] = useState<VerificationHistoryItem[]>(MOCK_HISTORY);
    const [expandedId, setExpandedId] = useState<number | null>(null);

    const toggleExpand = (id: number) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-400';
        if (score >= 50) return 'text-yellow-400';
        return 'text-red-400';
    };

    const formatTimestamp = (date: Date) => {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (hours < 1) return 'Just now';
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-text-primary">Verification History</h2>
                    <p className="text-sm text-text-secondary mt-1">{history.length} recent verifications</p>
                </div>
                <button className="px-4 py-2 text-sm bg-bg-secondary hover:bg-bg-tertiary border border-glass-border rounded-lg transition-colors">
                    Clear History
                </button>
            </div>

            {history.length === 0 ? (
                <div className="text-center py-12 bg-bg-secondary/30 rounded-lg">
                    <svg className="w-16 h-16 mx-auto text-text-secondary mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-text-secondary">No verification history yet</p>
                    <p className="text-sm text-text-secondary mt-2">Your verified texts will appear here</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {history.map((item) => (
                        <div
                            key={item.id}
                            className="bg-bg-secondary rounded-lg border border-glass-border hover:border-primary-500/50 transition-all"
                        >
                            <button
                                onClick={() => toggleExpand(item.id)}
                                className="w-full p-4 text-left"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className={`text-3xl font-bold ${getScoreColor(item.trustScore)}`}>
                                                {item.trustScore}
                                            </span>
                                            <div className="flex-1">
                                                <p className="text-sm text-text-secondary">
                                                    {formatTimestamp(item.timestamp)}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-xs text-green-400">{item.summary.verified} ✓</span>
                                                    <span className="text-xs text-red-400">{item.summary.contradicted} ✕</span>
                                                    <span className="text-xs text-yellow-400">{item.summary.unverified} ⚠</span>
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-sm text-text-primary line-clamp-2">
                                            {item.textPreview}
                                        </p>
                                    </div>
                                    <svg
                                        className={`w-5 h-5 text-text-secondary transition-transform flex-shrink-0 ${expandedId === item.id ? 'rotate-180' : ''}`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </button>

                            {expandedId === item.id && (
                                <div className="px-4 pb-4 pt-2 border-t border-glass-border animate-fade-in">
                                    <div className="flex gap-2 mt-3">
                                        <button className="flex-1 px-3 py-2 text-sm bg-primary-500/20 hover:bg-primary-500/30 text-primary-400 rounded-lg transition-colors">
                                            Load Verification
                                        </button>
                                        <button className="flex-1 px-3 py-2 text-sm bg-bg-tertiary hover:bg-bg-tertiary/70 text-text-primary rounded-lg transition-colors">
                                            View Details
                                        </button>
                                        <button className="px-3 py-2 text-sm bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors">
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

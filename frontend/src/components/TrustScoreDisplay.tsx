interface TrustScoreDisplayProps {
    trustScore: number;
    summary: {
        totalClaims: number;
        verified: number;
        contradicted: number;
        unverified: number;
    };
    processingTime: number;
}

export default function TrustScoreDisplay({ trustScore, summary, processingTime }: TrustScoreDisplayProps) {
    const getScoreColor = (score: number) => {
        if (score >= 80) return 'from-verified to-verified-dark';
        if (score >= 50) return 'from-neutral to-neutral-dark';
        return 'from-contradicted to-contradicted-dark';
    };

    const getScoreLabel = (score: number) => {
        if (score >= 80) return 'High Trust';
        if (score >= 50) return 'Medium Trust';
        return 'Low Trust';
    };

    return (
        <div className="space-y-6">
            {/* Trust Score Gauge */}
            <div className="text-center">
                <div className="inline-block relative">
                    <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${getScoreColor(trustScore)} flex items-center justify-center shadow-premium`}>
                        <div className="w-28 h-28 rounded-full bg-bg-primary flex flex-col items-center justify-center">
                            <div className="text-4xl font-bold text-text-primary">{trustScore}</div>
                            <div className="text-xs text-text-secondary">Trust Score</div>
                        </div>
                    </div>
                </div>
                <p className="mt-4 text-lg font-semibold text-text-primary">{getScoreLabel(trustScore)}</p>
                <p className="text-sm text-text-secondary">Processed in {processingTime}ms</p>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-bg-secondary p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-text-primary">{summary.totalClaims}</div>
                    <div className="text-xs text-text-secondary mt-1">Total Claims</div>
                </div>
                <div className="bg-bg-secondary p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-verified">{summary.verified}</div>
                    <div className="text-xs text-text-secondary mt-1">Verified</div>
                </div>
                <div className="bg-bg-secondary p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-contradicted">{summary.contradicted}</div>
                    <div className="text-xs text-text-secondary mt-1">Contradicted</div>
                </div>
                <div className="bg-bg-secondary p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-neutral">{summary.unverified}</div>
                    <div className="text-xs text-text-secondary mt-1">Unverified</div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
                <div className="flex justify-between text-xs text-text-secondary">
                    <span>Claim Distribution</span>
                    <span>{summary.totalClaims} claims analyzed</span>
                </div>
                <div className="h-3 bg-bg-secondary rounded-full overflow-hidden flex">
                    {summary.verified > 0 && (
                        <div
                            className="bg-verified h-full transition-all"
                            style={{ width: `${(summary.verified / summary.totalClaims) * 100}%` }}
                            title={`${summary.verified} verified`}
                        />
                    )}
                    {summary.contradicted > 0 && (
                        <div
                            className="bg-contradicted h-full transition-all"
                            style={{ width: `${(summary.contradicted / summary.totalClaims) * 100}%` }}
                            title={`${summary.contradicted} contradicted`}
                        />
                    )}
                    {summary.unverified > 0 && (
                        <div
                            className="bg-neutral h-full transition-all"
                            style={{ width: `${(summary.unverified / summary.totalClaims) * 100}%` }}
                            title={`${summary.unverified} unverified`}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

import { useEffect, useState } from 'react';

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
    const [animatedScore, setAnimatedScore] = useState(0);

    // Animated counting effect
    useEffect(() => {
        let start = 0;
        const end = trustScore;
        const duration = 1000; // 1 second
        const increment = end / (duration / 16); // 60fps

        const timer = setInterval(() => {
            start += increment;
            if (start >= end) {
                setAnimatedScore(end);
                clearInterval(timer);
            } else {
                setAnimatedScore(Math.floor(start));
            }
        }, 16);

        return () => clearInterval(timer);
    }, [trustScore]);

    const getScoreColor = (score: number) => {
        if (score >= 80) return { gradient: 'from-green-500 to-emerald-600', stroke: '#10b981', text: 'text-green-400' };
        if (score >= 50) return { gradient: 'from-yellow-500 to-orange-500', stroke: '#f59e0b', text: 'text-yellow-400' };
        return { gradient: 'from-red-500 to-rose-600', stroke: '#ef4444', text: 'text-red-400' };
    };

    const getScoreLabel = (score: number) => {
        if (score >= 80) return { label: 'High Trust', description: 'Content is highly reliable' };
        if (score >= 50) return { label: 'Medium Trust', description: 'Some claims need verification' };
        return { label: 'Low Trust', description: 'Contains factual inaccuracies' };
    };

    const colors = getScoreColor(trustScore);
    const scoreInfo = getScoreLabel(trustScore);
    const circumference = 2 * Math.PI * 70; // radius = 70
    const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Enhanced Trust Score with Circular Progress */}
            <div className="text-center">
                <div className="inline-block relative">
                    {/* SVG Circular Progress Ring */}
                    <svg className="transform -rotate-90" width="180" height="180">
                        {/* Background circle */}
                        <circle
                            cx="90"
                            cy="90"
                            r="70"
                            stroke="rgba(255, 255, 255, 0.1)"
                            strokeWidth="12"
                            fill="none"
                        />
                        {/* Progress circle */}
                        <circle
                            cx="90"
                            cy="90"
                            r="70"
                            stroke={colors.stroke}
                            strokeWidth="12"
                            fill="none"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            className="transition-all duration-1000 ease-out"
                            style={{
                                filter: `drop-shadow(0 0 8px ${colors.stroke})`
                            }}
                        />
                    </svg>

                    {/* Score Number in Center */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className={`text-7xl font-extrabold ${colors.text}`}>
                            {animatedScore}
                        </div>
                        <div className="text-xs text-text-secondary mt-1 font-medium">TRUST SCORE</div>
                    </div>
                </div>

                {/* Score Label and Description */}
                <div className="mt-6 space-y-2">
                    <p className={`text-2xl font-bold ${colors.text}`}>{scoreInfo.label}</p>
                    <p className="text-sm text-text-secondary max-w-xs mx-auto">{scoreInfo.description}</p>
                    <p className="text-xs text-text-secondary">Processed in {processingTime}ms</p>
                </div>

                {/* Trust Score Scale Reference */}
                <div className="mt-6 bg-bg-secondary/50 rounded-lg p-4 max-w-md mx-auto">
                    <p className="text-xs font-semibold text-text-secondary mb-3">TRUST SCORE SCALE</p>
                    <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-text-secondary">0-3: Critical</span>
                            <div className="w-16 h-1.5 bg-gradient-to-r from-red-600 to-red-500 rounded"></div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-text-secondary">4-6: Low</span>
                            <div className="w-16 h-1.5 bg-gradient-to-r from-orange-500 to-yellow-500 rounded"></div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-text-secondary">7-8: Medium</span>
                            <div className="w-16 h-1.5 bg-gradient-to-r from-yellow-500 to-yellow-400 rounded"></div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-text-secondary">9-10: High</span>
                            <div className="w-16 h-1.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Summary Stats with Icons */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-bg-secondary/50 p-4 rounded-lg text-center hover:bg-bg-secondary transition-colors">
                    <div className="text-3xl font-bold text-text-primary">{summary.totalClaims}</div>
                    <div className="text-xs text-text-secondary mt-1 font-medium">Total Claims</div>
                </div>
                <div className="bg-bg-secondary/50 p-4 rounded-lg text-center hover:bg-bg-secondary transition-colors">
                    <div className="flex items-center justify-center gap-1">
                        <span className="text-3xl font-bold text-green-400">{summary.verified}</span>
                        <span className="text-green-400">✓</span>
                    </div>
                    <div className="text-xs text-text-secondary mt-1 font-medium">Verified</div>
                </div>
                <div className="bg-bg-secondary/50 p-4 rounded-lg text-center hover:bg-bg-secondary transition-colors">
                    <div className="flex items-center justify-center gap-1">
                        <span className="text-3xl font-bold text-red-400">{summary.contradicted}</span>
                        <span className="text-red-400">✕</span>
                    </div>
                    <div className="text-xs text-text-secondary mt-1 font-medium">Contradicted</div>
                </div>
                <div className="bg-bg-secondary/50 p-4 rounded-lg text-center hover:bg-bg-secondary transition-colors">
                    <div className="flex items-center justify-center gap-1">
                        <span className="text-3xl font-bold text-yellow-400">{summary.unverified}</span>
                        <span className="text-yellow-400">⚠</span>
                    </div>
                    <div className="text-xs text-text-secondary mt-1 font-medium">Unverified</div>
                </div>
            </div>

            {/* Enhanced Progress Bar */}
            <div className="space-y-2">
                <div className="flex justify-between text-xs text-text-secondary font-medium">
                    <span>CLAIM DISTRIBUTION</span>
                    <span>{summary.totalClaims} claims analyzed</span>
                </div>
                <div className="h-4 bg-bg-secondary rounded-full overflow-hidden flex shadow-inner">
                    {summary.verified > 0 && (
                        <div
                            className="bg-gradient-to-r from-green-500 to-emerald-500 h-full transition-all duration-500 hover:brightness-110 cursor-pointer"
                            style={{ width: `${(summary.verified / summary.totalClaims) * 100}%` }}
                            title={`${summary.verified} verified (${Math.round((summary.verified / summary.totalClaims) * 100)}%)`}
                        />
                    )}
                    {summary.contradicted > 0 && (
                        <div
                            className="bg-gradient-to-r from-red-500 to-rose-500 h-full transition-all duration-500 hover:brightness-110 cursor-pointer"
                            style={{ width: `${(summary.contradicted / summary.totalClaims) * 100}%` }}
                            title={`${summary.contradicted} contradicted (${Math.round((summary.contradicted / summary.totalClaims) * 100)}%)`}
                        />
                    )}
                    {summary.unverified > 0 && (
                        <div
                            className="bg-gradient-to-r from-yellow-500 to-orange-500 h-full transition-all duration-500 hover:brightness-110 cursor-pointer"
                            style={{ width: `${(summary.unverified / summary.totalClaims) * 100}%` }}
                            title={`${summary.unverified} unverified (${Math.round((summary.unverified / summary.totalClaims) * 100)}%)`}
                        />
                    )}
                </div>
                <div className="flex justify-between text-xs">
                    <span className="text-green-400">✓ {Math.round((summary.verified / summary.totalClaims) * 100)}%</span>
                    <span className="text-red-400">✕ {Math.round((summary.contradicted / summary.totalClaims) * 100)}%</span>
                    <span className="text-yellow-400">⚠ {Math.round((summary.unverified / summary.totalClaims) * 100)}%</span>
                </div>
            </div>
        </div>
    );
}

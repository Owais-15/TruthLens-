import { useState } from 'react';

interface ClaimVerification {
    claim: {
        text: string;
        type: string;
        startIndex: number;
        endIndex: number;
    };
    evidence?: Array<{
        url: string;
        title: string;
        snippet: string;
        score: number;
    }>;
    entailment: {
        verdict: 'entailment' | 'contradiction' | 'neutral' | 'verifying';
        confidence: number;
        reasoning: string;
    };
}

interface ClaimDetailsPanelProps {
    claims: ClaimVerification[];
}

export default function ClaimDetailsPanel({ claims }: ClaimDetailsPanelProps) {
    const [expandedSection, setExpandedSection] = useState<'verified' | 'contradicted' | 'unverified' | null>('contradicted');
    const [expandedClaims, setExpandedClaims] = useState<Set<number>>(new Set());

    const verifiedClaims = claims.filter(c => c.entailment.verdict === 'entailment');
    const contradictedClaims = claims.filter(c => c.entailment.verdict === 'contradiction');
    const unverifiedClaims = claims.filter(c => c.entailment.verdict === 'neutral' || c.entailment.verdict === 'verifying');

    const toggleSection = (section: 'verified' | 'contradicted' | 'unverified') => {
        setExpandedSection(expandedSection === section ? null : section);
    };

    const toggleClaim = (index: number) => {
        const newExpanded = new Set(expandedClaims);
        if (newExpanded.has(index)) {
            newExpanded.delete(index);
        } else {
            newExpanded.add(index);
        }
        setExpandedClaims(newExpanded);
    };

    const renderClaimCard = (claim: ClaimVerification, index: number, color: string, icon: string) => {
        const isExpanded = expandedClaims.has(index);

        return (
            <div key={index} className={`border-l-4 ${color} bg-bg-secondary/50 rounded-lg p-4 mb-3 transition-all hover:bg-bg-secondary`}>
                <button
                    onClick={() => toggleClaim(index)}
                    className="w-full text-left"
                >
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1">
                            <span className="text-2xl mt-1">{icon}</span>
                            <div className="flex-1">
                                <p className="text-text-primary font-medium leading-relaxed">
                                    "{claim.claim.text}"
                                </p>
                                <div className="flex items-center gap-3 mt-2 text-xs text-text-secondary">
                                    <span>Confidence: {Math.round(claim.entailment.confidence * 100)}%</span>
                                    <span>•</span>
                                    <span>{claim.evidence?.length || 0} sources</span>
                                </div>
                            </div>
                        </div>
                        <svg
                            className={`w-5 h-5 text-text-secondary transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </button>

                {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-glass-border space-y-4 animate-fade-in">
                        {/* Reasoning */}
                        <div>
                            <h4 className="text-sm font-semibold text-text-secondary mb-2">Analysis</h4>
                            <p className="text-sm text-text-primary leading-relaxed">
                                {claim.entailment.reasoning}
                            </p>
                        </div>

                        {/* Confidence Bar */}
                        <div>
                            <div className="flex justify-between text-xs text-text-secondary mb-1">
                                <span>Confidence Level</span>
                                <span>{Math.round(claim.entailment.confidence * 100)}%</span>
                            </div>
                            <div className="h-2 bg-bg-tertiary rounded-full overflow-hidden">
                                <div
                                    className={`h-full ${color.replace('border-l-', 'bg-')} transition-all duration-500`}
                                    style={{ width: `${claim.entailment.confidence * 100}%` }}
                                />
                            </div>
                        </div>

                        {/* Evidence Sources */}
                        {claim.evidence && claim.evidence.length > 0 && (
                            <div>
                                <h4 className="text-sm font-semibold text-text-secondary mb-2">
                                    Evidence Sources ({claim.evidence.length})
                                </h4>
                                <div className="space-y-2">
                                    {claim.evidence.slice(0, 3).map((source, idx) => (
                                        <a
                                            key={idx}
                                            href={source.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block p-3 bg-bg-tertiary/50 rounded-lg hover:bg-bg-tertiary transition-colors group"
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-primary-400 group-hover:text-primary-300 truncate">
                                                        {source.title}
                                                    </p>
                                                    <p className="text-xs text-text-secondary mt-1 line-clamp-2">
                                                        {source.snippet}
                                                    </p>
                                                </div>
                                                <svg className="w-4 h-4 text-text-secondary flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                </svg>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    const renderSection = (
        title: string,
        icon: string,
        count: number,
        claims: ClaimVerification[],
        sectionKey: 'verified' | 'contradicted' | 'unverified',
        color: string,
        emptyMessage: string
    ) => {
        const isExpanded = expandedSection === sectionKey;

        return (
            <div className="mb-4">
                <button
                    onClick={() => toggleSection(sectionKey)}
                    className="w-full flex items-center justify-between p-4 bg-bg-secondary rounded-lg hover:bg-bg-tertiary transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">{icon}</span>
                        <div className="text-left">
                            <h3 className="text-lg font-bold text-text-primary">{title}</h3>
                            <p className="text-sm text-text-secondary">{count} claim{count !== 1 ? 's' : ''}</p>
                        </div>
                    </div>
                    <svg
                        className={`w-6 h-6 text-text-secondary transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {isExpanded && (
                    <div className="mt-3 animate-slide-up">
                        {claims.length === 0 ? (
                            <div className="p-6 text-center bg-bg-secondary/30 rounded-lg">
                                <p className="text-text-secondary">{emptyMessage}</p>
                            </div>
                        ) : (
                            <div>
                                {claims.map((claim, idx) => renderClaimCard(claim, idx, color, icon))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-4 mt-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-text-primary">Detailed Analysis</h2>
                <button
                    onClick={() => setExpandedSection(expandedSection ? null : 'contradicted')}
                    className="text-sm text-primary-400 hover:text-primary-300 font-medium"
                >
                    {expandedSection ? 'Collapse All' : 'Expand All'}
                </button>
            </div>

            {renderSection(
                'Contradicted Claims',
                '✕',
                contradictedClaims.length,
                contradictedClaims,
                'contradicted',
                'border-l-red-500',
                '🎉 No false claims detected!'
            )}

            {renderSection(
                'Unverified Claims',
                '⚠',
                unverifiedClaims.length,
                unverifiedClaims,
                'unverified',
                'border-l-yellow-500',
                'All claims have been verified!'
            )}

            {renderSection(
                'Verified Claims',
                '✓',
                verifiedClaims.length,
                verifiedClaims,
                'verified',
                'border-l-green-500',
                'No verified claims found.'
            )}
        </div>
    );
}

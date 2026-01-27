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
        publishedDate?: string;
        author?: string;
    }>;
    entailment: {
        verdict: 'entailment' | 'contradiction' | 'neutral' | 'verifying';
        confidence: number;
        reasoning: string;
    };
}

interface EvidencePanelProps {
    claim: ClaimVerification | null;
}

export default function EvidencePanel({ claim }: EvidencePanelProps) {
    if (!claim) {
        return (
            <div className="flex items-center justify-center h-full text-text-secondary">
                <div className="text-center">
                    <svg
                        className="w-16 h-16 mx-auto mb-4 opacity-50"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                    <p>Click on a highlighted claim to view evidence</p>
                </div>
            </div>
        );
    }

    const getVerdictColor = (verdict: string) => {
        switch (verdict) {
            case 'entailment':
                return 'text-verified';
            case 'contradiction':
                return 'text-contradicted';
            default:
                return 'text-neutral';
        }
    };

    const getVerdictLabel = (verdict: string) => {
        switch (verdict) {
            case 'entailment':
                return 'Verified';
            case 'contradiction':
                return 'Contradicted';
            default:
                return 'Unverified';
        }
    };

    return (
        <div className="space-y-4">
            {/* Claim Info */}
            <div>
                <h3 className="text-xl font-bold mb-2">Claim Analysis</h3>
                <div className="bg-bg-secondary p-4 rounded-lg">
                    <p className="text-text-primary mb-3">{claim.claim.text}</p>
                    <div className="flex items-center gap-4 text-sm">
                        <span className="text-text-secondary">Type: {claim.claim.type}</span>
                        <span className={`font-bold ${getVerdictColor(claim.entailment.verdict)}`}>
                            {getVerdictLabel(claim.entailment.verdict)} ({claim.entailment.confidence}%)
                        </span>
                    </div>
                </div>
            </div>

            {/* Reasoning */}
            <div>
                <h4 className="font-semibold mb-2">Analysis</h4>
                <div className="bg-bg-secondary p-4 rounded-lg">
                    <p className="text-text-secondary text-sm">{claim.entailment.reasoning}</p>
                </div>
            </div>

            {/* Evidence Sources */}
            <div>
                <h4 className="font-semibold mb-2">Evidence Sources ({(claim.evidence || []).length})</h4>
                {(!claim.evidence || claim.evidence.length === 0) ? (
                    <div className="bg-bg-secondary p-4 rounded-lg text-text-secondary text-sm">
                        No evidence sources found for this claim
                    </div>
                ) : (
                    <div className="space-y-3">
                        {(claim.evidence || []).map((source, idx) => (
                            <div key={idx} className="bg-bg-secondary p-4 rounded-lg hover:bg-bg-tertiary transition-colors">
                                <div className="flex items-start justify-between mb-2">
                                    <h5 className="font-medium text-text-primary flex-1 line-clamp-2">
                                        {source.title}
                                    </h5>
                                    <span className="text-xs text-text-secondary ml-2">
                                        {Math.round(source.score * 100)}%
                                    </span>
                                </div>
                                <p className="text-sm text-text-secondary mb-3 line-clamp-3">
                                    {source.snippet}
                                </p>
                                <div className="flex items-center justify-between">
                                    <a
                                        href={source.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1"
                                    >
                                        View Source
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                    </a>
                                    {source.publishedDate && (
                                        <span className="text-xs text-text-secondary">
                                            {new Date(source.publishedDate).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

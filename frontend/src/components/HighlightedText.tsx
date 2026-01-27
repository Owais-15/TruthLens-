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

interface HighlightedTextProps {
    text: string;
    claims: ClaimVerification[];
    onClaimClick: (claim: ClaimVerification) => void;
    selectedClaim: ClaimVerification | null;
}

export default function HighlightedText({ text, claims, onClaimClick, selectedClaim }: HighlightedTextProps) {
    // Sort claims by start index to process in order
    const sortedClaims = [...claims].sort((a, b) => a.claim.startIndex - b.claim.startIndex);

    // Build highlighted text with spans
    const buildHighlightedText = () => {
        const elements: JSX.Element[] = [];
        let lastIndex = 0;

        sortedClaims.forEach((claimVerification, idx) => {
            const { startIndex, endIndex } = claimVerification.claim;
            const { verdict } = claimVerification.entailment;

            // Add text before this claim
            if (startIndex > lastIndex) {
                elements.push(
                    <span key={`text-${idx}`}>
                        {text.substring(lastIndex, startIndex)}
                    </span>
                );
            }

            // Add highlighted claim
            const claimText = text.substring(startIndex, endIndex);
            const isSelected = selectedClaim?.claim.text === claimVerification.claim.text;

            let highlightClass = 'highlight-neutral';
            if (verdict === 'entailment') {
                highlightClass = 'highlight-verified';
            } else if (verdict === 'contradiction') {
                highlightClass = 'highlight-contradicted';
            } else if (verdict === 'verifying') {
                highlightClass = 'highlight-verifying';
            }

            elements.push(
                <span
                    key={`claim-${idx}`}
                    className={`${highlightClass} ${isSelected ? 'ring-2 ring-primary-500' : ''}`}
                    onClick={() => onClaimClick(claimVerification)}
                    title={verdict === 'verifying' ? 'Verification in progress...' : `${verdict} (${claimVerification.entailment.confidence}% confidence)`}
                >
                    {claimText}
                    {verdict === 'verifying' && (
                        <span className="ml-1 inline-block w-2 h-2 bg-primary-500 rounded-full animate-pulse"></span>
                    )}
                </span>
            );

            lastIndex = endIndex;
        });

        // Add remaining text
        if (lastIndex < text.length) {
            elements.push(
                <span key="text-end">
                    {text.substring(lastIndex)}
                </span>
            );
        }

        return elements;
    };

    return (
        <div className="bg-bg-secondary p-4 rounded-lg">
            <div className="prose prose-invert max-w-none">
                <p className="text-text-primary leading-relaxed whitespace-pre-wrap">
                    {buildHighlightedText()}
                </p>
            </div>

            {/* Legend */}
            <div className="mt-6 pt-4 border-t border-glass-border">
                <p className="text-sm font-medium mb-2 text-text-secondary">Legend:</p>
                <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <span className="highlight-verified px-2 py-1">Verified</span>
                        <span className="text-text-secondary">Evidence supports claim</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="highlight-contradicted px-2 py-1">Contradicted</span>
                        <span className="text-text-secondary">Evidence contradicts claim</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="highlight-neutral px-2 py-1">Unverified</span>
                        <span className="text-text-secondary">Insufficient evidence</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="highlight-verifying px-2 py-1">
                            Verifying
                            <span className="ml-1 inline-block w-2 h-2 bg-primary-500 rounded-full animate-pulse"></span>
                        </span>
                        <span className="text-text-secondary">Verification in progress</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

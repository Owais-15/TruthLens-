import { useState } from 'react';
import HighlightedText from './HighlightedText';
import EvidencePanel from './EvidencePanel';
import TrustScoreDisplay from './TrustScoreDisplay';

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

interface VerificationResult {
    trustScore: number;
    claims: ClaimVerification[];
    processingTime: number;
    summary: {
        totalClaims: number;
        verified: number;
        contradicted: number;
        unverified: number;
    };
}

export default function VerificationInterface() {
    const [inputText, setInputText] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [result, setResult] = useState<VerificationResult | null>(null);
    const [error, setError] = useState('');
    const [selectedClaim, setSelectedClaim] = useState<ClaimVerification | null>(null);
    const [phase, setPhase] = useState<1 | 2 | null>(null);
    const [verifyingCount, setVerifyingCount] = useState(0);

    const handleVerify = async () => {
        if (!inputText.trim()) {
            setError('Please enter some text to verify');
            return;
        }

        if (inputText.length < 10) {
            setError('Text must be at least 10 characters');
            return;
        }

        setIsVerifying(true);
        setError('');
        setResult(null);
        setSelectedClaim(null);
        setPhase(null);

        try {
            // Use progressive SSE endpoint with fetch
            const token = localStorage.getItem('accessToken');
            const response = await fetch('http://localhost:3000/api/verify/progressive', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ text: inputText }),
            });

            if (!response.ok) {
                throw new Error('Verification failed');
            }

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();

            if (!reader) {
                throw new Error('No response body');
            }

            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();

                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = JSON.parse(line.slice(6));

                        if (data.type === 'phase1') {
                            // Phase 1: Show immediate results
                            setPhase(1);

                            // Map backend structure to frontend interface
                            const mappedClaims = data.claims.map((c: any) => ({
                                claim: c.claim,
                                evidence: c.evidence,
                                entailment: {
                                    verdict: c.verdict,
                                    confidence: c.confidence,
                                    reasoning: c.reasoning
                                }
                            }));

                            const phase1Result = {
                                trustScore: data.preliminaryTrustScore,
                                claims: mappedClaims,
                                processingTime: data.processingTime,
                                summary: calculateSummary(mappedClaims),
                            };
                            setResult(phase1Result);
                            setVerifyingCount(mappedClaims.filter((c: any) => c.entailment.verdict === 'verifying').length);
                        } else if (data.type === 'phase2') {
                            // Phase 2: Update claim progressively
                            setPhase(2);
                            setResult(prev => {
                                if (!prev) return null;

                                const updatedClaims = [...prev.claims];
                                // Map backend result to frontend interface
                                updatedClaims[data.claimIndex] = {
                                    claim: data.result.claim,
                                    evidence: data.result.evidence,
                                    entailment: {
                                        verdict: data.result.verdict,
                                        confidence: data.result.confidence,
                                        reasoning: data.result.reasoning
                                    }
                                };

                                return {
                                    trustScore: data.updatedTrustScore,
                                    claims: updatedClaims,
                                    processingTime: prev.processingTime,
                                    summary: calculateSummary(updatedClaims),
                                };
                            });
                            setVerifyingCount(prev => Math.max(0, prev - 1));
                        } else if (data.type === 'complete') {
                            // Verification complete
                            setIsVerifying(false);
                            setPhase(null);
                            setVerifyingCount(0);
                        } else if (data.type === 'error') {
                            setError(data.error);
                            setIsVerifying(false);
                        }
                    }
                }
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.error || err.message || 'Verification failed';
            setError(errorMessage);
            setIsVerifying(false);
        }
    };

    const calculateSummary = (claims: ClaimVerification[]) => {
        return {
            totalClaims: claims.length,
            verified: claims.filter(c => c.entailment.verdict === 'entailment').length,
            contradicted: claims.filter(c => c.entailment.verdict === 'contradiction').length,
            unverified: claims.filter(c => c.entailment.verdict === 'neutral' || c.entailment.verdict === 'verifying').length,
        };
    };

    const handleClaimClick = (claim: ClaimVerification) => {
        setSelectedClaim(claim);
    };

    return (
        <div className="space-y-6">
            {/* Input Section */}
            <div className="glass-card p-6 animate-slide-up">
                <h2 className="text-2xl font-bold mb-4">Verify AI-Generated Content</h2>
                <p className="text-text-secondary mb-6">
                    Paste AI-generated text below to check for hallucinations and verify factual accuracy.
                </p>

                <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Enter text to verify (10-5000 characters)..."
                    className="w-full h-40 px-4 py-3 bg-bg-secondary border border-glass-border rounded-lg resize-none focus:ring-2 focus:ring-primary-500 transition-all"
                    disabled={isVerifying}
                />

                <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-text-secondary">
                        {inputText.length} / 5000 characters
                    </p>
                    <button
                        onClick={handleVerify}
                        disabled={isVerifying || !inputText.trim()}
                        className="btn-primary"
                    >
                        {isVerifying ? (
                            <span className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                {phase === 1 ? 'Quick Check...' : phase === 2 ? `Verifying ${verifyingCount} claims...` : 'Verifying...'}
                            </span>
                        ) : (
                            'Verify Text'
                        )}
                    </button>
                </div>

                {error && (
                    <div className="mt-4 bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                {/* Progressive Status */}
                {isVerifying && phase && (
                    <div className="mt-4 bg-primary-500/10 border border-primary-500/50 text-primary-400 px-4 py-3 rounded-lg text-sm">
                        {phase === 1 && '⚡ Phase 1: Quick verification complete! Showing preliminary results...'}
                        {phase === 2 && `🔄 Phase 2: Deep verification in progress (${verifyingCount} claims remaining)...`}
                    </div>
                )}
            </div>

            {/* Results Section */}
            {result && (
                <>
                    {/* Trust Score */}
                    <div className="glass-card p-6 animate-fade-in">
                        <TrustScoreDisplay
                            trustScore={result.trustScore}
                            summary={result.summary}
                            processingTime={result.processingTime}
                        />
                        {phase === 2 && verifyingCount > 0 && (
                            <div className="mt-4 text-sm text-text-secondary flex items-center gap-2">
                                <div className="w-3 h-3 border-2 border-primary-500/50 border-t-primary-500 rounded-full animate-spin"></div>
                                Trust score updating as verification completes...
                            </div>
                        )}
                    </div>

                    {/* Highlighted Text and Evidence */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Highlighted Text */}
                        <div className="glass-card p-6 animate-fade-in">
                            <h3 className="text-xl font-bold mb-4">Verified Text</h3>
                            <HighlightedText
                                text={inputText}
                                claims={result.claims}
                                onClaimClick={handleClaimClick}
                                selectedClaim={selectedClaim}
                            />
                        </div>

                        {/* Evidence Panel */}
                        <div className="glass-card p-6 animate-fade-in">
                            <EvidencePanel claim={selectedClaim} />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

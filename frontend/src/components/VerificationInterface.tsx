import { useState } from 'react';
import HighlightedText from './HighlightedText';
import EvidencePanel from './EvidencePanel';
import TrustScoreDisplay from './TrustScoreDisplay';
import ClaimDetailsPanel from './ClaimDetailsPanel';
import PDFExport from './PDFExport';

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

// Example texts for quick testing
const EXAMPLE_TEXTS = [
    {
        name: "High Trust Example",
        text: "The Eiffel Tower, located in Paris, France, was completed in 1889 and stands approximately 300 meters tall. It was designed by engineer Gustave Eiffel and was initially built as the entrance arch for the 1889 World's Fair."
    },
    {
        name: "Mixed Trust Example",
        text: "Albert Einstein developed the theory of relativity in 1905 and won the Nobel Prize in Physics in 1921. He was born in Germany in 1879 and later became a professor at Princeton University in New Jersey."
    },
    {
        name: "Low Trust Example",
        text: "The Eiffel Tower, a remarkable iron lattice structure standing proudly in Paris, was originally built as a giant sundial in 1822, intended to cast shadows across the city to mark the hours. Designed by the renowned architect Gustave Eiffel, the tower stands 330 meters tall and once housed the city's first observatory."
    }
];

export default function VerificationInterface() {
    const [inputText, setInputText] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [result, setResult] = useState<VerificationResult | null>(null);
    const [error, setError] = useState('');
    const [selectedClaim, setSelectedClaim] = useState<ClaimVerification | null>(null);
    const [phase, setPhase] = useState<1 | 2 | null>(null);
    const [verifyingCount, setVerifyingCount] = useState(0);
    const [loadingMessage, setLoadingMessage] = useState('');

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
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
            const response = await fetch(`${API_URL}/verify/progressive`, {
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

    const loadExample = (index: number) => {
        setInputText(EXAMPLE_TEXTS[index].text);
        setResult(null);
        setError('');
    };

    const clearText = () => {
        setInputText('');
        setResult(null);
        setError('');
        setSelectedClaim(null);
    };

    const getCharacterCountColor = () => {
        const length = inputText.length;
        if (length > 4500) return 'text-red-400';
        if (length > 3500) return 'text-yellow-400';
        return 'text-text-secondary';
    };

    return (
        <div className="space-y-6">
            {/* Input Section */}
            <div className="glass-card p-6 animate-slide-up">
                <h2 className="text-2xl font-bold mb-2">Verify AI-Generated Content</h2>
                <p className="text-text-secondary mb-6">
                    Paste AI-generated text below to check for hallucinations and verify factual accuracy.
                    <br />
                    <span className="text-xs">✨ Tip: Longer texts (100+ words) give more accurate results</span>
                </p>

                {/* Example Texts Buttons */}
                <div className="flex flex-wrap gap-2 mb-4">
                    <span className="text-xs font-semibold text-text-secondary flex items-center">TRY AN EXAMPLE:</span>
                    {EXAMPLE_TEXTS.map((example, index) => (
                        <button
                            key={index}
                            onClick={() => loadExample(index)}
                            disabled={isVerifying}
                            className="px-3 py-1.5 text-xs font-medium bg-bg-secondary hover:bg-bg-tertiary border border-glass-border rounded-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {example.name}
                        </button>
                    ))}
                </div>

                {/* Textarea with Clear Button */}
                <div className="relative">
                    <textarea
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Paste AI-generated content here...&#10;&#10;Example: Try pasting ChatGPT responses, article summaries, or any AI-written text to check for hallucinations."
                        className="w-full h-40 px-4 py-3 bg-bg-secondary border border-glass-border rounded-lg resize-none focus:ring-2 focus:ring-primary-500 transition-all text-white placeholder-gray-400"
                        disabled={isVerifying}
                    />
                    {inputText && !isVerifying && (
                        <button
                            onClick={clearText}
                            className="absolute top-3 right-3 text-text-secondary hover:text-red-400 transition-colors"
                            title="Clear text"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>

                <div className="flex items-center justify-between mt-4">
                    <p className={`text-sm font-medium ${getCharacterCountColor()}`}>
                        {inputText.length} / 5000 characters
                    </p>
                    <button
                        onClick={handleVerify}
                        disabled={isVerifying || !inputText.trim()}
                        className="btn-primary px-6 py-3 hover:scale-105 transition-transform disabled:hover:scale-100"
                    >
                        {isVerifying ? (
                            <span className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                {phase === 1 ? 'Analyzing claims...' : phase === 2 ? `Verifying ${verifyingCount} claims...` : 'Processing...'}
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Verify Text
                            </span>
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

                    {/* PDF Export Button */}
                    <div className="flex justify-end mt-6 animate-fade-in">
                        <PDFExport
                            originalText={inputText}
                            trustScore={result.trustScore}
                            claims={result.claims}
                            summary={result.summary}
                            processingTime={result.processingTime}
                        />
                    </div>

                    {/* Detailed Claim Analysis */}
                    <div className="glass-card p-6 animate-fade-in">
                        <ClaimDetailsPanel claims={result.claims} />
                    </div>
                </>
            )}
        </div>
    );
}

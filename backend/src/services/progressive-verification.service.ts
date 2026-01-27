import { GoogleGenerativeAI } from '@google/generative-ai';
import { EvidenceRetrievalService, EvidenceSource } from './evidence-retrieval.service';
import { EntailmentClassifierService } from './entailment-classifier.service';
import { ClaimImportanceAnalyzer } from './claim-importance.service';
import { AtomicClaim } from './claim-extractor.service';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-2.5-flash' });

export interface ProgressiveClaimResult {
    claim: AtomicClaim;
    verdict: 'entailment' | 'contradiction' | 'neutral' | 'verifying';
    confidence: number;
    reasoning: string;
    evidence?: EvidenceSource[];
    importance?: number;
    phase: 1 | 2;
}

export interface Phase1Result {
    claims: ProgressiveClaimResult[];
    preliminaryTrustScore: number;
    phase: 1;
    processingTime: number;
}

export interface Phase2Update {
    claimIndex: number;
    result: ProgressiveClaimResult;
    updatedTrustScore: number;
    phase: 2;
}

/**
 * Progressive Verification Service
 * Phase 1: Quick results with knowledge base
 * Phase 2: Deep verification with streaming updates
 */
export class ProgressiveVerificationService {
    // Simple knowledge base for instant verification
    private static knownFacts = new Map<string, { verdict: 'entailment' | 'contradiction', confidence: number }>([
        // Historical facts
        ['eiffel tower completed 1889', { verdict: 'entailment', confidence: 95 }],
        ['eiffel tower built 1889', { verdict: 'entailment', confidence: 95 }],
        ['world war 2 ended 1945', { verdict: 'entailment', confidence: 95 }],
        ['first moon landing 1969', { verdict: 'entailment', confidence: 95 }],

        // Scientific facts
        ['earth orbits sun', { verdict: 'entailment', confidence: 100 }],
        ['water boils 100 celsius', { verdict: 'entailment', confidence: 95 }],
        ['speed of light 299792458', { verdict: 'entailment', confidence: 95 }],

        // Geographic facts
        ['paris capital france', { verdict: 'entailment', confidence: 100 }],
        ['mount everest tallest mountain', { verdict: 'entailment', confidence: 95 }],
    ]);

    /**
     * Phase 1: Quick verification with knowledge base
     * Returns preliminary results in 2-3 seconds
     */
    static async phase1QuickVerification(text: string): Promise<Phase1Result> {
        const startTime = Date.now();
        const { RateLimitHandler } = require('./rate-limit-handler.service');

        // Extract claims using Gemini
        const claims = await RateLimitHandler.executeWithRetry(async () => {
            const prompt = `Extract atomic claims from this text. Return JSON only:
{
  "claims": [
    {"text": "claim text", "type": "factual|numerical|temporal", "startIndex": 0, "endIndex": 10}
  ]
}

Text: """${text}"""`;

            const result = await model.generateContent(prompt);
            const responseText = result.response.text();
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (!jsonMatch) throw new Error('Failed to parse claims');

            const parsed = JSON.parse(jsonMatch[0]);
            return parsed.claims || [];
        });

        // Quick check against knowledge base
        const results: ProgressiveClaimResult[] = claims.map((claim: AtomicClaim) => {
            const normalized = this.normalizeForKnowledgeBase(claim.text);
            const knownFact = this.knownFacts.get(normalized);

            if (knownFact) {
                // Known fact - instant verification
                return {
                    claim,
                    verdict: knownFact.verdict,
                    confidence: knownFact.confidence,
                    reasoning: 'Verified against knowledge base (instant)',
                    phase: 1 as const,
                };
            } else {
                // Unknown - mark as verifying
                return {
                    claim,
                    verdict: 'verifying' as const,
                    confidence: 0,
                    reasoning: 'Deep verification in progress...',
                    phase: 1 as const,
                };
            }
        });

        // Calculate preliminary trust score (only from known facts)
        const verifiedClaims = results.filter(r => r.verdict !== 'verifying');
        const preliminaryTrustScore = verifiedClaims.length > 0
            ? Math.round(verifiedClaims.reduce((sum, r) => {
                if (r.verdict === 'entailment') return sum + r.confidence;
                if (r.verdict === 'contradiction') return sum - r.confidence;
                return sum;
            }, 0) / verifiedClaims.length)
            : 50;

        return {
            claims: results,
            preliminaryTrustScore: Math.max(0, Math.min(100, preliminaryTrustScore)),
            phase: 1,
            processingTime: Date.now() - startTime,
        };
    }

    /**
     * Phase 2: Deep verification with streaming
     * Yields updates as each claim completes
     * Optimization: Process in batches for better throughput
     */
    static async* phase2DeepVerification(
        phase1Results: Phase1Result
    ): AsyncGenerator<Phase2Update> {
        const claimsToVerify = phase1Results.claims.filter(r => r.verdict === 'verifying');
        const verifiedClaims = [...phase1Results.claims.filter(r => r.verdict !== 'verifying')];

        // Optimizations:
        // 1. Process 4 claims at a time (Higher Concurrency)
        // 2. Add robust error handling (Fault Tolerance)
        const BATCH_SIZE = 4;

        for (let i = 0; i < claimsToVerify.length; i += BATCH_SIZE) {
            const batch = claimsToVerify.slice(i, i + BATCH_SIZE);

            // Process batch concurrently
            const batchPromises = batch.map(async (claimResult) => {
                try {
                    // Retrieve evidence
                    const evidence = await EvidenceRetrievalService.retrieveEvidence(claimResult.claim.text);

                    // Classify entailment
                    const entailment = await EntailmentClassifierService.classifyWithThreshold(
                        claimResult.claim.text,
                        evidence
                    );

                    // Calculate importance
                    // Fixed: Use correct class name and method
                    const importanceAnalysis = ClaimImportanceAnalyzer.analyzeImportance(claimResult.claim.text);

                    return {
                        originalResult: claimResult,
                        success: true,
                        updatedResult: {
                            claim: claimResult.claim,
                            verdict: entailment.verdict,
                            confidence: entailment.confidence,
                            reasoning: entailment.reasoning,
                            evidence,
                            importance: importanceAnalysis.weight,
                            phase: 2 as const,
                        }
                    };
                } catch (error) {
                    console.error(`Error verifying claim "${claimResult.claim.text}":`, error);
                    // Return neutral result on error instead of crashing the whole stream
                    return {
                        originalResult: claimResult,
                        success: false,
                        updatedResult: {
                            claim: claimResult.claim,
                            verdict: 'neutral' as const,
                            confidence: 0,
                            reasoning: 'Verification unavailable for this claim (temporary error)',
                            evidence: [],
                            importance: 1.0,
                            phase: 2 as const,
                        }
                    };
                }
            });

            // Wait for batch to complete
            const batchResults = await Promise.all(batchPromises);

            // Yield results one by one to maintain streaming order
            for (const res of batchResults) {
                const claimIndex = phase1Results.claims.indexOf(res.originalResult);

                // Add to verified claims for trust score calculation
                verifiedClaims.push(res.updatedResult as ProgressiveClaimResult);

                // Calculate updated trust score
                const updatedTrustScore = this.calculateWeightedTrustScore(verifiedClaims as ProgressiveClaimResult[]);

                yield {
                    claimIndex,
                    result: res.updatedResult as ProgressiveClaimResult,
                    updatedTrustScore,
                    phase: 2,
                };
            }

            // Minimal rate limiting delay between batches (1 second)
            // This is safer than 0s to prevent 429 errors from Google
            if (i + BATCH_SIZE < claimsToVerify.length) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
    }

    /**
     * Calculate weighted trust score
     * IMPROVED: Excludes 'neutral' claims from the score so they don't drag it down.
     * Score reflects reliability of verified information only.
     */
    private static calculateWeightedTrustScore(results: ProgressiveClaimResult[]): number {
        // Filter out verifying and neutral results for the core score calculation
        const scorableResults = results.filter(r =>
            r.verdict === 'entailment' || r.verdict === 'contradiction'
        );

        // If no scorable results yet (e.g. only neutral), return the result of calculation on empty set?
        // Actually, if we have 5 neutral claims, trust score should be roughly 50 (Uncertain) or N/A.
        // Let's stick to 50 if neutral.
        if (scorableResults.length === 0) {
            return results.length > 0 ? 50 : 0;
        }

        let weightedSum = 0;
        let totalWeight = 0;
        const confidenceThreshold = 70;

        for (const result of scorableResults) {
            const importance = result.importance || 1.0;
            const { verdict, confidence } = result;

            // Indicator function: 1 if confidence >= threshold, 0 otherwise
            const indicator = confidence >= confidenceThreshold ? 1 : 0;

            let score = 0;
            if (verdict === 'entailment') {
                score = confidence * indicator;
            } else if (verdict === 'contradiction') {
                score = -confidence * indicator;
            }

            weightedSum += score * importance;
            totalWeight += importance;
        }

        if (totalWeight === 0) return 50;

        // Normalize to 0-100 range
        const maxPossibleScore = totalWeight * 100;
        const normalizedScore = ((weightedSum + maxPossibleScore) / (2 * maxPossibleScore)) * 100;

        return Math.max(0, Math.min(100, Math.round(normalizedScore)));
    }

    /**
     * Normalize claim text for knowledge base lookup
     */
    private static normalizeForKnowledgeBase(text: string): string {
        return text
            .toLowerCase()
            .replace(/[^\w\s]/g, '') // Remove punctuation
            .replace(/\s+/g, ' ') // Normalize whitespace
            .trim()
            .replace(/the |a |an |is |was |were |are |in |on |at /g, ''); // Remove common words
    }
}

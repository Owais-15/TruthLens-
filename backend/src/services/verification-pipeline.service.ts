import { ClaimExtractorService, AtomicClaim } from './claim-extractor.service';
import { EvidenceRetrievalService, EvidenceSource } from './evidence-retrieval.service';
import { EntailmentClassifierService, EntailmentResult } from './entailment-classifier.service';

export interface ClaimVerification {
    claim: AtomicClaim;
    evidence: EvidenceSource[];
    entailment: EntailmentResult;
}

export interface VerificationResult {
    inputText: string;
    trustScore: number; // 0-100
    claims: ClaimVerification[];
    processingTime: number; // milliseconds
    summary: {
        totalClaims: number;
        verified: number;
        contradicted: number;
        unverified: number;
    };
}

export class VerificationPipelineService {
    /**
     * Run the complete verification pipeline
     */
    static async verify(text: string): Promise<VerificationResult> {
        const startTime = Date.now();

        try {
            // Stage 1: Extract atomic claims
            const claims = await ClaimExtractorService.extractClaimsWithRetry(text);

            if (claims.length === 0) {
                return {
                    inputText: text,
                    trustScore: 0,
                    claims: [],
                    processingTime: Date.now() - startTime,
                    summary: {
                        totalClaims: 0,
                        verified: 0,
                        contradicted: 0,
                        unverified: 0,
                    },
                };
            }

            // Stage 2: Retrieve evidence for each claim
            const evidenceMap = await EvidenceRetrievalService.batchRetrieveEvidence(
                claims.map(c => c.text)
            );

            // Stage 3: Classify entailment for each claim
            const claimsWithEvidence = claims.map(claim => ({
                claim: claim.text,
                evidence: evidenceMap.get(claim.text) || [],
            }));

            const entailmentResults = await EntailmentClassifierService.batchClassify(claimsWithEvidence);

            // Combine results
            const verifications: ClaimVerification[] = claims.map((claim, idx) => ({
                claim,
                evidence: evidenceMap.get(claim.text) || [],
                entailment: entailmentResults[idx],
            }));

            // Calculate trust score and summary
            const summary = this.calculateSummary(verifications);
            const trustScore = this.calculateTrustScore(verifications);

            return {
                inputText: text,
                trustScore,
                claims: verifications,
                processingTime: Date.now() - startTime,
                summary,
            };
        } catch (error) {
            console.error('Verification pipeline error:', error);
            throw new Error('Verification failed');
        }
    }

    /**
     * Calculate weighted aggregate trust score
     * Implements research paper algorithm: T = (Σ w_i * I(c_i ≥ τ) * score_i) / (Σ w_i)
     * where w_i = importance weight, I = indicator function, τ = confidence threshold
     */
    private static calculateTrustScore(verifications: ClaimVerification[]): number {
        if (verifications.length === 0) return 0;

        const { ClaimImportanceAnalyzer } = require('./claim-importance.service');

        let weightedSum = 0;
        let totalWeight = 0;
        const CONFIDENCE_THRESHOLD = 70; // τ = 0.7 (70%)

        for (const verification of verifications) {
            const { verdict, confidence } = verification.entailment;
            const claimText = verification.claim.text;

            // Calculate importance weight w_i for this claim
            const importance = ClaimImportanceAnalyzer.analyzeImportance(claimText);
            const weight = importance.weight;

            // Indicator function I(c_i ≥ τ): only count high-confidence claims fully
            if (confidence >= CONFIDENCE_THRESHOLD) {
                if (verdict === 'entailment') {
                    weightedSum += weight * confidence;
                    totalWeight += weight;
                } else if (verdict === 'contradiction') {
                    weightedSum -= weight * confidence;
                    totalWeight += weight;
                }
                // Neutral claims don't contribute
            } else {
                // Low confidence claims contribute with reduced weight
                if (verdict === 'entailment') {
                    weightedSum += weight * confidence * 0.5;
                } else if (verdict === 'contradiction') {
                    weightedSum -= weight * confidence * 0.5;
                }
                totalWeight += weight * 0.5;
            }
        }

        // Avoid division by zero
        if (totalWeight === 0) return 50;

        // Normalize weighted sum to 0-100 range
        const maxPossibleScore = totalWeight * 100;
        const normalizedScore = ((weightedSum + maxPossibleScore) / (2 * maxPossibleScore)) * 100;

        return Math.max(0, Math.min(100, Math.round(normalizedScore)));
    }

    /**
     * Calculate summary statistics
     */
    private static calculateSummary(verifications: ClaimVerification[]) {
        const summary = {
            totalClaims: verifications.length,
            verified: 0,
            contradicted: 0,
            unverified: 0,
        };

        for (const verification of verifications) {
            const { verdict } = verification.entailment;

            if (verdict === 'entailment') {
                summary.verified++;
            } else if (verdict === 'contradiction') {
                summary.contradicted++;
            } else {
                summary.unverified++;
            }
        }

        return summary;
    }

    /**
     * Verify with timeout
     */
    static async verifyWithTimeout(text: string, timeoutMs = 30000): Promise<VerificationResult> {
        return Promise.race([
            this.verify(text),
            new Promise<VerificationResult>((_, reject) =>
                setTimeout(() => reject(new Error('Verification timeout')), timeoutMs)
            ),
        ]);
    }
}

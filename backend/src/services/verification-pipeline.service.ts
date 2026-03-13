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
     * Calculate aggregate trust score based on entailment verdicts and confidence.
     */
    private static calculateTrustScore(verifications: ClaimVerification[]): number {
        if (verifications.length === 0) return 0;

        let totalScore = 0;
        let validClaims = 0;

        for (const verification of verifications) {
            const { verdict, confidence } = verification.entailment;
            
            // Map verdicts to a 0-100 scale where Entailment is 100, Contradiction is 0
            if (verdict === 'entailment') {
                // High confidence entailment = high trust
                totalScore += (50 + (confidence / 2)); 
                validClaims++;
            } else if (verdict === 'contradiction') {
                // High confidence contradiction = low trust
                totalScore += (50 - (confidence / 2));
                validClaims++;
            } else {
                // Neutral claims minimally affect the score
                totalScore += 50; 
                validClaims++;
            }
        }

        if (validClaims === 0) return 50;

        const averageScore = totalScore / validClaims;
        return Math.max(0, Math.min(100, Math.round(averageScore)));
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

import Groq from 'groq-sdk';
import { EvidenceSource } from './evidence-retrieval.service';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' });
const DEFAULT_MODEL = 'llama-3.1-8b-instant';

export interface EntailmentResult {
    verdict: 'entailment' | 'contradiction' | 'neutral';
    confidence: number; // 0-100
    reasoning: string;
}

export class EntailmentClassifierService {
    /**
     * Classify the relationship between a claim and evidence
     */
    static async classify(claim: string, evidence: EvidenceSource[]): Promise<EntailmentResult> {
        const { RateLimitHandler } = require('./rate-limit-handler.service');

        return RateLimitHandler.executeWithRetry(async () => {
            try {
                // If no evidence found, return neutral
                if (!evidence || evidence.length === 0) {
                    return {
                        verdict: 'neutral',
                        confidence: 0,
                        reasoning: 'No evidence found to verify this claim',
                    };
                }

                // Prepare evidence context
                const evidenceContext = evidence
                    .slice(0, 3) // Use top 3 sources
                    .map((e, idx) => `[Source ${idx + 1}] ${e.title}\n${e.snippet}\nURL: ${e.url}`)
                    .join('\n\n');

                const prompt = `You are an advanced Natural Language Inference (NLI) system with cross-attention capabilities.

TASK: Perform semantic entailment classification using cross-attention between claim and evidence.

CLAIM:
"""
${claim}
"""

EVIDENCE:
"""
${evidenceContext}
"""

CRITICAL INSTRUCTIONS:
1. **Thorough Text Analysis**: Carefully read ALL the evidence text, not just titles or URLs
2. **Extract Key Facts**: Look for specific facts, dates, numbers, and names mentioned in the evidence text
3. **Cross-Attention Analysis**: Map semantic relationships between claim tokens and evidence tokens
4. **Semantic Understanding**: Recognize synonyms and paraphrases (e.g., "completed" = "finished" = "built", "1889" = "eighteen eighty-nine")
5. **Be Precise**: If the evidence text contains the exact information needed to verify the claim, classify as entailment

CLASSIFICATION RULES:
- **entailment**: Evidence text EXPLICITLY contains information that supports the claim
  * The specific facts, dates, or numbers in the claim are present in the evidence
  * Authoritative source confirmation
  * High confidence (≥75%)
  
- **contradiction**: Evidence text EXPLICITLY contains information that refutes the claim
  * Direct factual conflict with the claim
  * Authoritative source refutation
  * High confidence (≥75%)
  
- **neutral**: Evidence is insufficient or ambiguous
  * The evidence text doesn't contain the specific information needed
  * Confidence below 75%
  * Evidence is tangentially related but not directly confirmatory

CONFIDENCE SCORING:
- 90-100: Multiple sources with exact matching facts
- 75-89: Clear support from reliable sources with specific details
- 50-74: Partial or indirect evidence
- 0-49: Weak or missing evidence

IMPORTANT: Read the full evidence text carefully. If it contains the specific information from the claim (like dates, numbers, names), that's strong evidence for entailment.

OUTPUT FORMAT (JSON):
{
  "verdict": "entailment|contradiction|neutral",
  "confidence": 85,
  "reasoning": "Detailed explanation citing specific facts found (or not found) in the evidence text"
}

Classify now:`;

                const modelName = process.env.GROQ_MODEL || DEFAULT_MODEL;
                const completion = await groq.chat.completions.create({
                    messages: [{ role: 'user', content: prompt }],
                    model: modelName,
                    temperature: 0.2, // Very low for factual classification
                    max_tokens: 500,
                });

                const responseText = completion.choices[0]?.message?.content || '';

                // Parse JSON response
                const jsonMatch = responseText.match(/\{[\s\S]*\}/);
                if (!jsonMatch) {
                    console.error('Failed to parse Groq response:', responseText);
                    throw new Error('Failed to parse entailment classification response');
                }

                const parsed = JSON.parse(jsonMatch[0]);

                // Validate verdict
                const validVerdicts = ['entailment', 'contradiction', 'neutral'];
                if (!validVerdicts.includes(parsed.verdict)) {
                    parsed.verdict = 'neutral';
                }

                // Ensure confidence is in valid range
                const confidence = Math.max(0, Math.min(100, parsed.confidence || 0));

                return {
                    verdict: parsed.verdict,
                    confidence,
                    reasoning: parsed.reasoning || 'No reasoning provided',
                };
            } catch (error) {
                console.error('Entailment classification error:', error);
                throw error; // Let RateLimitHandler handle retries
            }
        });
    }

    /**
     * Classify with confidence threshold
     */
    static async classifyWithThreshold(
        claim: string,
        evidence: EvidenceSource[],
        threshold = 70
    ): Promise<EntailmentResult> {
        const result = await this.classify(claim, evidence);

        // If confidence is below threshold, downgrade to neutral
        if (result.confidence < threshold && result.verdict !== 'neutral') {
            return {
                verdict: 'neutral',
                confidence: result.confidence,
                reasoning: `${result.reasoning} (Confidence below threshold)`,
            };
        }

        return result;
    }

    /**
     * Batch classify multiple claims with smart rate limiting
     */
    static async batchClassify(
        claimsWithEvidence: Array<{ claim: string; evidence: EvidenceSource[] }>
    ): Promise<EntailmentResult[]> {
        const results: EntailmentResult[] = [];

        // Process sequentially with delays to avoid rate limiting
        for (const { claim, evidence } of claimsWithEvidence) {
            const result = await this.classifyWithThreshold(claim, evidence);
            results.push(result);

            // Strategic delay: 1 second between requests to stay within rate limits
            // Gemini free tier: 15 requests/minute = 1 request every 4 seconds safe
            // Using 1 second as balance between speed and safety
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        return results;
    }
}

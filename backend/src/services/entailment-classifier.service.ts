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

                const prompt = `You are a highly accurate Natural Language Inference (NLI) judge. Your job is to determine if a CLAIM is supported, contradicted, or unverifiable based on EVIDENCE and your general world knowledge.

CLAIM:
"""
${claim}
"""

EVIDENCE (from web search):
"""
${evidenceContext}
"""

STEP-BY-STEP ANALYSIS - follow these steps carefully:

STEP 1 - Extract key facts from the CLAIM:
  - Identify all specific entities (people, places, organizations)
  - Identify all numbers, dates, measurements
  - Identify all relationships stated

STEP 2 - Check each fact against EVIDENCE and WORLD KNOWLEDGE:
  - Does the evidence explicitly confirm the fact?
  - Does the evidence explicitly contradict the fact?
  - Is the fact a well-known fact you know is wrong (e.g., Paris is NOT in England)?

STEP 3 - Apply these classification rules:

**CONTRADICTION** - Use this when ANY of the following:
  - Evidence states a different date/number/measurement than the claim
  - Evidence states a different location/country/city than the claim  
  - Evidence states a different person/organization than the claim
  - The claim states a geographic fact that is clearly wrong (e.g., "Eiffel Tower is in London" - it's in Paris)
  - The claim states a historical fact that is clearly wrong
  - Confidence: 75-99%

**ENTAILMENT** - Use this when:
  - Evidence explicitly confirms the specific facts stated in the claim
  - Multiple sources agree with the claim
  - Confidence: 75-99%

**NEUTRAL** - ONLY use this when:
  - The evidence genuinely doesn't mention the specific topic at all
  - AND you have no general world knowledge to classify it
  - Confidence: 0-74%
  - NOTE: If the claim contains an obviously wrong geographic or historical fact, use CONTRADICTION not NEUTRAL

IMPORTANT: Geographic facts like "The Eiffel Tower is in London" are CONTRADICTIONS (it's in Paris, France). Use your world knowledge!

OUTPUT FORMAT (JSON only, no other text):
{
  "verdict": "entailment|contradiction|neutral",
  "confidence": 85,
  "reasoning": "Step 1: Claim says X. Step 2: Evidence says Y / My knowledge says Z. Step 3: Therefore VERDICT because..."
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

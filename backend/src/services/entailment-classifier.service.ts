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

                const prompt = `You are a highly accurate Natural Language Inference (NLI) judge. Your job is to determine if a CLAIM is supported, contradicted, or unverifiable based on EVIDENCE.

CLAIM:
"""
${claim}
"""

EVIDENCE (from web search):
"""
${evidenceContext}
"""

STEP-BY-STEP ANALYSIS:

STEP 1 - Extract key facts:
  - What exact numbers, dates, locations, and names are in the CLAIM?

STEP 2 - Compare with EVIDENCE:
  - Does the evidence confirm these exact facts?
  - Does the evidence explicitly state DIFFERENT facts (e.g. claim says 1889, evidence says 1822)?

STEP 3 - Apply strict classification rules:

**CONTRADICTION** (Only use for undeniable factual conflicts):
  - The evidence MUST state a fact that makes the claim mathematically or historically impossible.
  - Examples of CONTRADICTION: Different dates, different numbers, different cities for the same event.
  - DO NOT flag as contradiction if the evidence is just missing a detail. Missing details are NEUTRAL.
  - DO NOT flag as contradiction for minor phrasing differences (e.g. "standing proudly" vs "located").

**ENTAILMENT** (Supported):
  - The evidence confirms the core facts (names, dates, numbers) of the claim.
  - It does not need to use the exact same words, but the facts must align perfectly.

**NEUTRAL** (Unverified):
  - The evidence is discussing something else entirely.
  - The evidence mentions the topic but does not contain the specific fact (date/number) to verify the claim.

OUTPUT FORMAT (JSON only, no other text):
{
  "verdict": "entailment|contradiction|neutral",
  "confidence": 85,
  "reasoning": "Keep this under 2 sentences. State what the claim facts are vs what the evidence facts are."
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

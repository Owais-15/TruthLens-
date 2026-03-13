import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' });
const DEFAULT_MODEL = 'llama-3.1-8b-instant';

export interface AtomicClaim {
    text: string;
    type: string; // factual, numerical, temporal, etc.
    startIndex: number;
    endIndex: number;
}

export class ClaimExtractorService {
    /**
     * Extract atomic claims from input text using Groq API (Llama 3.1)
     */
    static async extractClaims(text: string): Promise<AtomicClaim[]> {
        const { RateLimitHandler } = require('./rate-limit-handler.service');
        const { redisService } = require('./redis.service');
        const crypto = require('crypto');

        return RateLimitHandler.executeWithRetry(async () => {
            try {
                // 1. Generate Cache Key
                const textHash = crypto.createHash('sha256').update(text).digest('hex');
                const cacheKey = `claims:${textHash}`;

                // 2. Check Cache
                const cachedClaims = await redisService.get(cacheKey);
                if (cachedClaims) {
                    console.log('Cache Hit: Claims found in Redis');
                    return cachedClaims;
                }

                const prompt = `You are a precise fact-checking assistant. Extract individual verifiable facts from the text below.

RULES:
1. Each claim must be a SINGLE atomic fact (one subject + one predicate + one object)
2. Extract ONLY factual assertions - skip opinions, questions, commands
3. The "text" field MUST be an EXACT substring copied from the INPUT TEXT (copy-paste word-for-word)
4. DO NOT paraphrase or rewrite - copy the exact words from the input
5. startIndex and endIndex are the character positions of "text" within the INPUT TEXT
6. Claim types: factual, numerical, temporal, location, causal, or entity

INPUT TEXT:
"""
${text}
"""

OUTPUT FORMAT (JSON) - return ONLY this JSON, no other text:
{
  "claims": [
    {
      "text": "exact verbatim substring from input text",
      "type": "claim type",
      "startIndex": 0,
      "endIndex": 20
    }
  ]
}

IMPORTANT: Double-check that each "text" value is an exact copy from the input. Extract all atomic claims:`;

                const modelName = process.env.GROQ_MODEL || DEFAULT_MODEL;
                const completion = await groq.chat.completions.create({
                    messages: [
                        { role: 'system', content: 'You are a fact-checking assistant that extracts verifiable claims from text. Always output valid JSON only.' },
                        { role: 'user', content: prompt }
                    ],
                    model: modelName,
                    temperature: 0.1, // Very low for deterministic extraction
                    max_tokens: 2000,
                });

                const responseText = completion.choices[0]?.message?.content || '';

                // Parse JSON response
                const jsonMatch = responseText.match(/\{[\s\S]*\}/);
                if (!jsonMatch) {
                    console.error('Failed to parse Groq response:', responseText);
                    throw new Error('Failed to parse claim extraction response');
                }

                const parsed = JSON.parse(jsonMatch[0]);

                // Validate and return claims
                if (!parsed.claims || !Array.isArray(parsed.claims)) {
                    throw new Error('Invalid claim extraction response format');
                }

                const formattedClaims = parsed.claims
                    .map((claim: any) => {
                        const claimText = claim.text || '';
                        if (!claimText) return null;

                        // Find exact match in original text for precise highlighting
                        const { start, end } = this.findExactSpan(text, claimText, claim.startIndex || 0);

                        return {
                            text: claimText,
                            type: claim.type || 'factual',
                            startIndex: start,
                            endIndex: end,
                        };
                    })
                    .filter(Boolean) as any[];

                // 3. Save to Cache (TTL: 24 hours)
                await redisService.set(cacheKey, formattedClaims, 86400);

                return formattedClaims;
            } catch (error) {
                console.error('Claim extraction error:', error);
                throw error; // Let RateLimitHandler handle retries
            }
        });
    }

    /**
     * Find the exact character span of a claim text within the original text.
     * Uses verbatim match first, then fuzzy fallback.
     */
    private static findExactSpan(text: string, claimText: string, hintStart: number): { start: number, end: number } {
        if (!text || !claimText) return { start: 0, end: 0 };

        // 1. Try exact match near hinted position
        const exactIdx = text.indexOf(claimText, Math.max(0, hintStart - 50));
        if (exactIdx !== -1) {
            return { start: exactIdx, end: exactIdx + claimText.length };
        }

        // 2. Try exact match from beginning (LLM might give wrong index)
        const exactIdxFull = text.indexOf(claimText);
        if (exactIdxFull !== -1) {
            return { start: exactIdxFull, end: exactIdxFull + claimText.length };
        }

        // 3. Try case-insensitive match
        const lowerText = text.toLowerCase();
        const lowerClaim = claimText.toLowerCase();
        const caseIdx = lowerText.indexOf(lowerClaim);
        if (caseIdx !== -1) {
            return { start: caseIdx, end: caseIdx + claimText.length };
        }

        // 4. Partial match fallback: find the first 5 words of claim in text
        const firstFewWords = claimText.split(' ').slice(0, 5).join(' ');
        const partialIdx = lowerText.indexOf(firstFewWords.toLowerCase());
        if (partialIdx !== -1) {
            return { start: partialIdx, end: Math.min(partialIdx + claimText.length, text.length) };
        }

        // 5. Use hinted position as last resort
        return { start: hintStart, end: Math.min(hintStart + claimText.length, text.length) };
    }

    /**
     * Extract claims with retry logic
     */
    static async extractClaimsWithRetry(text: string, maxRetries = 2): Promise<AtomicClaim[]> {
        let lastError: Error | null = null;

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                return await this.extractClaims(text);
            } catch (error) {
                lastError = error as Error;
                if (attempt < maxRetries) {
                    // Wait before retry (exponential backoff)
                    await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
                }
            }
        }

        throw lastError || new Error('Failed to extract claims after retries');
    }
}

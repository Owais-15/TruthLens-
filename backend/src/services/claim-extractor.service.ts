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

                const prompt = `You are a precise fact-checking assistant. Your task is to decompose the following text into atomic, verifiable claims.

INSTRUCTIONS:
1. Extract ONLY factual assertions (not opinions, questions, or commands)
2. Each claim must be isolated and independently verifiable
3. Preserve the exact wording from the original text
4. Identify the claim type: factual, numerical, temporal, causal, or comparative
5. Provide character-level start and end indices for each claim in the original text

INPUT TEXT:
"""
${text}
"""

OUTPUT FORMAT (JSON):
{
  "claims": [
    {
      "text": "exact claim text from input",
      "type": "claim type",
      "startIndex": 0,
      "endIndex": 20
    }
  ]
}

Extract all atomic claims now:`;

                const modelName = process.env.GROQ_MODEL || DEFAULT_MODEL;
                const completion = await groq.chat.completions.create({
                    messages: [{ role: 'user', content: prompt }],
                    model: modelName,
                    temperature: 0.3,
                    max_tokens: 1500,
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

                const formattedClaims = parsed.claims.map((claim: any) => {
                    // Snap indices to full sentences for better highlighting
                    const indices = this.snapToSentence(text, claim.startIndex || 0, claim.endIndex || 0);
                    return {
                        text: claim.text || '',
                        type: claim.type || 'factual',
                        startIndex: indices.start,
                        endIndex: indices.end,
                    };
                });

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
     * Snap start/end indices to the nearest sentence boundaries
     */
    private static snapToSentence(text: string, start: number, end: number): { start: number, end: number } {
        if (!text || start < 0 || end > text.length) {
            return { start, end };
        }

        // Find start of sentence (look backwards for punctuation or start of string)
        let newStart = start;
        // Search backwards with a safety limit of 500 chars
        let charsChecked = 0;
        while (newStart > 0 && charsChecked < 500) {
            const char = text[newStart - 1];
            // If punctuation followed by space (or just punctuation), it's likely end of prev sentence
            // We check for [.!?]
            if (/[.!?]/.test(char)) {
                // Determine if it's a real sentence break (simple heuristic: followed by space)
                // If we are at index `start`, we want to go back to the beginning of THIS sentence.
                // The PREVIOUS sentence ended at `char`.
                break;
            }
            newStart--;
            charsChecked++;
        }

        // Trim leading whitespace
        while (newStart < text.length && /\s/.test(text[newStart])) {
            newStart++;
        }

        // Find end of sentence (look forwards for punctuation)
        let newEnd = end;
        charsChecked = 0;
        while (newEnd < text.length && charsChecked < 500) {
            const char = text[newEnd];
            newEnd++; // Include the character we are checking

            if (/[.!?]/.test(char)) {
                break;
            }
            charsChecked++;
        }

        // Validate: if expansion looks too wild (e.g. > 500 chars), revert to original
        if (newEnd - newStart > 500) {
            return { start, end };
        }

        return { start: newStart, end: newEnd };
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

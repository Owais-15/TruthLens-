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

                const prompt = `You are an expert fact-checker. Your task is to identify specific sentences or phrases within the text that contain verifiable facts (numbers, dates, proper nouns, historical events, scientific claims).

CRITICAL RULE: You must extract EXACT QUOTES from the text. The "text" field must be a flawless, character-for-character copy-paste from the INPUT TEXT. Do not paraphrase even a single word.

INPUT TEXT:
"""
${text}
"""

OUTPUT FORMAT (JSON only):
{
  "claims": [
    {
      "text": "<EXACT QUOTE FROM TEXT CONTAINING A FACT>",
      "type": "factual | numerical | temporal | location | entity"
    }
  ]
}

Extract the quotes now:`;

                const modelName = process.env.GROQ_MODEL || DEFAULT_MODEL;
                const completion = await groq.chat.completions.create({
                    messages: [
                        { role: 'system', content: 'You are a strict JSON-only API that extracts exact quotes from text.' },
                        { role: 'user', content: prompt }
                    ],
                    model: modelName,
                    temperature: 0.0, // Force completely deterministic extraction
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

                if (!parsed.claims || !Array.isArray(parsed.claims)) {
                    throw new Error('Invalid claim extraction response format');
                }

                let lastEndIndex = 0;
                
                const formattedClaims = parsed.claims
                    .map((claim: any) => {
                        const claimText = claim.text?.trim() || '';
                        if (!claimText || claimText.length < 5) return null;

                        // Find exact match in original text for mathematically perfect highlighting!
                        const { start, end } = this.findExactSpan(text, claimText, lastEndIndex);
                        
                        // If we couldn't find it, the LLM hallucinated the quote. Skip it.
                        if (start === -1) return null;
                        
                        // Prevent overlapping highlights by ensuring this claim starts after the last one ended
                        // (or at least doesn't fully overlap)
                        lastEndIndex = Math.max(lastEndIndex, end);

                        return {
                            text: text.substring(start, end), // Use the ACTUAL text from the input, not the LLM's version
                            type: claim.type || 'factual',
                            startIndex: start,
                            endIndex: end,
                        };
                    })
                    .filter(Boolean) as any[];

                // Remove duplicates that might have the exact same start/end index
                const uniqueClaims = Array.from(new Map(formattedClaims.map(item => [item.startIndex, item])).values());

                // 3. Save to Cache (TTL: 24 hours)
                await redisService.set(cacheKey, uniqueClaims, 86400);

                return uniqueClaims;
            } catch (error) {
                console.error('Claim extraction error:', error);
                throw error; // Let RateLimitHandler handle retries
            }
        });
    }

    /**
     * Find the exact character span of a string within the original text.
     * Uses a robust sliding window to handle minor whitespace/punctuation differences
     * the LLM might have introduced, guaranteeing we find the true text span.
     */
    private static findExactSpan(originalText: string, searchPhrase: string, startIndexHint = 0): { start: number, end: number } {
        if (!originalText || !searchPhrase) return { start: -1, end: -1 };

        // 1. Try a pure, exact literal match first (fastest)
        let idx = originalText.indexOf(searchPhrase, startIndexHint);
        if (idx !== -1) {
            return { start: idx, end: idx + searchPhrase.length };
        }
        
        // Try exact match from the beginning if hint failed
        idx = originalText.indexOf(searchPhrase);
        if (idx !== -1) {
            return { start: idx, end: idx + searchPhrase.length };
        }

        // 2. Normalize both strings (remove all punctuation, lowercase, normalize spaces)
        const normalize = (str: string) => str.toLowerCase().replace(/[^\w\s]|_/g, "").replace(/\s+/g, " ").trim();
        
        const normOriginal = normalize(originalText);
        const normSearch = normalize(searchPhrase);
        
        // If we still can't find the normalized phrase in the normalized text, we bail.
        const normIdx = normOriginal.indexOf(normSearch);
        if (normIdx === -1) return { start: -1, end: -1 };

        // 3. Sliding Window alignment
        // We know the words exist in order. We need to map the normalized index back to the exact original characters.
        const searchWords = normSearch.split(' ');
        if (searchWords.length === 0) return { start: -1, end: -1 };

        const firstWord = searchWords[0];
        const lastWord = searchWords[searchWords.length - 1];

        // Find the first occurrence of the first word (case-insensitive) in the original text
        const regexFirst = new RegExp(`\\b${firstWord}\\b`, 'i');
        const matchFirst = originalText.slice(startIndexHint).match(regexFirst) || originalText.match(regexFirst);
        
        if (!matchFirst || matchFirst.index === undefined) return { start: -1, end: -1 };
        
        const trueStart = (originalText.slice(startIndexHint).match(regexFirst) ? startIndexHint + matchFirst.index : matchFirst.index);

        // From that start point, look forward for the last word
        const substringRemaining = originalText.slice(trueStart);
        const regexLast = new RegExp(`\\b${lastWord}\\b`, 'i');
        
        // Find all matches of the last word
        let match;
        const lastWordRegexGlobal = new RegExp(`\\b${lastWord}\\b`, 'gi');
        let trueEnd = -1;
        
        // We want the match that makes the total character length roughly similar to the search phrase length
        while ((match = lastWordRegexGlobal.exec(substringRemaining)) !== null) {
             const potentialEnd = trueStart + match.index + lastWord.length;
             const lengthDiff = Math.abs((potentialEnd - trueStart) - searchPhrase.length);
             
             // If the length is within 20% of the expected length, it's our match
             if (lengthDiff < searchPhrase.length * 0.2) {
                 trueEnd = potentialEnd;
                 break;
             }
        }

        if (trueEnd !== -1) {
            // Include trailing punctuation if it exists for cleaner highlighting
            while (trueEnd < originalText.length && /[.,!?;:]/.test(originalText[trueEnd])) {
                trueEnd++;
            }
            return { start: trueStart, end: trueEnd };
        }

        return { start: -1, end: -1 };
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

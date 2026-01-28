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

        return RateLimitHandler.executeWithRetry(async () => {
            try {
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

                return parsed.claims.map((claim: any) => ({
                    text: claim.text || '',
                    type: claim.type || 'factual',
                    startIndex: claim.startIndex || 0,
                    endIndex: claim.endIndex || 0,
                }));
            } catch (error) {
                console.error('Claim extraction error:', error);
                throw error; // Let RateLimitHandler handle retries
            }
        });
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

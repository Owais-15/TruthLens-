import Exa from 'exa-js';

const exa = new Exa(process.env.EXA_API_KEY || '');

export interface EvidenceSource {
    url: string;
    title: string;
    snippet: string;
    publishedDate?: string;
    author?: string;
    score: number;
}

export class EvidenceRetrievalService {
    /**
     * Retrieve evidence for a claim using Exa Search API
     */
    static async retrieveEvidence(claim: string): Promise<EvidenceSource[]> {
        const { redisService } = require('./redis.service');
        const crypto = require('crypto');

        try {
            // 1. Check Cache
            const queryHash = crypto.createHash('sha256').update(claim).digest('hex');
            const cacheKey = `evidence:${queryHash}`;

            const cachedEvidence = await redisService.get(cacheKey);
            if (cachedEvidence) {
                console.log('Cache Hit: Evidence found in Redis');
                return cachedEvidence;
            }

            // Optimize claim for search
            const searchQuery = this.optimizeSearchQuery(claim);

            // Search using Exa's neural search with enhanced content retrieval
            const searchResults = await exa.searchAndContents(searchQuery, {
                numResults: 5,
                useAutoprompt: true,
                type: 'neural',
                text: {
                    maxCharacters: 1500, // Increased from 500 for more context
                    includeHtmlTags: false
                },
                highlights: {
                    numSentences: 5, // Increased from 3 for more relevant excerpts
                    highlightsPerUrl: 3, // Get multiple highlights per source
                    query: claim, // Use original claim for targeted highlighting
                },
            });

            // Transform results to evidence sources
            const evidence: EvidenceSource[] = searchResults.results.map((result: any) => ({
                url: result.url || '',
                title: result.title || '',
                snippet: result.text || result.highlights?.[0] || '',
                publishedDate: result.publishedDate || undefined,
                author: result.author || undefined,
                score: result.score || 0,
            }));

            // Filter out low-quality sources
            return evidence.filter(e => e.score > 0.3);
        } catch (error) {
            console.error('Evidence retrieval error:', error);
            // Return empty array instead of throwing to allow graceful degradation
            return [];
        }
    }

    /**
     * Optimize claim text for search query
     */
    private static optimizeSearchQuery(claim: string): string {
        // Remove filler words and optimize for search
        const fillerWords = ['the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being'];

        const words = claim.toLowerCase().split(/\s+/);
        const optimized = words
            .filter(word => !fillerWords.includes(word) && word.length > 2)
            .join(' ');

        return optimized || claim;
    }

    /**
     * Retrieve evidence with caching
     */
    static async retrieveEvidenceWithCache(claim: string): Promise<EvidenceSource[]> {
        // TODO: Implement Redis caching in future version
        // For now, just call the retrieval directly
        return this.retrieveEvidence(claim);
    }

    /**
     * Batch retrieve evidence for multiple claims
     */
    static async batchRetrieveEvidence(claims: string[]): Promise<Map<string, EvidenceSource[]>> {
        const results = new Map<string, EvidenceSource[]>();

        // Process claims concurrently (with limit to avoid rate limiting)
        const batchSize = 3;
        for (let i = 0; i < claims.length; i += batchSize) {
            const batch = claims.slice(i, i + batchSize);
            const promises = batch.map(claim =>
                this.retrieveEvidence(claim).then(evidence => ({ claim, evidence }))
            );

            const batchResults = await Promise.all(promises);
            batchResults.forEach(({ claim, evidence }) => {
                results.set(claim, evidence);
            });

            // Small delay between batches to respect rate limits
            if (i + batchSize < claims.length) {
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }

        return results;
    }
}

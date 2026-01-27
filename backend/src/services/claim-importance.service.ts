/**
 * Advanced Claim Importance Analyzer
 * Implements importance weighting for proper nouns, numbers, and factual claims
 */

export interface ClaimImportance {
    weight: number; // 0.5 to 2.0
    hasProperNoun: boolean;
    hasNumber: boolean;
    hasDate: boolean;
    complexity: 'simple' | 'medium' | 'complex';
}

export class ClaimImportanceAnalyzer {
    /**
     * Calculate importance weight for a claim
     * Higher weights for proper nouns, numbers, dates (more objective/verifiable)
     */
    static analyzeImportance(claimText: string): ClaimImportance {
        const analysis: ClaimImportance = {
            weight: 1.0,
            hasProperNoun: false,
            hasNumber: false,
            hasDate: false,
            complexity: 'medium',
        };

        // Detect proper nouns (capitalized words not at sentence start)
        const properNounPattern = /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g;
        const properNouns = claimText.match(properNounPattern) || [];
        analysis.hasProperNoun = properNouns.length > 0;

        // Detect numbers and statistics
        const numberPattern = /\b\d+(?:,\d{3})*(?:\.\d+)?\b/g;
        const numbers = claimText.match(numberPattern) || [];
        analysis.hasNumber = numbers.length > 0;

        // Detect dates (years, full dates)
        const datePattern = /\b(19|20)\d{2}\b|\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b/gi;
        const dates = claimText.match(datePattern) || [];
        analysis.hasDate = dates.length > 0;

        // Calculate importance weight using research paper formula
        let weight = 1.0;

        // Proper nouns increase weight (names, places are highly verifiable)
        if (analysis.hasProperNoun) {
            weight += 0.4;
        }

        // Numbers and statistics are objective facts
        if (analysis.hasNumber) {
            weight += 0.3;
        }

        // Dates are highly verifiable
        if (analysis.hasDate) {
            weight += 0.3;
        }

        // Complexity scoring
        const wordCount = claimText.split(/\s+/).length;
        if (wordCount <= 5) {
            analysis.complexity = 'simple';
            weight *= 0.9; // Simple claims might be less informative
        } else if (wordCount > 15) {
            analysis.complexity = 'complex';
            weight *= 1.1; // Complex claims carry more information
        }

        // Clamp weight to reasonable range [0.5, 2.0]
        analysis.weight = Math.max(0.5, Math.min(2.0, weight));

        return analysis;
    }

    /**
     * Determine if a claim is simple enough for knowledge base lookup
     */
    static isSimpleFact(claimText: string): boolean {
        const wordCount = claimText.split(/\s+/).length;
        const hasProperNoun = /\b[A-Z][a-z]+\b/.test(claimText);
        const hasNumber = /\b\d+\b/.test(claimText);

        // Simple facts: short, with proper nouns or numbers
        return wordCount <= 8 && (hasProperNoun || hasNumber);
    }
}

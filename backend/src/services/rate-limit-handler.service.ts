/**
 * Rate Limit Handler for Gemini API
 * Implements exponential backoff and retry logic for 429 errors
 */

export class RateLimitHandler {
    /**
     * Execute a function with automatic retry on rate limit errors
     */
    static async executeWithRetry<T>(
        fn: () => Promise<T>,
        maxRetries = 3,
        initialDelay = 2000
    ): Promise<T> {
        let lastError: any = null;

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                return await fn();
            } catch (error: any) {
                lastError = error;

                // Check if it's a rate limit error (429)
                const isRateLimitError =
                    error?.status === 429 ||
                    error?.statusText === 'Too Many Requests' ||
                    error?.message?.includes('429') ||
                    error?.message?.includes('Too Many Requests');

                if (isRateLimitError && attempt < maxRetries) {
                    // Extract retry delay from error if available
                    let retryDelay = initialDelay * Math.pow(2, attempt);

                    // Check if API provides a retry-after value
                    if (error?.errorDetails) {
                        const retryInfo = error.errorDetails.find(
                            (detail: any) => detail['@type']?.includes('RetryInfo')
                        );
                        if (retryInfo?.retryDelay) {
                            // Parse delay like "17s" to milliseconds
                            const delayMatch = retryInfo.retryDelay.match(/(\d+)s/);
                            if (delayMatch) {
                                retryDelay = parseInt(delayMatch[1]) * 1000;
                            }
                        }
                    }

                    console.log(
                        `Rate limit hit. Retrying in ${retryDelay / 1000}s (attempt ${attempt + 1}/${maxRetries})...`
                    );

                    await new Promise(resolve => setTimeout(resolve, retryDelay));
                    continue;
                }

                // If not a rate limit error or max retries reached, throw
                throw error;
            }
        }

        throw lastError;
    }

    /**
     * Add a strategic delay based on request count
     */
    static async smartDelay(requestCount: number): Promise<void> {
        // Gemini free tier: 15 requests/minute
        // Safe rate: 1 request every 4-5 seconds
        const baseDelay = 1000; // 1 second base

        // Increase delay as we make more requests
        let delay = baseDelay;
        if (requestCount > 5) {
            delay = 2000; // 2 seconds after 5 requests
        }
        if (requestCount > 10) {
            delay = 3000; // 3 seconds after 10 requests
        }

        await new Promise(resolve => setTimeout(resolve, delay));
    }
}

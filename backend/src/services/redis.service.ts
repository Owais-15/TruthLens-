import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

class RedisService {
    private client: Redis | null = null;
    private isConnected = false;

    constructor() {
        try {
            this.client = new Redis(REDIS_URL, {
                lazyConnect: true,
                retryStrategy: (times) => {
                    // Retry up to 3 times, then stop to avoid spamming logs
                    if (times > 3) {
                        return null;
                    }
                    return Math.min(times * 50, 2000);
                },
            });

            this.client.on('connect', () => {
                this.isConnected = true;
                console.log('Redis connected successfully');
            });

            this.client.on('error', (err) => {
                this.isConnected = false;
                // Suppress connection refused errors in development if valid functionality continues
                if (err.message.includes('ECONNREFUSED')) {
                    // console.warn('Redis connection failed - caching disabled');
                } else {
                    console.error('Redis Client Error:', err);
                }
            });

            // Attempt connection but don't crash if it fails
            this.client.connect().catch(() => {
                // Connection failed handled by 'error' listener
            });
        } catch (error) {
            console.error('Failed to initialize Redis client:', error);
        }
    }

    /**
     * Get value from cache
     */
    async get<T>(key: string): Promise<T | null> {
        if (!this.client || !this.isConnected) return null;

        try {
            const data = await this.client.get(key);
            if (!data) return null;
            return JSON.parse(data) as T;
        } catch (error) {
            console.error(`Redis get error for key ${key}:`, error);
            return null;
        }
    }

    /**
     * Set value in cache with TTL
     * @param ttlSeconds Time to live in seconds (default: 3600 = 1 hour)
     */
    async set(key: string, value: any, ttlSeconds: number = 3600): Promise<void> {
        if (!this.client || !this.isConnected) return;

        try {
            const serialized = JSON.stringify(value);
            await this.client.set(key, serialized, 'EX', ttlSeconds);
        } catch (error) {
            console.error(`Redis set error for key ${key}:`, error);
        }
    }

    /**
     * Delete value from cache
     */
    async del(key: string): Promise<void> {
        if (!this.client || !this.isConnected) return;

        try {
            await this.client.del(key);
        } catch (error) {
            console.error(`Redis del error for key ${key}:`, error);
        }
    }
}

export const redisService = new RedisService();

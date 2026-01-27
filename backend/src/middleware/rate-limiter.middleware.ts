import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';

// Rate limiter for authentication endpoints
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per window
    message: 'Too many authentication attempts, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limiter for verification endpoints (tier-based)
export const verificationLimiter = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        // Get user's verification usage from database
        const { db } = await import('../db');
        const { users } = await import('../db/schema');
        const { eq } = await import('drizzle-orm');

        const [userData] = await db.select().from(users).where(eq(users.id, user.userId));

        if (!userData) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if user has exceeded their limit
        if (userData.verificationsUsed >= userData.verificationsLimit) {
            return res.status(429).json({
                error: 'Verification limit exceeded',
                limit: userData.verificationsLimit,
                used: userData.verificationsUsed,
                tier: userData.tier,
            });
        }

        next();
    } catch (error) {
        console.error('Rate limiter error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// General API rate limiter
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: 'Too many requests, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
});

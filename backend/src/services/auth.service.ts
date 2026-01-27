import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from '../db';
import { users, type NewUser, type User } from '../db/schema';
import { eq } from 'drizzle-orm';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '10');

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

export interface TokenPayload {
    userId: number;
    email: string;
    tier: string;
}

export class AuthService {
    /**
     * Register a new user
     */
    static async register(email: string, password: string, name?: string): Promise<{ user: User; tokens: AuthTokens }> {
        // Check if user already exists
        const existingUser = await db.query.users.findFirst({
            where: eq(users.email, email),
        });

        if (existingUser) {
            throw new Error('User already exists');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

        // Create user
        const [newUser] = await db.insert(users).values({
            email,
            password: hashedPassword,
            name,
            tier: 'free',
            verificationsUsed: 0,
            verificationsLimit: 100,
        } as any).returning();

        // Generate tokens
        const tokens = this.generateTokens(newUser);

        return { user: newUser, tokens };
    }

    /**
     * Login user
     */
    static async login(email: string, password: string): Promise<{ user: User; tokens: AuthTokens }> {
        // Find user
        const user = await db.query.users.findFirst({
            where: eq(users.email, email),
        });

        if (!user) {
            throw new Error('Invalid credentials');
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            throw new Error('Invalid credentials');
        }

        // Generate tokens
        const tokens = this.generateTokens(user);

        return { user, tokens };
    }

    /**
     * Generate JWT tokens
     */
    static generateTokens(user: User): AuthTokens {
        const payload: TokenPayload = {
            userId: user.id,
            email: user.email,
            tier: user.tier,
        };

        const accessToken = jwt.sign(payload, JWT_SECRET, {
            expiresIn: JWT_EXPIRES_IN,
        });

        const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, {
            expiresIn: JWT_REFRESH_EXPIRES_IN,
        });

        return { accessToken, refreshToken };
    }

    /**
     * Verify access token
     */
    static verifyAccessToken(token: string): TokenPayload {
        try {
            return jwt.verify(token, JWT_SECRET) as TokenPayload;
        } catch (error) {
            throw new Error('Invalid or expired token');
        }
    }

    /**
     * Verify refresh token
     */
    static verifyRefreshToken(token: string): TokenPayload {
        try {
            return jwt.verify(token, JWT_REFRESH_SECRET) as TokenPayload;
        } catch (error) {
            throw new Error('Invalid or expired refresh token');
        }
    }

    /**
     * Refresh access token
     */
    static async refreshAccessToken(refreshToken: string): Promise<AuthTokens> {
        const payload = this.verifyRefreshToken(refreshToken);

        // Get user to ensure they still exist
        const user = await db.query.users.findFirst({
            where: eq(users.id, payload.userId),
        });

        if (!user) {
            throw new Error('User not found');
        }

        return this.generateTokens(user);
    }

    /**
     * Get user by ID
     */
    static async getUserById(userId: number): Promise<User | undefined> {
        return db.query.users.findFirst({
            where: eq(users.id, userId),
        });
    }
}

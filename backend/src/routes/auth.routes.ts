import { Router } from 'express';
import { AuthService } from '../services/auth.service';
import { authenticate } from '../middleware/auth.middleware';
import { authLimiter } from '../middleware/rate-limiter.middleware';
import { registerValidation, loginValidation, validate, sanitizeInput } from '../middleware/validation.middleware';

const router = Router();

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post(
    '/register',
    authLimiter,
    sanitizeInput,
    registerValidation,
    validate,
    async (req, res) => {
        try {
            const { email, password, name } = req.body;
            const result = await AuthService.register(email, password, name);

            // Don't send password in response
            const { password: _, ...userWithoutPassword } = result.user;

            res.status(201).json({
                user: userWithoutPassword,
                tokens: result.tokens,
            });
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === 'User already exists') {
                    return res.status(409).json({ error: error.message });
                }
            }
            console.error('Registration error:', error);
            res.status(500).json({ error: 'Registration failed' });
        }
    }
);

/**
 * POST /api/auth/login
 * Login user
 */
router.post(
    '/login',
    authLimiter,
    sanitizeInput,
    loginValidation,
    validate,
    async (req, res) => {
        try {
            const { email, password } = req.body;
            const result = await AuthService.login(email, password);

            // Don't send password in response
            const { password: _, ...userWithoutPassword } = result.user;

            res.json({
                user: userWithoutPassword,
                tokens: result.tokens,
            });
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === 'Invalid credentials') {
                    return res.status(401).json({ error: error.message });
                }
            }
            console.error('Login error:', error);
            res.status(500).json({ error: 'Login failed' });
        }
    }
);

/**
 * POST /api/auth/refresh
 * Refresh access token
 */
router.post('/refresh', async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({ error: 'Refresh token required' });
        }

        const tokens = await AuthService.refreshAccessToken(refreshToken);
        res.json({ tokens });
    } catch (error) {
        console.error('Token refresh error:', error);
        res.status(401).json({ error: 'Invalid or expired refresh token' });
    }
});

/**
 * GET /api/auth/me
 * Get current user
 */
router.get('/me', authenticate, async (req, res) => {
    try {
        const user = await AuthService.getUserById(req.user!.userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Don't send password in response
        const { password: _, ...userWithoutPassword } = user;

        res.json({ user: userWithoutPassword });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to get user' });
    }
});

/**
 * PUT /api/auth/profile
 * Update user profile
 */
router.put('/profile', authenticate, async (req, res) => {
    try {
        const { name } = req.body;

        if (!name || typeof name !== 'string' || name.trim().length < 2) {
            return res.status(400).json({ error: 'Valid name is required (min 2 chars)' });
        }

        const updatedUser = await AuthService.updateProfile(req.user!.userId, name);

        // Don't send password in response
        const { password: _, ...userWithoutPassword } = updatedUser;

        res.json({ user: userWithoutPassword });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

/**
 * PUT /api/auth/password
 * Change user password
 */
router.put('/password', authenticate, authLimiter, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Current and new password are required' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ error: 'New password must be at least 6 characters' });
        }

        await AuthService.changePassword(req.user!.userId, currentPassword, newPassword);

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === 'Invalid current password') {
                return res.status(401).json({ error: error.message });
            }
        }
        console.error('Change password error:', error);
        res.status(500).json({ error: 'Failed to change password' });
    }
});

export default router;

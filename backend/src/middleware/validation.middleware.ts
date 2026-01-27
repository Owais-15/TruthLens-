import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

/**
 * Validation middleware - checks for validation errors
 */
export const validate = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

/**
 * Registration validation rules
 */
export const registerValidation = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Valid email is required'),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain uppercase, lowercase, and number'),
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 255 })
        .withMessage('Name must be between 2 and 255 characters'),
];

/**
 * Login validation rules
 */
export const loginValidation = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Valid email is required'),
    body('password')
        .notEmpty()
        .withMessage('Password is required'),
];

/**
 * Verification input validation rules
 */
export const verificationValidation = [
    body('text')
        .notEmpty()
        .withMessage('Text is required')
        .isLength({ min: 10, max: 5000 })
        .withMessage('Text must be between 10 and 5000 characters')
        .trim()
        // Sanitize to prevent prompt injection
        .customSanitizer((value: string) => {
            // Remove potential prompt injection patterns
            return value
                .replace(/```/g, '') // Remove code blocks
                .replace(/<\|.*?\|>/g, '') // Remove special tokens
                .replace(/\[INST\]|\[\/INST\]/g, '') // Remove instruction markers
                .trim();
        }),
];

/**
 * Input sanitization middleware
 */
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
    // Remove any null bytes
    if (req.body) {
        Object.keys(req.body).forEach(key => {
            if (typeof req.body[key] === 'string') {
                req.body[key] = req.body[key].replace(/\0/g, '');
            }
        });
    }
    next();
};

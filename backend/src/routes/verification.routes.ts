import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { verificationLimiter } from '../middleware/rate-limiter.middleware';
import { verificationValidation, validate, sanitizeInput } from '../middleware/validation.middleware';
import { VerificationPipelineService } from '../services/verification-pipeline.service';
import { ProgressiveVerificationService } from '../services/progressive-verification.service';
import { db } from '../db';
import { verifications, claims, users, NewVerification } from '../db/schema';
import { eq } from 'drizzle-orm';

const router = Router();

/**
 * POST /api/verify
 * Verify text for hallucinations
 */
router.post(
    '/',
    authenticate,
    verificationLimiter,
    sanitizeInput,
    verificationValidation,
    validate,
    async (req: Request, res: Response) => {
        const startTime = Date.now();

        try {
            const { text } = req.body;
            const userId = req.user!.userId;



            // Run verification pipeline with 60 second timeout
            const result = await VerificationPipelineService.verifyWithTimeout(text, 3000000);

            // Save verification to database
            // Save verification to database
            const verificationData: any = {
                userId,
                inputText: text,
                trustScore: result.trustScore,
                claims: result.claims as any,
                results: result as any,
                processingTime: result.processingTime,
            };

            const [verification] = await db.insert(verifications).values(verificationData).returning();

            // Save individual claims
            const claimInserts = result.claims.map(c => ({
                verificationId: verification.id,
                claimText: c.claim.text,
                claimType: c.claim.type,
                startIndex: c.claim.startIndex,
                endIndex: c.claim.endIndex,
                verdict: c.entailment.verdict,
                confidence: c.entailment.confidence,
                evidence: c.evidence as any,
            }));

            if (claimInserts.length > 0) {
                await db.insert(claims).values(claimInserts);
            }

            // Update user's verification count
            const [currentUser] = await db.select().from(users).where(eq(users.id, userId));
            await db
                .update(users)
                .set({ verificationsUsed: (currentUser.verificationsUsed || 0) + 1 })
                .where(eq(users.id, userId));

            console.log(`Verification complete for user ${userId} in ${Date.now() - startTime}ms`);

            res.json({
                success: true,
                verificationId: verification.id,
                result,
            });
        } catch (error) {
            console.error('Verification error:', error);

            if (error instanceof Error) {
                if (error.message === 'Verification timeout') {
                    return res.status(504).json({ error: 'Verification timeout - please try with shorter text' });
                }
            }

            res.status(500).json({ error: 'Verification failed' });
        }
    }
);

/**
 * GET /api/verify/history
 * Get user's verification history
 */
router.get('/history', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = req.user!.userId;
        const limit = parseInt(req.query.limit as string) || 20;
        const offset = parseInt(req.query.offset as string) || 0;

        const userVerifications = await db
            .select()
            .from(verifications)
            .where(eq(verifications.userId, userId))
            .orderBy(verifications.createdAt)
            .limit(limit)
            .offset(offset);

        res.json({
            verifications: userVerifications,
            pagination: {
                limit,
                offset,
                total: userVerifications.length,
            },
        });
    } catch (error) {
        console.error('Get history error:', error);
        res.status(500).json({ error: 'Failed to get verification history' });
    }
});

/**
 * GET /api/verify/:id
 * Get specific verification by ID
 */
router.get('/:id', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = req.user!.userId;
        const verificationId = parseInt(req.params.id as string);

        const [verification] = await db
            .select()
            .from(verifications)
            .where(eq(verifications.id, verificationId));

        if (!verification) {
            return res.status(404).json({ error: 'Verification not found' });
        }

        // Check ownership
        if (verification.userId !== userId) {
            return res.status(403).json({ error: 'Access denied' });
        }

        res.json({ verification });
    } catch (error) {
        console.error('Get verification error:', error);
        res.status(500).json({ error: 'Failed to get verification' });
    }
});

/**
 * POST /api/verify/progressive
 * Progressive verification with Server-Sent Events streaming
 * Phase 1: Returns immediate results (2-3 seconds)
 * Phase 2: Streams deep verification updates in real-time
 */
router.post(
    '/progressive',
    authenticate,
    verificationLimiter,
    sanitizeInput,
    verificationValidation,
    validate,
    async (req: Request, res: Response) => {
        try {
            const { text } = req.body;
            const userId = req.user!.userId;

            console.log(`Starting progressive verification for user ${userId}`);

            // Set SSE headers
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');
            res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering

            // Phase 1: Quick verification
            const phase1Result = await ProgressiveVerificationService.phase1QuickVerification(text);

            // Send Phase 1 results immediately
            res.write(`data: ${JSON.stringify({
                type: 'phase1',
                ...phase1Result
            })}\n\n`);

            // Save initial verification to database
            // Save initial verification to database
            const verificationData: any = {
                userId,
                inputText: text,
                trustScore: phase1Result.preliminaryTrustScore,
                claims: phase1Result.claims as any,
                results: phase1Result as any,
                processingTime: phase1Result.processingTime,
            };

            const [verification] = await db.insert(verifications).values(verificationData).returning();

            // Phase 2: Deep verification with streaming
            for await (const update of ProgressiveVerificationService.phase2DeepVerification(phase1Result)) {
                // Send Phase 2 update
                res.write(`data: ${JSON.stringify({
                    type: 'phase2',
                    verificationId: verification.id,
                    ...update
                })}\n\n`);

                // Update database with latest results
                const updatedClaims = [...phase1Result.claims];
                updatedClaims[update.claimIndex] = update.result;

                await db
                    .update(verifications)
                    .set({
                        trustScore: update.updatedTrustScore,
                        claims: updatedClaims as any,
                    } as any)
                    .where(eq(verifications.id, verification.id));
            }

            // Send completion event
            res.write(`data: ${JSON.stringify({
                type: 'complete',
                verificationId: verification.id
            })}\n\n`);

            // Update user's verification count
            const [currentUser] = await db.select().from(users).where(eq(users.id, userId));
            await db
                .update(users)
                .set({ verificationsUsed: (currentUser.verificationsUsed || 0) + 1 })
                .where(eq(users.id, userId));

            res.end();
        } catch (error) {
            console.error('Progressive verification error:', error);

            // Send error event
            res.write(`data: ${JSON.stringify({
                type: 'error',
                error: 'Verification failed'
            })}\n\n`);

            res.end();
        }
    }
);

export default router;

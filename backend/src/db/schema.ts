import { pgTable, serial, text, timestamp, integer, jsonb, varchar } from 'drizzle-orm/pg-core';

// Users table
export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    password: text('password').notNull(),
    name: varchar('name', { length: 255 }),
    tier: varchar('tier', { length: 50 }).notNull().default('free'), // free, premium, enterprise
    verificationsUsed: integer('verifications_used').notNull().default(0),
    verificationsLimit: integer('verifications_limit').notNull().default(100),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Verifications table
export const verifications = pgTable('verifications', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').notNull().references(() => users.id),
    inputText: text('input_text').notNull(),
    trustScore: integer('trust_score'), // 0-100
    claims: jsonb('claims'), // Array of extracted claims
    results: jsonb('results'), // Full verification results
    processingTime: integer('processing_time'), // milliseconds
    createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Claims table - for model improvement and analytics
export const claims = pgTable('claims', {
    id: serial('id').primaryKey(),
    verificationId: integer('verification_id').notNull().references(() => verifications.id),
    claimText: text('claim_text').notNull(),
    claimType: varchar('claim_type', { length: 100 }), // factual, numerical, temporal, etc.
    startIndex: integer('start_index').notNull(),
    endIndex: integer('end_index').notNull(),
    verdict: varchar('verdict', { length: 50 }), // entailment, contradiction, neutral
    confidence: integer('confidence'), // 0-100
    evidence: jsonb('evidence'), // Retrieved evidence sources
    createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Metrics table - for system performance monitoring
export const metrics = pgTable('metrics', {
    id: serial('id').primaryKey(),
    endpoint: varchar('endpoint', { length: 255 }).notNull(),
    responseTime: integer('response_time').notNull(), // milliseconds
    statusCode: integer('status_code').notNull(),
    userId: integer('user_id').references(() => users.id),
    errorMessage: text('error_message'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Type exports for TypeScript
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Verification = typeof verifications.$inferSelect;
export type NewVerification = typeof verifications.$inferInsert;
export type Claim = typeof claims.$inferSelect;
export type NewClaim = typeof claims.$inferInsert;
export type Metric = typeof metrics.$inferSelect;
export type NewMetric = typeof metrics.$inferInsert;

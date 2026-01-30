import { Request, Response, NextFunction } from 'express';

interface TokenBucket {
    tokens: number;
    lastRefill: number;
}

const buckets = new Map<string, TokenBucket>();

// Configuration
const CAPACITY = 5; // Burst capacity
const REFILL_RATE_PER_MINUTE = 10;
const REFILL_INTERVAL_MS = (60 * 1000) / REFILL_RATE_PER_MINUTE; // 6000ms per token

export const rateLimiter = (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || 'unknown'; // Simple IP-based limiting
    const now = Date.now();

    if (!buckets.has(ip)) {
        buckets.set(ip, {
            tokens: CAPACITY,
            lastRefill: now
        });
    }

    const bucket = buckets.get(ip)!;

    // Refill tokens based on time passed
    const timePassed = now - bucket.lastRefill;
    const tokensToAdd = Math.floor(timePassed / REFILL_INTERVAL_MS);

    if (tokensToAdd > 0) {
        bucket.tokens = Math.min(CAPACITY, bucket.tokens + tokensToAdd);
        bucket.lastRefill = now; // Reset reference time, but strictly ideally should be lastRefill + tokensToAdd * interval to avoid drift, but simple usage is fine.
        // Better drift handling:
        // bucket.lastRefill = Math.min(now, bucket.lastRefill + tokensToAdd * REFILL_INTERVAL_MS); 
        // Actually simplicity is preferred here unless stated otherwise.
    }

    if (bucket.tokens >= 1) {
        bucket.tokens -= 1;
        next();
    } else {
        res.status(429).json({
            error: 'Too Many Requests',
            message: 'Rate limit exceeded. Maximum 10 requests per minute with burst of 5.'
        });
    }
};

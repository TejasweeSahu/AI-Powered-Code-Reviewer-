/**
 * Minimal fixed-window, in-memory rate limiter keyed by client IP.
 *
 * Note: state is per process. On serverless platforms (Vercel) each warm instance
 * keeps its own counters, so this limits abuse rather than enforcing an exact global
 * quota. For a hard global limit, back it with a shared store such as Redis.
 */
function createRateLimiter({ windowMs, max, now = Date.now } = {}) {
    const hits = new Map();
    let lastSweep = now();

    return function rateLimit(req, res, next) {
        const current = now();

        // Periodically drop expired entries so the map can't grow unbounded.
        if (current - lastSweep > windowMs) {
            for (const [key, entry] of hits) {
                if (entry.resetAt <= current) hits.delete(key);
            }
            lastSweep = current;
        }

        const key = req.ip || 'unknown';
        let entry = hits.get(key);
        if (!entry || entry.resetAt <= current) {
            entry = { count: 0, resetAt: current + windowMs };
            hits.set(key, entry);
        }
        entry.count += 1;

        const remaining = Math.max(0, max - entry.count);
        const resetSeconds = Math.ceil((entry.resetAt - current) / 1000);
        res.set('RateLimit-Limit', String(max));
        res.set('RateLimit-Remaining', String(remaining));
        res.set('RateLimit-Reset', String(resetSeconds));

        if (entry.count > max) {
            res.set('Retry-After', String(resetSeconds));
            return res.status(429).json({
                error: `Too many review requests. Please try again in ${resetSeconds} seconds.`
            });
        }

        return next();
    };
}

module.exports = createRateLimiter;

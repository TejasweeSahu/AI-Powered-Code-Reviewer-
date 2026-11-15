const express = require('express');
const cors = require('cors');
const aiRoutes = require('./routes/ai.routes');

const app = express();

// Behind Render/Vercel proxies: trust the first hop so req.ip is the real client IP
// (used by the rate limiter).
app.set('trust proxy', 1);

const normalize = (url) => url.trim().replace(/\/+$/, '');

// Converts an allowed-origin entry into a matcher. Entries may contain `*` wildcards,
// e.g. `https://my-app-*.vercel.app` to allow that project's Vercel preview deployments.
const toMatcher = (entry) => {
    if (!entry.includes('*')) return (origin) => origin === entry;
    const escaped = entry.split('*').map(part => part.replace(/[.+?^${}()|[\]\\]/g, '\\$&'));
    const regex = new RegExp(`^${escaped.join('[^/]*')}$`);
    return (origin) => regex.test(origin);
};

const isAllowedOrigin = (origin) => {
    // Allow non-browser requests (e.g. curl, postman, server-to-server)
    if (!origin) return true;

    const entries = (process.env.CLIENT_URL || '')
        .split(',')
        .map(normalize)
        .filter(Boolean);

    // Not configured, or explicit wildcard: allow all origins
    if (entries.length === 0 || entries.includes('*')) return true;

    const normalizedOrigin = normalize(origin);
    if (entries.some(entry => toMatcher(entry)(normalizedOrigin))) return true;

    // Allow localhost during local development only
    if (process.env.NODE_ENV !== 'production' &&
        /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(normalizedOrigin)) {
        return true;
    }

    return false;
};

const corsOptions = {
    origin: (origin, callback) => {
        if (isAllowedOrigin(origin)) {
            callback(null, true);
        } else {
            console.warn(`[CORS Blocked] Origin not allowed: ${origin}`);
            callback(null, false);
        }
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
    // No cookies or auth headers are used, so credentials are not needed.
    credentials: false,
    optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json({ limit: '1mb' }));


app.get('/', (req, res) => {
    res.json({ message: 'AI Code Reviewer API is running' });
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/ai', aiRoutes);

// Global error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    if (err.type === 'entity.too.large') {
        return res.status(413).json({ error: 'Request body is too large.' });
    }
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({ error: 'Request body must be valid JSON.' });
    }
    console.error('Unhandled Server Error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
module.exports.isAllowedOrigin = isAllowedOrigin;

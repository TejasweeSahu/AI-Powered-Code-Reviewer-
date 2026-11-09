const express = require('express');
const cors = require('cors');
const aiRoutes = require('./routes/ai.routes');

const app = express();

const isAllowedOrigin = (origin) => {
    // Allow non-browser requests (e.g. curl, postman, mobile apps)
    if (!origin) return true;

    const clientUrlEnv = process.env.CLIENT_URL;
    // If not set, empty, or wildcard, allow all
    if (!clientUrlEnv || clientUrlEnv === '*' || clientUrlEnv.trim() === '') {
        return true;
    }

    const allowedOrigins = clientUrlEnv
        .split(',')
        .map(url => url.trim().replace(/\/+$/, ''));

    if (allowedOrigins.includes('*')) return true;

    const normalizedOrigin = origin.trim().replace(/\/+$/, '');
    if (allowedOrigins.includes(normalizedOrigin)) return true;

    // Automatically allow any Vercel deployment (preview or production)
    if (normalizedOrigin.endsWith('.vercel.app')) return true;

    // Automatically allow localhost during local development
    if (normalizedOrigin.startsWith('http://localhost:') || normalizedOrigin.startsWith('http://127.0.0.1:')) {
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
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
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
app.use((err, req, res, next) => {
    console.error('Unhandled Server Error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;

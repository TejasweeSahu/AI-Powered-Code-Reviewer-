const express = require('express');
const cors = require('cors');
const aiRoutes = require('./routes/ai.routes');

const app = express();

const corsOptions = {
    origin: process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',').map(url => url.trim()) : '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
};

app.use(cors(corsOptions));
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

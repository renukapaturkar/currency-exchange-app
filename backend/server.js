const express = require('express');
const cors = require('cors');
const rateManager = require('./services');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/rates', async (req, res) => {
    const base = (req.query.base || 'USD').toUpperCase();
    const symbols = req.query.symbols ? req.query.symbols.split(',') : null;

    try {
        const data = await rateManager.fetchRates(base);

        // Filter symbols if requested
        if (symbols) {
            const filteredRates = {};
            const requestedSymbols = symbols.map(s => s.trim().toUpperCase());

            for (const [key, value] of Object.entries(data.rates)) {
                if (requestedSymbols.includes(key)) {
                    filteredRates[key] = value;
                }
            }
            // Ensure we preserve the core structure
            data.rates = filteredRates;
        }

        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(503).json({ error: error.message || 'Service Unavailable' });
    }
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

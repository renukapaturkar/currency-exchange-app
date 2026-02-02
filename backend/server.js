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
const router = express.Router();

router.get('/rates', async (req, res) => {
    const base = (req.query.base || 'USD').toUpperCase();
    const symbols = req.query.symbols ? req.query.symbols.split(',') : null;
    const source = req.query.source;

    try {
        const data = await rateManager.fetchRates(base, source);

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

router.get('/providers', (req, res) => {
    try {
        const providers = rateManager.getProviders();
        res.json(providers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch providers' });
    }
});

router.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.use('/', router);
app.use('/api', router);

// Start Server
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

module.exports = app;

const axios = require('axios');
const NodeCache = require('node-cache');
require('dotenv').config();

// Cache for 1 hour (3600 seconds)
const rateCache = new NodeCache({ stdTTL: 3600 });

class ExchangeRateManager {
    constructor() {
        this.providers = [
            this.fetchFromExchangeRateAPI.bind(this),
            this.fetchFromOpenExchangeRates.bind(this),
            this.fetchFromFixer.bind(this)
        ];
    }

    async fetchRates(base = "USD") {
        // Check cache
        const cachedData = rateCache.get(base);
        if (cachedData) {
            console.log(`Serving ${base} from cache`);
            return cachedData;
        }

        const errors = [];
        let bestCandidate = null;

        for (const fetcher of this.providers) {
            try {
                const result = await fetcher(base);
                if (result) {
                    const now = Math.floor(Date.now() / 1000);
                    const age = now - result.timestamp;
                    console.log(`Provider ${result.source} returned data. Age: ${age}s`);

                    // If data is fresh ( < 1 hour), return immediately
                    if (age < 3600) {
                        const responseData = this.formatResponse(result);
                        rateCache.set(base, responseData);
                        return responseData;
                    }

                    // If stale, keep it if it's better than what we have
                    if (!bestCandidate || result.timestamp > bestCandidate.timestamp) {
                        bestCandidate = result;
                    }
                }
            } catch (error) {
                const msg = error.message || String(error);
                errors.push(msg);
                console.warn(`Provider failed: ${msg}`);
            }
        }

        // If we have a candidate (even if stale), return it as a last resort
        if (bestCandidate) {
            console.log(`All providers checked. Returning best candidate from ${bestCandidate.source} (Age: ${Math.floor(Date.now() / 1000 - bestCandidate.timestamp)}s)`);
            const responseData = this.formatResponse(bestCandidate);
            rateCache.set(base, responseData);
            return responseData;
        }

        throw new Error(`All providers failed for ${base}. Errors: ${errors.join("; ")}`);
    }

    formatResponse(result) {
        return {
            rates: result.rates,
            base: result.base,
            source: result.source,
            timestamp: result.timestamp,
            updated_at_local: new Date().toISOString()
        };
    }

    async fetchFromExchangeRateAPI(base) {
        const apiKey = process.env.EXCHANGERATE_API_KEY;
        if (!apiKey) throw new Error("Missing EXCHANGERATE_API_KEY");

        try {
            const url = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${base}`;
            const response = await axios.get(url, { timeout: 5000 });
            const data = response.data;

            if (data.result === "success") {
                return {
                    rates: data.conversion_rates,
                    base: data.base_code,
                    source: "ExchangeRate-API",
                    timestamp: data.time_last_update_unix
                };
            } else {
                throw new Error(`API Error: ${data["error-type"]}`);
            }
        } catch (e) {
            throw new Error(`ExchangeRate-API failed: ${e.message}`);
        }
    }

    async fetchFromOpenExchangeRates(base) {
        const apiKey = process.env.OPENEXCHANGERATES_APP_ID;
        if (!apiKey) throw new Error("Missing OPENEXCHANGERATES_APP_ID");

        // Free tier restriction: Base is always USD
        if (base !== "USD") {
            console.log("OpenExchangeRates free tier only supports USD base. Skipping.");
            return null;
        }

        try {
            const url = `https://openexchangerates.org/api/latest.json?app_id=${apiKey}`;
            const response = await axios.get(url, { timeout: 5000 });
            const data = response.data;

            if (data.error) {
                throw new Error(data.description || "API Error");
            }

            return {
                rates: data.rates,
                base: data.base,
                source: "Open Exchange Rates",
                timestamp: data.timestamp
            };
        } catch (e) {
            throw new Error(`OpenExchangeRates failed: ${e.message}`);
        }
    }

    async fetchFromFixer(base) {
        const apiKey = process.env.FIXER_API_KEY;
        if (!apiKey) throw new Error("Missing FIXER_API_KEY");

        // Free tier restriction: Base is always EUR
        if (base !== "EUR") {
            console.log("Fixer free tier only supports EUR base. Skipping.");
            return null;
        }

        try {
            const url = `http://data.fixer.io/api/latest?access_key=${apiKey}`;
            const response = await axios.get(url, { timeout: 5000 });
            const data = response.data;

            if (data.success) {
                return {
                    rates: data.rates,
                    base: data.base,
                    source: "Fixer.io",
                    timestamp: data.timestamp
                };
            } else {
                throw new Error(data.error?.info || "API Error");
            }
        } catch (e) {
            throw new Error(`Fixer failed: ${e.message}`);
        }
    }
}

module.exports = new ExchangeRateManager();

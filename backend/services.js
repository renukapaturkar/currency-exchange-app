const axios = require('axios');
const NodeCache = require('node-cache');
require('dotenv').config();

// Cache for 15 minutes (900 seconds) - Optimized for 3500 req/month quota
const rateCache = new NodeCache({ stdTTL: 900 });

class ExchangeRateManager {
    constructor() {
        this.providers = {
            'ExchangeRate-API': {
                name: 'ExchangeRate-API',
                fetcher: this.fetchFromExchangeRateAPI.bind(this),
                status: 'Unknown',
                lastSuccess: null,
                lastFailure: null,
                quota: 'high'
            },
            'Open Exchange Rates': {
                name: 'Open Exchange Rates',
                fetcher: this.fetchFromOpenExchangeRates.bind(this),
                status: 'Unknown',
                lastSuccess: null,
                lastFailure: null,
                quota: 'high'
            },
            'Fixer.io': {
                name: 'Fixer.io',
                fetcher: this.fetchFromFixer.bind(this),
                status: 'Unknown',
                lastSuccess: null,
                lastFailure: null,
                quota: 'low'
            }
        };
    }

    getProviders() {
        return Object.values(this.providers).map(p => ({
            name: p.name,
            status: p.status,
            lastSuccess: p.lastSuccess,
            lastFailure: p.lastFailure
        }));
    }

    updateProviderStatus(name, success, timestamp = Date.now()) {
        const provider = this.providers[name];
        if (provider) {
            provider.status = success ? 'Active' : 'Down';
            if (success) {
                provider.lastSuccess = timestamp;
            } else {
                provider.lastFailure = timestamp;
            }
        }
    }

    async fetchRates(base = "USD", source = null) {
        // Cache key logic: if source is specific, use that. Else generic.
        const cacheKey = source ? `${base}_${source}` : base;

        // Check cache
        const cachedData = rateCache.get(cacheKey);
        if (cachedData) {
            console.log(`Serving ${base} from cache (Key: ${cacheKey})`);
            return cachedData;
        }

        // If specific source requested
        if (source) {
            const provider = this.providers[source];
            if (!provider) {
                throw new Error(`Provider ${source} not found`);
            }
            try {
                const result = await provider.fetcher(base);
                if (result) {
                    this.updateProviderStatus(result.source, true);
                    const responseData = this.formatResponse(result);
                    // Cache with standard TTL
                    rateCache.set(cacheKey, responseData);
                    // Optimization: Also cache to generic key if specific source was requested
                    // This ensures switching back to "Auto" (no source) uses this fresh data
                    rateCache.set(base, responseData);
                    return responseData;
                }
            } catch (error) {
                this.updateProviderStatus(source, false);
                throw error;
            }
            throw new Error(`Provider ${source} returned no data`);
        }

        // --- Smart Provider Selection Strategy ---
        // 1. Try High Quota providers first (Randomized to balance load)
        // 2. Try Low Quota providers as backup

        const allProviders = Object.values(this.providers);
        const highQuota = allProviders.filter(p => p.quota === 'high');
        const lowQuota = allProviders.filter(p => p.quota === 'low');

        // Shuffle high quota providers to distribute load
        const shuffledHigh = highQuota.sort(() => 0.5 - Math.random());
        const prioritizedProviders = [...shuffledHigh, ...lowQuota];

        const errors = [];

        for (const provider of prioritizedProviders) {
            try {
                console.log(`Attempting fetch from ${provider.name}...`);
                const result = await provider.fetcher(base);
                if (result) {
                    const now = Math.floor(Date.now() / 1000);
                    const age = now - result.timestamp;
                    console.log(`Provider ${result.source} returned data. Age: ${age}s`);

                    this.updateProviderStatus(result.source, true);

                    // If data is reasonably fresh (< 1 hour), accept it.
                    // Note: reducing global cache TTL handles the "serving old data" issue.
                    // We accept whatever the provider gives us as "current" state.
                    const responseData = this.formatResponse(result);

                    // Optimization: Cache under both generic Key (base) AND specific provider key
                    // This future-proofs if the user switches to this specific provider next
                    rateCache.set(base, responseData);
                    rateCache.set(`${base}_${provider.name}`, responseData);

                    return responseData;
                }
            } catch (error) {
                const msg = error.message || String(error);
                errors.push(msg);
                console.warn(`Provider ${provider.name} failed: ${msg}`);
                this.updateProviderStatus(provider.name, false);
            }
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

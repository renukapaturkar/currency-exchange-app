import axios from 'axios';

const API_BASE_URL = import.meta.env.PROD ? '/api' : 'http://localhost:8000';

export const fetchRates = async (base = 'USD', source = null) => {
    try {
        const params = { base };
        if (source) {
            params.source = source;
        }
        const response = await axios.get(`${API_BASE_URL}/rates`, { params });
        return response.data;
    } catch (error) {
        console.error("API Error:", error);
        throw error;
    }
};



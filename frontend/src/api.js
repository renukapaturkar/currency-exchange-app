import axios from 'axios';

const API_BASE_URL = import.meta.env.PROD ? '/api' : 'http://localhost:8000';

export const fetchRates = async (base = 'USD') => {
    try {
        const response = await axios.get(`${API_BASE_URL}/rates`, {
            params: { base }
        });
        return response.data;
    } catch (error) {
        console.error("API Error:", error);
        throw error;
    }
};

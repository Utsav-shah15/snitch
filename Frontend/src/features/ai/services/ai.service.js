import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/api/ai',
    withCredentials: true,
});

// AI Semantic Search
export const aiSearch = async (query) => {
    const response = await api.get('/search', { params: { q: query } });
    return response.data;
};

// AI Outfit Suggestions for a product
export const getOutfitSuggestions = async (productId) => {
    const response = await api.get(`/outfit/${productId}`);
    return response.data;
};

// AI Description Generator (seller)
export const generateDescription = async (data) => {
    const response = await api.post('/generate-description', data);
    return response.data;
};

// AI Price Suggestion (seller)
export const suggestPrice = async (data) => {
    const response = await api.post('/suggest-price', data);
    return response.data;
};

// AI Trend Forecaster (seller)
export const getTrends = async () => {
    const response = await api.get('/trends');
    return response.data;
};

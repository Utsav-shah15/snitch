import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/api/analytics',
    withCredentials: true,
});

export const getAnalyticsOverview = async () => {
    const response = await api.get('/overview');
    return response.data;
};

export const getRevenueChart = async () => {
    const response = await api.get('/revenue');
    return response.data;
};

export const getTopProducts = async () => {
    const response = await api.get('/products');
    return response.data;
};

export const getCategoryStats = async () => {
    const response = await api.get('/categories');
    return response.data;
};

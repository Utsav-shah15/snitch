import axios from 'axios';

const api = axios.create({
    baseURL: 'https://snitch-c04s.onrender.com/api/wallet',
    withCredentials: true,
});

export const getWallet = async () => {
    const response = await api.get('/');
    return response.data;
};

export const getTransactions = async (params = {}) => {
    const response = await api.get('/transactions', { params });
    return response.data;
};

export const requestWithdrawal = async (amount) => {
    const response = await api.post('/withdraw', { amount });
    return response.data;
};

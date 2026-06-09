import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/api/orders',
    withCredentials: true,
});

export const placeOrder = async (orderData) => {
    const response = await api.post('/', orderData);
    return response.data;
};

export const getMyOrders = async () => {
    const response = await api.get('/my-orders');
    return response.data;
};

export const getSellerOrders = async (params = {}) => {
    const response = await api.get('/seller-orders', { params });
    return response.data;
};

export const updateOrderStatus = async (id, status) => {
    const response = await api.patch(`/${id}/status`, { status });
    return response.data;
};

export const getOrderById = async (id) => {
    const response = await api.get(`/${id}`);
    return response.data;
};

export const reSnitch = async (orderId, data) => {
    const response = await api.post(`/${orderId}/resnitch`, data);
    return response.data;
};


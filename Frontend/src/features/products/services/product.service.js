import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/api/products',
    withCredentials: true,
});

export const getAllProducts = async (params = {}) => {
    const response = await api.get('/', { params });
    return response.data;
};

export const getProductById = async (id) => {
    const response = await api.get(`/${id}`);
    return response.data;
};

export const getMyListings = async (params = {}) => {
    const response = await api.get('/my-listings', { params });
    return response.data;
};

export const createProduct = async (formData) => {
    const response = await api.post('/create', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};

export const updateProduct = async (id, formData) => {
    const response = await api.patch(`/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};

export const deleteProduct = async (id) => {
    const response = await api.delete(`/${id}`);
    return response.data;
};

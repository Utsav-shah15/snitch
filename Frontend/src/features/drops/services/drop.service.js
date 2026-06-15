import axios from 'axios';

const api = axios.create({
    baseURL: 'https://snitch-c04s.onrender.com/api/drops',
    withCredentials: true,
});

// Get all drops
export const getAllDrops = async () => {
    const response = await api.get('/');
    return response.data;
};

// Get single drop detail
export const getDropById = async (id) => {
    const response = await api.get(`/${id}`);
    return response.data;
};

// Register for drop notification (buyer)
export const notifyMe = async (dropId) => {
    const response = await api.post(`/${dropId}/notify`);
    return response.data;
};

// Create a new drop (seller)
export const createDrop = async (data) => {
    const response = await api.post('/', data);
    return response.data;
};

// Get seller's own drops
export const getMyDrops = async () => {
    const response = await api.get('/my-drops');
    return response.data;
};

// Update drop status (seller)
export const updateDropStatus = async (dropId, status) => {
    const response = await api.patch(`/${dropId}/status`, { status });
    return response.data;
};

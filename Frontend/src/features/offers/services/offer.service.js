import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/api/offers',
    withCredentials: true,
});

export const makeOffer = async (data) => {
    const response = await api.post('/', data);
    return response.data;
};

export const getMyOffers = async () => {
    const response = await api.get('/my-offers');
    return response.data;
};

export const getReceivedOffers = async (params = {}) => {
    const response = await api.get('/received', { params });
    return response.data;
};

export const acceptOffer = async (id) => {
    const response = await api.patch(`/${id}/accept`);
    return response.data;
};

export const counterOffer = async (id, counterPrice) => {
    const response = await api.patch(`/${id}/counter`, { counterPrice });
    return response.data;
};

export const declineOffer = async (id) => {
    const response = await api.patch(`/${id}/decline`);
    return response.data;
};

export const getOfferById = async (id) => {
    const response = await api.get(`/${id}`);
    return response.data;
};

import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/api/payment',
    withCredentials: true,
});

// Get Razorpay public key
export const getRazorpayKey = async () => {
    const response = await api.get('/key');
    return response.data;
};

// Create Razorpay order (returns orderId, amount, currency, keyId)
export const createPaymentOrder = async ({ productId, quantity, offerId }) => {
    const response = await api.post('/create-order', { productId, quantity, offerId });
    return response.data;
};

// Verify payment after Razorpay checkout popup completes
export const verifyPayment = async (paymentData) => {
    const response = await api.post('/verify', paymentData);
    return response.data;
};

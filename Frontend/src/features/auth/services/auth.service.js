import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/api/auth',
    withCredentials: true
});

export const Register = async (fullName, email, password, contactNumber) => {
    const response = await api.post('/register', { fullName, email, password, contactNumber });
    return response.data;
};

export const Login = async (email, password) => {
    const response = await api.post('/login', { email, password });
    return response.data;
};

export const getMe = async () => {
    const response = await api.get('/getMe');
    return response.data;
};

export const Logout = async () => {
    const response = await api.get('/logout');
    return response.data;
};

export const BecomeSeller = async (shopName, bio) => {
    const response = await api.patch('/become-seller', { shopName, bio });
    return response.data;
};

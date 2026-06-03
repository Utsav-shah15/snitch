import { setError, setLoading, setUser } from '../authSlice';
import { Register, Login, getMe as getMeApi } from '../services/auth.service';
import { useDispatch } from 'react-redux';

export const useAuth = () => {
    const dispatch = useDispatch();

    const register = async (fullName, email, password, contactNumber, isSeller = false) => {
        try {
            dispatch(setLoading(true));
            const response = await Register(fullName, email, password, contactNumber, isSeller);
            dispatch(setUser(response.user));
            return response;
        } catch (error) {
            const message = error.response?.data?.error || error.message || 'Registration failed';
            dispatch(setError(message));
            throw new Error(message);
        } finally {
            dispatch(setLoading(false));
        }
    };

    const login = async (email, password) => {
        try {
            dispatch(setLoading(true));
            const response = await Login(email, password);
            dispatch(setUser(response.user));
            return response;
        } catch (error) {
            const message = error.response?.data?.error || error.message || 'Login failed';
            dispatch(setError(message));
            throw new Error(message);
        } finally {
            dispatch(setLoading(false));
        }
    };

    const getMe = async () => {
        try {
            dispatch(setLoading(true));
            const response = await getMeApi(); // calls the service file's getMe
            dispatch(setUser(response.user));
            return response;
        } catch (error) {
            const message = error.response?.data?.error || error.message || 'Failed to fetch user information';
            dispatch(setError(message));
            throw new Error(message);
        } finally {
            dispatch(setLoading(false));
        }
    };

    return { register, login, getMe };
};

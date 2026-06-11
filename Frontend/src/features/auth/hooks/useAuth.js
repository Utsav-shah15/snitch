import { setError, setLoading, setUser, logout as logoutAction, updateSellerProfile } from '../authSlice';
import { Register, Login, getMe as getMeApi, Logout, BecomeSeller, SetPassword } from '../services/auth.service';
import { useDispatch } from 'react-redux';

export const useAuth = () => {
    const dispatch = useDispatch();

    // Register new user (buyer by default)
    const register = async (fullName, email, password, contactNumber) => {
        try {
            dispatch(setLoading(true));
            const response = await Register(fullName, email, password, contactNumber);
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

    // Login existing user
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

    // Check session on app load
    const getMe = async () => {
        try {
            dispatch(setLoading(true));
            const response = await getMeApi();
            dispatch(setUser(response.user));
            return response;
        } catch (error) {
            const message = error.response?.data?.error || error.message || 'Session expired';
            dispatch(setError(message));
            throw new Error(message);
        } finally {
            dispatch(setLoading(false));
        }
    };

    // Logout user
    const logoutUser = async () => {
        try {
            await Logout();
        } catch (_) {
            // Ignore API errors — still clear state
        } finally {
            dispatch(logoutAction());
        }
    };

    // Upgrade user to seller
    const becomeSeller = async (shopName, bio = '') => {
        try {
            dispatch(setLoading(true));
            const response = await BecomeSeller(shopName, bio);
            dispatch(updateSellerProfile(response.user.sellerProfile));
            return response;
        } catch (error) {
            const message = error.response?.data?.error || error.message || 'Failed to become a seller';
            dispatch(setError(message));
            throw new Error(message);
        } finally {
            dispatch(setLoading(false));
        }
    };

    // Set password for Google Users
    const setPassword = async (password) => {
        try {
            dispatch(setLoading(true));
            const response = await SetPassword(password);
            dispatch(setUser(response.user));
            return response;
        } catch (error) {
            const message = error.response?.data?.error || error.message || 'Failed to set password';
            dispatch(setError(message));
            throw new Error(message);
        } finally {
            dispatch(setLoading(false));
        }
    };

    return { register, login, getMe, logoutUser, becomeSeller, setPassword };
};

import { useCallback } from 'react';
import { setError, setLoading, setUser, logout as logoutAction, updateSellerProfile } from '../authSlice';
import { Register, Login, getMe as getMeApi, Logout, BecomeSeller, SetPassword } from '../services/auth.service';
import { useDispatch } from 'react-redux';

export const useAuth = () => {
    const dispatch = useDispatch();

    // Register new user (buyer by default)
    const register = useCallback(async (fullName, email, password, contactNumber) => {
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
    }, [dispatch]);

    // Login existing user
    const login = useCallback(async (email, password) => {
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
    }, [dispatch]);

    // Check session on app load
    const getMe = useCallback(async () => {
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
    }, [dispatch]);

    // Logout user
    const logoutUser = useCallback(async () => {
        try {
            await Logout();
        } catch (_) {
            // Ignore API errors — still clear state
        } finally {
            dispatch(logoutAction());
        }
    }, [dispatch]);

    // Upgrade user to seller
    const becomeSeller = useCallback(async (shopName, bio = '') => {
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
    }, [dispatch]);

    // Set password for Google Users
    const setPassword = useCallback(async (password) => {
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
    }, [dispatch]);

    return { register, login, getMe, logoutUser, becomeSeller, setPassword };
};

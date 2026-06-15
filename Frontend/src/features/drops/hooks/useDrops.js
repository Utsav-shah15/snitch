import { useState, useCallback } from 'react';
import * as dropService from '../services/drop.service';

/**
 * useDrops — Manages drop listing, creation, and status updates.
 */
const useDrops = () => {
    const [drops, setDrops] = useState([]);
    const [currentDrop, setCurrentDrop] = useState(null);
    const [myDrops, setMyDrops] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchAllDrops = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await dropService.getAllDrops();
            setDrops(data.drops || []);
            return data;
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch drops');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchDropById = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            const data = await dropService.getDropById(id);
            setCurrentDrop(data.drop);
            return data;
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch drop');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchMyDrops = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await dropService.getMyDrops();
            setMyDrops(data.drops || []);
            return data;
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch your drops');
        } finally {
            setLoading(false);
        }
    }, []);

    const createNewDrop = useCallback(async (dropData) => {
        setLoading(true);
        setError(null);
        try {
            const data = await dropService.createDrop(dropData);
            return data;
        } catch (err) {
            const message = err.response?.data?.message || 'Failed to create drop';
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    }, []);

    const registerNotify = useCallback(async (dropId) => {
        try {
            const data = await dropService.notifyMe(dropId);
            return data;
        } catch (err) {
            throw new Error(err.response?.data?.message || 'Failed to register');
        }
    }, []);

    const changeStatus = useCallback(async (dropId, status) => {
        try {
            const data = await dropService.updateDropStatus(dropId, status);
            return data;
        } catch (err) {
            throw new Error(err.response?.data?.message || 'Failed to update status');
        }
    }, []);

    return {
        drops, currentDrop, myDrops, loading, error,
        fetchAllDrops, fetchDropById, fetchMyDrops,
        createNewDrop, registerNotify, changeStatus,
    };
};

export default useDrops;

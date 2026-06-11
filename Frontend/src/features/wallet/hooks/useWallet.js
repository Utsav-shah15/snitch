import { useState, useCallback } from 'react';
import {
    getWallet as getWalletApi,
    getTransactions as getTransactionsApi,
    requestWithdrawal as requestWithdrawalApi,
} from '../services/wallet.service';

/**
 * useWallet — Wraps all wallet service APIs with state management.
 */
const useWallet = () => {
    const [wallet, setWallet] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch wallet balance info
    const fetchWallet = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getWalletApi();
            setWallet(data.wallet);
            setTransactions(data.transactions || []);
            return data;
        } catch (err) {
            const message = err.response?.data?.error || 'Failed to fetch wallet';
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch transaction history
    const fetchTransactions = useCallback(async (params = {}) => {
        setLoading(true);
        setError(null);
        try {
            const data = await getTransactionsApi(params);
            setTransactions(data.transactions || []);
            return data;
        } catch (err) {
            const message = err.response?.data?.error || 'Failed to fetch transactions';
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Request a withdrawal
    const requestWithdrawal = useCallback(async (amount) => {
        setLoading(true);
        setError(null);
        try {
            const data = await requestWithdrawalApi(amount);
            setWallet(data.wallet);
            return data;
        } catch (err) {
            const message = err.response?.data?.error || 'Withdrawal failed';
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        wallet,
        transactions,
        loading,
        error,
        fetchWallet,
        fetchTransactions,
        requestWithdrawal,
    };
};

export default useWallet;

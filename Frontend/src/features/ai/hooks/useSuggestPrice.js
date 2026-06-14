import { useState, useCallback } from 'react';
import { suggestPrice } from '../services/ai.service';

/**
 * useSuggestPrice — AI-powered price suggestion for sellers.
 */
const useSuggestPrice = () => {
    const [suggestion, setSuggestion] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const suggest = useCallback(async (data) => {
        setLoading(true);
        setError(null);
        try {
            const result = await suggestPrice(data);
            setSuggestion(result);
            return result;
        } catch (err) {
            const message = err.response?.data?.error || 'Failed to suggest price';
            setError(message);
        } finally {
            setLoading(false);
        }
    }, []);

    const clear = useCallback(() => {
        setSuggestion(null);
        setError(null);
    }, []);

    return { suggestion, loading, error, suggest, clear };
};

export default useSuggestPrice;

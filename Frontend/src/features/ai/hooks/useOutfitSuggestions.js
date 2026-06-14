import { useState, useCallback } from 'react';
import { getOutfitSuggestions } from '../services/ai.service';

/**
 * useOutfitSuggestions — Fetches AI-powered outfit suggestions for a product.
 */
const useOutfitSuggestions = () => {
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    const fetchSuggestions = useCallback(async (productId) => {
        if (!productId) return;

        setLoading(true);
        setError(false);
        try {
            const data = await getOutfitSuggestions(productId);
            setSuggestions(data.suggestions || []);
            return data;
        } catch (err) {
            setError(true);
            setSuggestions([]);
        } finally {
            setLoading(false);
        }
    }, []);

    return { suggestions, loading, error, fetchSuggestions };
};

export default useOutfitSuggestions;

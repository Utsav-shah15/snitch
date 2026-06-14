import { useState, useCallback } from 'react';
import { aiSearch } from '../services/ai.service';

/**
 * useAiSearch — Handles AI-powered semantic search with loading/error states.
 */
const useAiSearch = () => {
    const [results, setResults] = useState(null);
    const [interpretation, setInterpretation] = useState('');
    const [style, setStyle] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const search = useCallback(async (query) => {
        if (!query || query.trim().length < 2) return;

        setLoading(true);
        setError(null);
        try {
            const data = await aiSearch(query);
            setResults(data.products || []);
            setInterpretation(data.interpretation || '');
            setStyle(data.style || '');
            return data;
        } catch (err) {
            const message = err.response?.data?.error || 'AI search failed';
            setError(message);
            setResults([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const clear = useCallback(() => {
        setResults(null);
        setInterpretation('');
        setStyle('');
        setError(null);
    }, []);

    return { results, interpretation, style, loading, error, search, clear };
};

export default useAiSearch;

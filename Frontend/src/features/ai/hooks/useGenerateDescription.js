import { useState, useCallback } from 'react';
import { generateDescription } from '../services/ai.service';

/**
 * useGenerateDescription — AI-powered product description generator for sellers.
 */
const useGenerateDescription = () => {
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const generate = useCallback(async (data) => {
        if (!data?.title || !data?.category) {
            setError('Title and category are required');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const result = await generateDescription(data);
            setDescription(result.description || '');
            return result;
        } catch (err) {
            const message = err.response?.data?.error || 'Failed to generate description';
            setError(message);
        } finally {
            setLoading(false);
        }
    }, []);

    const clear = useCallback(() => {
        setDescription('');
        setError(null);
    }, []);

    return { description, loading, error, generate, clear };
};

export default useGenerateDescription;

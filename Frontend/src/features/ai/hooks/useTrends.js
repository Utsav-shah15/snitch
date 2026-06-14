import { useState, useCallback } from 'react';
import { getTrends } from '../services/ai.service';

/**
 * useTrends — Fetches AI-powered trend analysis and predictions for sellers.
 */
const useTrends = () => {
    const [trends, setTrends] = useState([]);
    const [prediction, setPrediction] = useState('');
    const [tip, setTip] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    const fetchTrends = useCallback(async () => {
        setLoading(true);
        setError(false);
        try {
            const data = await getTrends();
            setTrends(data.trends || []);
            setPrediction(data.prediction || '');
            setTip(data.tip || '');
            return data;
        } catch (err) {
            setError(true);
        } finally {
            setLoading(false);
        }
    }, []);

    return { trends, prediction, tip, loading, error, fetchTrends };
};

export default useTrends;

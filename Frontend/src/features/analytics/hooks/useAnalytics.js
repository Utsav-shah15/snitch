import { useState, useCallback } from 'react';
import {
    getAnalyticsOverview,
    getRevenueChart,
    getTopProducts,
    getCategoryStats,
} from '../services/analytics.service';

/**
 * useAnalytics — Wraps all analytics service APIs with state management.
 */
const useAnalytics = () => {
    const [overview, setOverview] = useState(null);
    const [chart, setChart] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch overview stats (total revenue, total orders, etc.)
    const fetchOverview = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getAnalyticsOverview();
            setOverview(data);
            return data;
        } catch (err) {
            const message = err.response?.data?.error || 'Failed to fetch analytics overview';
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch revenue chart data (monthly breakdown)
    const fetchRevenueChart = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getRevenueChart();
            setChart(data.chart || []);
            return data;
        } catch (err) {
            const message = err.response?.data?.error || 'Failed to fetch revenue chart';
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch top-selling products
    const fetchTopProducts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getTopProducts();
            setTopProducts(data.products || []);
            return data;
        } catch (err) {
            const message = err.response?.data?.error || 'Failed to fetch top products';
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch category performance stats
    const fetchCategoryStats = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getCategoryStats();
            setCategories(data.categories || []);
            return data;
        } catch (err) {
            const message = err.response?.data?.error || 'Failed to fetch category stats';
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch all analytics data at once
    const fetchAll = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [ov, rev, prods, cats] = await Promise.all([
                getAnalyticsOverview(),
                getRevenueChart(),
                getTopProducts(),
                getCategoryStats(),
            ]);
            setOverview(ov);
            setChart(rev.chart || []);
            setTopProducts(prods.products || []);
            setCategories(cats.categories || []);
            return { overview: ov, chart: rev.chart, topProducts: prods.products, categories: cats.categories };
        } catch (err) {
            const message = err.response?.data?.error || 'Failed to fetch analytics';
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        overview,
        chart,
        topProducts,
        categories,
        loading,
        error,
        fetchOverview,
        fetchRevenueChart,
        fetchTopProducts,
        fetchCategoryStats,
        fetchAll,
    };
};

export default useAnalytics;

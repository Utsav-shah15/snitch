import { useState, useCallback } from 'react';
import { getMyListings } from '../../products/services/product.service';
import { getSellerOrders, updateOrderStatus as updateOrderStatusApi } from '../../orders/services/order.service';

/**
 * useDashboardStats — Wraps all dashboard-related APIs with state management.
 * Covers: fetching stats, recent orders, and updating order status from the overview.
 */
const useDashboardStats = () => {
    const [stats, setStats] = useState({ listings: 0, orders: 0, revenue: 0, pending: 0 });
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch dashboard overview (listings + orders → compute stats)
    const fetchDashboardData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [listingsData, ordersData] = await Promise.all([
                getMyListings(),
                getSellerOrders(),
            ]);

            const listings = listingsData.products || [];
            const orders = ordersData.orders || [];

            const revenue = orders
                .filter(o => o.status === 'delivered')
                .reduce((sum, o) => sum + o.totalPrice, 0);

            const pending = orders.filter(o => o.status === 'pending').length;

            setStats({
                listings: listings.length,
                orders: orders.length,
                revenue,
                pending,
            });
            setRecentOrders(orders.slice(0, 5));
            return { listings, orders };
        } catch (err) {
            const message = err.response?.data?.error || 'Failed to fetch dashboard data';
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Quick status update from the overview page
    const updateOrderStatus = useCallback(async (id, status) => {
        setError(null);
        try {
            const data = await updateOrderStatusApi(id, status);
            setRecentOrders(prev => prev.map(o => o._id === id ? { ...o, status } : o));
            return data;
        } catch (err) {
            const message = err.response?.data?.error || 'Failed to update order status';
            setError(message);
            throw new Error(message);
        }
    }, []);

    return {
        stats,
        recentOrders,
        loading,
        error,
        fetchDashboardData,
        updateOrderStatus,
    };
};

export default useDashboardStats;

import { useState, useEffect, useCallback } from 'react';
import {
    getMyOrders,
    getSellerOrders,
    getOrderById,
    placeOrder as placeOrderApi,
    updateOrderStatus as updateOrderStatusApi,
    reSnitch as reSnItchApi,
} from '../services/order.service';

/**
 * useOrders — Wraps all order service APIs with state management.
 */
const useOrders = () => {
    const [orders, setOrders] = useState([]);
    const [sellerOrders, setSellerOrders] = useState([]);
    const [currentOrder, setCurrentOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch buyer's orders
    const fetchMyOrders = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getMyOrders();
            setOrders(data.orders || []);
            return data;
        } catch (err) {
            const message = err.response?.data?.error || 'Failed to fetch orders';
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch seller's received orders
    const fetchSellerOrders = useCallback(async (params = {}) => {
        setLoading(true);
        setError(null);
        try {
            const data = await getSellerOrders(params);
            setSellerOrders(data.orders || []);
            return data;
        } catch (err) {
            const message = err.response?.data?.error || 'Failed to fetch seller orders';
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch a single order by ID
    const fetchOrderById = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            const data = await getOrderById(id);
            setCurrentOrder(data.order);
            return data;
        } catch (err) {
            const message = err.response?.data?.error || 'Failed to fetch order';
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Place a new order
    const placeOrder = useCallback(async (orderData) => {
        setLoading(true);
        setError(null);
        try {
            const data = await placeOrderApi(orderData);
            return data;
        } catch (err) {
            const message = err.response?.data?.error || 'Failed to place order';
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Update order status (seller action)
    const updateOrderStatus = useCallback(async (id, status) => {
        setLoading(true);
        setError(null);
        try {
            const data = await updateOrderStatusApi(id, status);
            // Optimistic update in local state
            setSellerOrders(prev => prev.map(o => o._id === id ? { ...o, status } : o));
            return data;
        } catch (err) {
            const message = err.response?.data?.error || 'Failed to update status';
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    }, []);

    // ReSnitch an order
    const reSnitch = useCallback(async (orderId, data) => {
        setLoading(true);
        setError(null);
        try {
            const result = await reSnItchApi(orderId, data);
            return result;
        } catch (err) {
            const message = err.response?.data?.error || 'Failed to resnitch';
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        orders,
        sellerOrders,
        currentOrder,
        loading,
        error,
        fetchMyOrders,
        fetchSellerOrders,
        fetchOrderById,
        placeOrder,
        updateOrderStatus,
        reSnitch,
    };
};

export default useOrders;

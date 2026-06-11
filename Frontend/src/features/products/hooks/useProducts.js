import { useState, useCallback } from 'react';
import {
    getAllProducts,
    getProductById,
    getMyListings,
    createProduct as createProductApi,
    updateProduct as updateProductApi,
    deleteProduct as deleteProductApi,
} from '../services/product.service';

/**
 * useProducts — Wraps all product service APIs with state management.
 */
const useProducts = () => {
    const [products, setProducts] = useState([]);
    const [currentProduct, setCurrentProduct] = useState(null);
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch all products (browse page with filters)
    const fetchAllProducts = useCallback(async (params = {}) => {
        setLoading(true);
        setError(null);
        try {
            const data = await getAllProducts(params);
            setProducts(data.products || []);
            return data;
        } catch (err) {
            const message = err.response?.data?.error || 'Failed to fetch products';
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch a single product by ID
    const fetchProductById = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            const data = await getProductById(id);
            setCurrentProduct(data.product);
            return data;
        } catch (err) {
            const message = err.response?.data?.error || 'Failed to fetch product';
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch seller's own listings
    const fetchMyListings = useCallback(async (params = {}) => {
        setLoading(true);
        setError(null);
        try {
            const data = await getMyListings(params);
            setListings(data.products || []);
            return data;
        } catch (err) {
            const message = err.response?.data?.error || 'Failed to fetch listings';
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Create a new product listing
    const createProduct = useCallback(async (formData) => {
        setLoading(true);
        setError(null);
        try {
            const data = await createProductApi(formData);
            setListings(prev => [data.product, ...prev]);
            return data;
        } catch (err) {
            const message = err.response?.data?.error || 'Failed to create product';
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Update an existing product listing
    const updateProduct = useCallback(async (id, formData) => {
        setLoading(true);
        setError(null);
        try {
            const data = await updateProductApi(id, formData);
            setListings(prev => prev.map(p => p._id === id ? data.product : p));
            setCurrentProduct(data.product);
            return data;
        } catch (err) {
            const message = err.response?.data?.error || 'Failed to update product';
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Delete a product listing
    const deleteProduct = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            const data = await deleteProductApi(id);
            setListings(prev => prev.filter(p => p._id !== id));
            return data;
        } catch (err) {
            const message = err.response?.data?.error || 'Failed to delete product';
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        products,
        currentProduct,
        listings,
        loading,
        error,
        fetchAllProducts,
        fetchProductById,
        fetchMyListings,
        createProduct,
        updateProduct,
        deleteProduct,
    };
};

export default useProducts;

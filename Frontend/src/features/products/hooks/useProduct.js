import { useState, useCallback } from 'react';
import { getProductById } from '../services/product.service';

/**
 * useProduct — Fetches and manages a single product by ID.
 *
 * @param {string} id — Product ID (optional, can call fetchProduct manually)
 */
const useProduct = (id = null) => {
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchProduct = useCallback(async (productId) => {
        const targetId = productId || id;
        if (!targetId) return;

        setLoading(true);
        setError(null);
        try {
            const data = await getProductById(targetId);
            setProduct(data.product);
            return data;
        } catch (err) {
            const message = err.response?.data?.error || 'Failed to fetch product';
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    }, [id]);

    return { product, loading, error, fetchProduct };
};

export default useProduct;

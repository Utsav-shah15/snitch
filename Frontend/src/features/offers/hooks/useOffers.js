import { useState, useCallback } from 'react';
import {
    makeOffer as makeOfferApi,
    getMyOffers as getMyOffersApi,
    getReceivedOffers as getReceivedOffersApi,
    acceptOffer as acceptOfferApi,
    counterOffer as counterOfferApi,
    declineOffer as declineOfferApi,
    getOfferById as getOfferByIdApi,
} from '../services/offer.service';

/**
 * useOffers — Wraps all offer service APIs with state management.
 */
const useOffers = () => {
    const [myOffers, setMyOffers] = useState([]);
    const [receivedOffers, setReceivedOffers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Make a new offer on a product (buyer action)
    const makeOffer = useCallback(async (data) => {
        setLoading(true);
        setError(null);
        try {
            const result = await makeOfferApi(data);
            return result;
        } catch (err) {
            const message = err.response?.data?.error || 'Failed to make offer';
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch offers made by current user (buyer view)
    const fetchMyOffers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getMyOffersApi();
            setMyOffers(data.offers || []);
            return data;
        } catch (err) {
            const message = err.response?.data?.error || 'Failed to fetch your offers';
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch offers received by seller (seller view)
    const fetchReceivedOffers = useCallback(async (params = {}) => {
        setLoading(true);
        setError(null);
        try {
            const data = await getReceivedOffersApi(params);
            setReceivedOffers(data.offers || []);
            return data;
        } catch (err) {
            const message = err.response?.data?.error || 'Failed to fetch received offers';
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Accept an offer (seller action)
    const acceptOffer = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            const data = await acceptOfferApi(id);
            setReceivedOffers(prev => prev.map(o => o._id === id ? { ...o, status: 'accepted' } : o));
            return data;
        } catch (err) {
            const message = err.response?.data?.error || 'Failed to accept offer';
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Counter an offer with a new price (seller action)
    const counterOffer = useCallback(async (id, counterPrice) => {
        setLoading(true);
        setError(null);
        try {
            const data = await counterOfferApi(id, counterPrice);
            setReceivedOffers(prev => prev.map(o => o._id === id ? { ...o, status: 'countered', counterPrice } : o));
            return data;
        } catch (err) {
            const message = err.response?.data?.error || 'Failed to counter offer';
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Decline an offer (seller action)
    const declineOffer = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            const data = await declineOfferApi(id);
            setReceivedOffers(prev => prev.map(o => o._id === id ? { ...o, status: 'declined' } : o));
            return data;
        } catch (err) {
            const message = err.response?.data?.error || 'Failed to decline offer';
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch details of a single offer
    const fetchOfferById = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            const data = await getOfferByIdApi(id);
            return data;
        } catch (err) {
            const message = err.response?.data?.error || 'Failed to fetch offer details';
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        myOffers,
        receivedOffers,
        loading,
        error,
        makeOffer,
        fetchMyOffers,
        fetchReceivedOffers,
        acceptOffer,
        counterOffer,
        declineOffer,
        fetchOfferById,
    };
};

export default useOffers;

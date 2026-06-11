import { useState, useCallback } from 'react';
import { placeOrder } from '../../orders/services/order.service';

/**
 * useCheckout — Manages the full checkout flow: address form, validation, and order placement.
 */
const useCheckout = () => {
    const [address, setAddress] = useState({ street: '', city: '', state: '', pincode: '' });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orderError, setOrderError] = useState('');
    const [success, setSuccess] = useState(false);

    // Handle address field changes
    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setAddress((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
        setOrderError('');
    }, [errors]);

    // Validate all address fields
    const validate = useCallback(() => {
        const errs = {};
        if (!address.street.trim()) errs.street = 'Street address is required';
        if (!address.city.trim()) errs.city = 'City is required';
        if (!address.state.trim()) errs.state = 'State is required';
        if (!address.pincode.trim()) errs.pincode = 'Pincode is required';
        else if (!/^\d{6}$/.test(address.pincode.trim())) errs.pincode = 'Pincode must be 6 digits';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    }, [address]);

    // Place order for all cart items
    const placeAllOrders = useCallback(async (items) => {
        if (!validate()) return false;
        setIsSubmitting(true);
        setOrderError('');

        try {
            for (const item of items) {
                await placeOrder({
                    productId: item._id,
                    quantity: item.quantity,
                    shippingAddress: {
                        street: address.street.trim(),
                        city: address.city.trim(),
                        state: address.state.trim(),
                        pincode: address.pincode.trim(),
                    },
                });
            }
            setSuccess(true);
            return true;
        } catch (err) {
            const message = err.response?.data?.error || 'Failed to place order. Please try again.';
            setOrderError(message);
            throw new Error(message);
        } finally {
            setIsSubmitting(false);
        }
    }, [address, validate]);

    // Place a single order
    const placeSingleOrder = useCallback(async (orderData) => {
        setIsSubmitting(true);
        setOrderError('');
        try {
            const data = await placeOrder(orderData);
            return data;
        } catch (err) {
            const message = err.response?.data?.error || 'Failed to place order';
            setOrderError(message);
            throw new Error(message);
        } finally {
            setIsSubmitting(false);
        }
    }, []);

    return {
        address,
        errors,
        orderError,
        isSubmitting,
        success,
        handleChange,
        validate,
        placeAllOrders,
        placeSingleOrder,
        setSuccess,
    };
};

export default useCheckout;
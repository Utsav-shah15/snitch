import { useState, useCallback } from 'react';
import * as paymentService from '../services/payment.service';

/**
 * usePayment — Manages Razorpay order creation, script loading, popup triggers, and signature verification.
 */
const usePayment = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    // Dynamically load the Razorpay checkout.js script
    const loadRazorpayScript = useCallback(() => {
        return new Promise((resolve) => {
            if (document.getElementById('razorpay-script')) {
                resolve(true);
                return;
            }
            const script = document.createElement('script');
            script.id = 'razorpay-script';
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    }, []);

    // Initiates payment popup and handles signature verification
    const processPayment = useCallback(async ({ item, address, user, offerId }) => {
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            // Step 1: Load Razorpay SDK Script
            const scriptLoaded = await loadRazorpayScript();
            if (!scriptLoaded) {
                throw new Error('Failed to load payment gateway script. Please check your internet connection.');
            }

            // Step 2: Create Razorpay Order on backend
            const orderData = await paymentService.createPaymentOrder({
                productId: item._id,
                quantity: item.quantity,
                offerId,
            });

            // Step 3: Open Razorpay checkout modal
            return new Promise((resolve, reject) => {
                const options = {
                    key: orderData.keyId,
                    amount: orderData.amount,
                    currency: orderData.currency,
                    name: 'SNITCH',
                    description: `Purchase: ${orderData.productTitle}`,
                    order_id: orderData.orderId,
                    prefill: {
                        name: user.fullName,
                        email: user.email,
                        contact: user.contactNumber || '',
                    },
                    theme: {
                        color: '#7c3aed',
                        backdrop_color: 'rgba(0, 0, 0, 0.8)',
                    },
                    handler: async (response) => {
                        try {
                            // Step 4: Verify signature and place DB order
                            const result = await paymentService.verifyPayment({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                productId: item._id,
                                quantity: item.quantity,
                                shippingAddress: {
                                    street: address.street.trim(),
                                    city: address.city.trim(),
                                    state: address.state.trim(),
                                    pincode: address.pincode.trim(),
                                },
                                offerId,
                            });
                            setSuccess(true);
                            resolve(result);
                        } catch (err) {
                            const errMessage = err.response?.data?.error || 'Payment verification failed';
                            setError(errMessage);
                            reject(new Error(errMessage));
                        }
                    },
                    modal: {
                        ondismiss: () => {
                            setLoading(false);
                            reject(new Error('Payment was cancelled'));
                        },
                    },
                };

                const rzp = new window.Razorpay(options);
                rzp.on('payment.failed', (response) => {
                    const failMsg = response.error?.description || 'Payment failed';
                    setError(failMsg);
                    reject(new Error(failMsg));
                });
                rzp.open();
            });

        } catch (err) {
            const msg = err.response?.data?.error || err.response?.data?.message || err.message || 'Payment initiation failed';
            setError(msg);
            setLoading(false);
            throw new Error(msg);
        }
    }, [loadRazorpayScript]);

    return {
        processPayment,
        loading,
        error,
        success,
    };
};

export default usePayment;

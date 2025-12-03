import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'react-toastify';
import './Auth.css';

const PaymentSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [processing, setProcessing] = useState(true);

    useEffect(() => {
        const confirmPayment = async () => {
            const bookingId = searchParams.get('bookingId');
            const token = searchParams.get('token'); // PayPal order ID

            if (!bookingId || !token) {
                toast.error('Invalid payment confirmation');
                navigate('/events');
                return;
            }

            try {
                const response = await api.post('/payments/confirm', {
                    bookingId,
                    paymentIntentId: token,
                });

                if (response.data.success) {
                    toast.success('Payment successful! Your booking is confirmed.');
                    setTimeout(() => {
                        navigate('/bookings');
                    }, 2000);
                } else {
                    toast.error('Payment confirmation failed');
                    navigate('/events');
                }
            } catch (error) {
                console.error('Payment confirmation error:', error);
                toast.error(
                    error.response?.data?.message || 'Payment confirmation failed'
                );
                navigate('/events');
            } finally {
                setProcessing(false);
            }
        };

        confirmPayment();
    }, [searchParams, navigate]);

    return (
        <div className="auth-page">
            <div className="container">
                <div className="auth-card">
                    <h2>Processing Payment</h2>
                    {processing ? (
                        <div>
                            <p>Please wait while we confirm your payment...</p>
                            <div className="loading">Processing...</div>
                        </div>
                    ) : (
                        <p>Redirecting to your bookings...</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccess;

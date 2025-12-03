import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import './Auth.css';

const PaymentCancel = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const bookingId = searchParams.get('bookingId');
        toast.warning('Payment was cancelled. You can try again later.');

        setTimeout(() => {
            if (bookingId) {
                // Redirect back to events page
                navigate('/events');
            } else {
                navigate('/events');
            }
        }, 2000);
    }, [searchParams, navigate]);

    return (
        <div className="auth-page">
            <div className="container">
                <div className="auth-card">
                    <h2>Payment Cancelled</h2>
                    <p>Your payment was cancelled. No charges were made.</p>
                    <p>Redirecting you back to events...</p>
                </div>
            </div>
        </div>
    );
};

export default PaymentCancel;

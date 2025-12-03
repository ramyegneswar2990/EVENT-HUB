import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { toast } from 'react-toastify';
import './Bookings.css';

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await api.get('/bookings');
      setBookings(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      await api.delete(`/bookings/${id}`);
      toast.success('Booking cancelled');
      fetchBookings();
    } catch (error) {
      toast.error('Failed to cancel booking');
    }
  };

  if (loading) {
    return <div className="loading">Loading bookings...</div>;
  }

  return (
    <div className="bookings-page">
      <div className="container">
        <h1>My Bookings</h1>

        {bookings.length === 0 ? (
          <div className="no-bookings">
            <p>You have no bookings yet.</p>
            <a href="/events" className="btn btn-primary">
              Browse Events
            </a>
          </div>
        ) : (
          <div className="bookings-list">
            {bookings.map((booking) => (
              <div key={booking._id} className="booking-card">
                <div className="booking-header">
                  <h3>{booking.event.title}</h3>
                  <span
                    className={`status status-${booking.paymentStatus}`}
                  >
                    {booking.paymentStatus}
                  </span>
                </div>
                <div className="booking-details">
                  <p>
                    <strong>Date:</strong>{' '}
                    {new Date(booking.event.date).toLocaleDateString()} at{' '}
                    {booking.event.time}
                  </p>
                  <p>
                    <strong>Venue:</strong> {booking.event.venue}
                  </p>
                  <p>
                    <strong>Tickets:</strong> {booking.tickets}
                  </p>
                  <p>
                    <strong>Total Amount:</strong> ${booking.totalAmount}
                  </p>
                  <p>
                    <strong>Booking Date:</strong>{' '}
                    {new Date(booking.bookingDate).toLocaleDateString()}
                  </p>
                </div>
                {booking.paymentStatus === 'pending' && (
                  <div className="booking-actions">
                    <button
                      onClick={() => handleDelete(booking._id)}
                      className="btn btn-danger"
                    >
                      Cancel Booking
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookings;


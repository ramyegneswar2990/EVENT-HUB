import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import './EventDetail.css';

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState(1);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      const response = await api.get(`/events/${id}`);
      setEvent(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch event details');
      navigate('/events');
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!user) {
      toast.error('Please login to book tickets');
      navigate('/login');
      return;
    }

    if (tickets > event.availableTickets) {
      toast.error(`Only ${event.availableTickets} tickets available`);
      return;
    }

    try {
      setProcessing(true);
      toast.info('Creating booking and redirecting to PayPal...');

      // Create booking
      const bookingResponse = await api.post('/bookings', {
        eventId: id,
        tickets: parseInt(tickets),
      });

      // Create PayPal order and get approval URL
      const paymentResponse = await api.post('/payments/create-intent', {
        bookingId: bookingResponse.data.data._id,
      });

      if (paymentResponse.data.success && paymentResponse.data.approvalUrl) {
        // Redirect to PayPal for payment
        window.location.href = paymentResponse.data.approvalUrl;
      } else {
        toast.error('Failed to initialize payment');
        setProcessing(false);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Failed to create booking'
      );
      setProcessing(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading event details...</div>;
  }

  if (!event) {
    return null;
  }

  return (
    <div className="event-detail-page">
      <div className="container">
        <div className="event-detail-content">
          <div className="event-detail-main">
            <img
              src={event.image || 'https://via.placeholder.com/800x400'}
              alt={event.title}
              className="event-detail-image"
            />
            <div className="event-detail-info">
              <h1>{event.title}</h1>
              <p className="event-category">{event.category}</p>
              <p className="event-description">{event.description}</p>

              <div className="event-details-section">
                <h3>Event Details</h3>
                <div className="detail-item">
                  <strong>Date:</strong>{' '}
                  {new Date(event.date).toLocaleDateString()}
                </div>
                <div className="detail-item">
                  <strong>Time:</strong> {event.time}
                </div>
                <div className="detail-item">
                  <strong>Venue:</strong> {event.venue}
                </div>
                <div className="detail-item">
                  <strong>Location:</strong> {event.location}
                </div>
                <div className="detail-item">
                  <strong>Price:</strong> ${event.price} per ticket
                </div>
                <div className="detail-item">
                  <strong>Available Tickets:</strong> {event.availableTickets}
                </div>
              </div>
            </div>
          </div>

          <div className="booking-section">
            <div className="booking-card">
              <h2>Book Tickets</h2>
              <div className="form-group">
                <label>Number of Tickets</label>
                <input
                  type="number"
                  min="1"
                  max={event.availableTickets}
                  value={tickets}
                  onChange={(e) => setTickets(e.target.value)}
                  className="ticket-input"
                  disabled={processing}
                />
              </div>
              <div className="booking-summary">
                <p>
                  <strong>Total:</strong> ${event.price * tickets}
                </p>
              </div>
              <button
                onClick={handleBooking}
                className="btn btn-primary btn-block"
                disabled={event.availableTickets === 0 || processing}
              >
                {processing
                  ? 'Redirecting to PayPal...'
                  : event.availableTickets === 0
                    ? 'Sold Out'
                    : 'Book Now & Pay'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;

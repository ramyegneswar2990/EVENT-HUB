import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';

const ComplimentaryBookingForm = ({ events, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        eventId: '',
        userEmail: '',
        tickets: 1,
        bookingType: 'complimentary',
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/bookings/admin/complimentary', formData);
            if (response.data.success) {
                toast.success('Complimentary booking created successfully!');
                onSuccess();
                onClose();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create booking');
        }
    };

    return (
        <div className="event-form-modal">
            <div className="event-form-card">
                <h3>Create VIP/Complimentary Booking</h3>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>User Email</label>
                        <input
                            type="email"
                            value={formData.userEmail}
                            onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
                            placeholder="user@example.com"
                            required
                        />
                        <small>User must have a registered account</small>
                    </div>

                    <div className="form-group">
                        <label>Event</label>
                        <select
                            value={formData.eventId}
                            onChange={(e) => setFormData({ ...formData, eventId: e.target.value })}
                            required
                        >
                            <option value="">Select an event</option>
                            {events.map((event) => (
                                <option key={event._id} value={event._id}>
                                    {event.title} - {new Date(event.date).toLocaleDateString()}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Number of Tickets</label>
                        <input
                            type="number"
                            min="1"
                            value={formData.tickets}
                            onChange={(e) => setFormData({ ...formData, tickets: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Booking Type</label>
                        <select
                            value={formData.bookingType}
                            onChange={(e) => setFormData({ ...formData, bookingType: e.target.value })}
                        >
                            <option value="complimentary">Complimentary</option>
                            <option value="vip">VIP</option>
                        </select>
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="btn btn-primary">
                            Create Booking
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn btn-secondary"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ComplimentaryBookingForm;

import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import api from '../utils/api';
import { toast } from 'react-toastify';
import ComplimentaryBookingForm from '../components/Common/ComplimentaryBookingForm';
import './AdminDashboard.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [events, setEvents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEventForm, setShowEventForm] = useState(false);
  const [showComplimentaryForm, setShowComplimentaryForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [sortBy, setSortBy] = useState('date');
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'concert',
    date: '',
    time: '',
    venue: '',
    location: '',
    price: '',
    totalTickets: '',
    availableTickets: '',
    image: '',
  });

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchEvents(), fetchBookings()]);
      setLoading(false);
    };
    loadData();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await api.get('/events');
      setEvents(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch events');
    }
  };

  const fetchBookings = async () => {
    try {
      const response = await api.get('/bookings');
      setBookings(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch bookings');
    }
  };

  // Calculate metrics
  const totalEvents = events.length;
  const totalBookings = bookings.length;
  const totalUsers = new Set(
    bookings
      .map((b) => (b.user ? b.user.email : null))
      .filter((email) => !!email)
  ).size;
  const totalRevenue = bookings
    .filter((b) => b.paymentStatus === 'completed')
    .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  const upcomingEventsCount = events.filter((e) => {
    if (!e.date) return false;
    const d = new Date(e.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return d >= today;
  }).length;

  const pendingBookingsCount = bookings.filter(
    (b) => b.paymentStatus === 'pending'
  ).length;

  // Prepare chart data
  const getRevenueChartData = () => {
    const last6Months = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      last6Months.push({
        month: monthNames[d.getMonth()],
        year: d.getFullYear(),
        revenue: 0,
      });
    }

    bookings.forEach((booking) => {
      if (booking.paymentStatus === 'completed' && booking.bookingDate) {
        const bookingDate = new Date(booking.bookingDate);
        const monthIndex = last6Months.findIndex(
          (m) =>
            m.month === monthNames[bookingDate.getMonth()] &&
            m.year === bookingDate.getFullYear()
        );
        if (monthIndex !== -1) {
          last6Months[monthIndex].revenue += booking.totalAmount || 0;
        }
      }
    });

    return {
      labels: last6Months.map((m) => m.month),
      datasets: [
        {
          label: 'Revenue ($)',
          data: last6Months.map((m) => m.revenue),
          borderColor: 'rgb(102, 126, 234)',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          tension: 0.4,
          fill: true,
        },
      ],
    };
  };

  const getBookingsChartData = () => {
    const eventBookings = {};
    bookings.forEach((booking) => {
      const eventTitle = booking.event?.title || 'Unknown';
      eventBookings[eventTitle] = (eventBookings[eventTitle] || 0) + booking.tickets;
    });

    const sortedEvents = Object.entries(eventBookings)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return {
      labels: sortedEvents.map(([title]) => title),
      datasets: [
        {
          label: 'Tickets Booked',
          data: sortedEvents.map(([, count]) => count),
          backgroundColor: [
            'rgba(102, 126, 234, 0.8)',
            'rgba(240, 147, 251, 0.8)',
            'rgba(79, 172, 254, 0.8)',
            'rgba(67, 233, 123, 0.8)',
            'rgba(245, 87, 108, 0.8)',
          ],
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
    },
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEvent) {
        await api.put(`/events/${editingEvent._id}`, formData);
        toast.success('Event updated successfully');
      } else {
        await api.post('/events', formData);
        toast.success('Event created successfully');
      }
      setShowEventForm(false);
      setEditingEvent(null);
      setFormData({
        title: '',
        description: '',
        category: 'concert',
        date: '',
        time: '',
        venue: '',
        location: '',
        price: '',
        totalTickets: '',
        availableTickets: '',
        image: '',
      });
      fetchEvents();
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Failed to save event'
      );
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      category: event.category,
      date: new Date(event.date).toISOString().split('T')[0],
      time: event.time,
      venue: event.venue,
      location: event.location,
      price: event.price,
      totalTickets: event.totalTickets,
      availableTickets: event.availableTickets,
      image: event.image || '',
    });
    setShowEventForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) {
      return;
    }

    try {
      await api.delete(`/events/${id}`);
      toast.success('Event deleted successfully');
      fetchEvents();
    } catch (error) {
      toast.error('Failed to delete event');
    }
  };

  const handleSendReminder = async (bookingId) => {
    try {
      await api.post('/payments/send-reminder', { bookingId });
      toast.success('Reminder sent successfully');
    } catch (error) {
      toast.error('Failed to send reminder');
    }
  };

  // Sort and filter events
  const getSortedEvents = () => {
    let filtered = events.filter(event =>
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return filtered.sort((a, b) => {
      if (sortBy === 'date') return new Date(a.date) - new Date(b.date);
      if (sortBy === 'price') return a.price - b.price;
      if (sortBy === 'tickets') return a.availableTickets - b.availableTickets;
      return 0;
    });
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="admin-dashboard">
      <div className="container">
        <h1>📊 Admin Dashboard</h1>

        {/* Summary Cards */}
        <div className="dashboard-summary-grid">
          <div className="summary-card clickable" onClick={() => setActiveTab('events')}>
            <div className="summary-card-header">
              <h3>Total Events</h3>
              <span className="summary-card-icon">🎫</span>
            </div>
            <p className="summary-value">{totalEvents}</p>
            <p className="summary-trend">
              <span className="trend-up">↑ {upcomingEventsCount} upcoming</span>
            </p>
          </div>

          <div className="summary-card clickable" onClick={() => setActiveTab('bookings')}>
            <div className="summary-card-header">
              <h3>Total Bookings</h3>
              <span className="summary-card-icon">📋</span>
            </div>
            <p className="summary-value">{totalBookings}</p>
            <p className="summary-trend">
              {pendingBookingsCount > 0 && (
                <span className="trend-down">{pendingBookingsCount} pending</span>
              )}
            </p>
          </div>

          <div className="summary-card clickable" onClick={() => setActiveTab('bookings')}>
            <div className="summary-card-header">
              <h3>Total Users</h3>
              <span className="summary-card-icon">👥</span>
            </div>
            <p className="summary-value">{totalUsers}</p>
            <p className="summary-trend">Active customers</p>
          </div>

          <div className="summary-card clickable" onClick={() => setActiveTab('bookings')}>
            <div className="summary-card-header">
              <h3>Total Revenue</h3>
              <span className="summary-card-icon">💰</span>
            </div>
            <p className="summary-value">${totalRevenue.toFixed(2)}</p>
            <p className="summary-trend">
              <span className="trend-up">↑ All time</span>
            </p>
          </div>
        </div>

        {/* Charts Section */}
        {activeTab === 'overview' && (
          <div className="dashboard-charts">
            <div className="chart-card">
              <h3>📈 Revenue Trend (Last 6 Months)</h3>
              <Line data={getRevenueChartData()} options={chartOptions} />
            </div>

            <div className="chart-card">
              <h3>🎯 Top Events by Bookings</h3>
              <Bar data={getBookingsChartData()} options={chartOptions} />
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="admin-tabs">
          <button
            className={activeTab === 'overview' ? 'active' : ''}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={activeTab === 'events' ? 'active' : ''}
            onClick={() => setActiveTab('events')}
          >
            Events
          </button>
          <button
            className={activeTab === 'bookings' ? 'active' : ''}
            onClick={() => setActiveTab('bookings')}
          >
            Bookings
          </button>
        </div>

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div className="admin-section">
            <div className="section-header">
              <h2>Manage Events</h2>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '8px' }}
                />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '8px' }}
                >
                  <option value="date">Sort by Date</option>
                  <option value="price">Sort by Price</option>
                  <option value="tickets">Sort by Tickets</option>
                </select>
                <button
                  onClick={() => {
                    setShowEventForm(true);
                    setEditingEvent(null);
                    setFormData({
                      title: '',
                      description: '',
                      category: 'concert',
                      date: '',
                      time: '',
                      venue: '',
                      location: '',
                      price: '',
                      totalTickets: '',
                      availableTickets: '',
                      image: '',
                    });
                  }}
                  className="btn btn-primary"
                >
                  ➕ Create Event
                </button>
              </div>
            </div>

            {showEventForm && (
              <div className="event-form-modal">
                <div className="event-form-card">
                  <h3>{editingEvent ? 'Edit Event' : 'Create New Event'}</h3>
                  <form onSubmit={handleSubmit}>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Title</label>
                        <input
                          type="text"
                          name="title"
                          value={formData.title}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Category</label>
                        <select
                          name="category"
                          value={formData.category}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="concert">Concert</option>
                          <option value="conference">Conference</option>
                          <option value="workshop">Workshop</option>
                          <option value="sports">Sports</option>
                          <option value="theater">Theater</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Description</label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Date</label>
                        <input
                          type="date"
                          name="date"
                          value={formData.date}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Time</label>
                        <input
                          type="time"
                          name="time"
                          value={formData.time}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Venue</label>
                        <input
                          type="text"
                          name="venue"
                          value={formData.venue}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Location</label>
                        <input
                          type="text"
                          name="location"
                          value={formData.location}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Price ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          name="price"
                          value={formData.price}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Total Tickets</label>
                        <input
                          type="number"
                          name="totalTickets"
                          value={formData.totalTickets}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Available Tickets</label>
                        <input
                          type="number"
                          name="availableTickets"
                          value={formData.availableTickets}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Image URL</label>
                      <input
                        type="url"
                        name="image"
                        value={formData.image}
                        onChange={handleInputChange}
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                    <div className="form-actions">
                      <button type="submit" className="btn btn-primary">
                        {editingEvent ? '✅ Update' : '✅ Create'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowEventForm(false);
                          setEditingEvent(null);
                        }}
                        className="btn btn-secondary"
                      >
                        ❌ Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <div className="events-list">
              {getSortedEvents().map((event) => (
                <div key={event._id} className="admin-event-card">
                  <div className="event-info">
                    <h3>{event.title}</h3>
                    <p className="event-meta">
                      {event.category} • {new Date(event.date).toLocaleDateString()}{' '}
                      • ${event.price} • {event.availableTickets} available
                    </p>
                  </div>
                  <div className="event-actions">
                    <button
                      onClick={() => handleEdit(event)}
                      className="btn btn-secondary"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(event._id)}
                      className="btn btn-danger"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="admin-section">
            <div className="section-header">
              <h2>All Bookings</h2>
              <button
                onClick={() => setShowComplimentaryForm(true)}
                className="btn btn-primary"
              >
                🎁 Create VIP/Complimentary Booking
              </button>
            </div>

            {showComplimentaryForm && (
              <ComplimentaryBookingForm
                events={events}
                onClose={() => setShowComplimentaryForm(false)}
                onSuccess={() => {
                  fetchBookings();
                  setShowComplimentaryForm(false);
                }}
              />
            )}

            <div className="bookings-list">
              {bookings.map((booking) => {
                const event = booking.event || {};
                const user = booking.user || {};

                return (
                  <div key={booking._id} className="admin-booking-card">
                    <div className="booking-info">
                      <h3>{event.title || 'Unknown Event'}</h3>
                      <p>
                        <strong>User:</strong>{' '}
                        {user.name ? `${user.name} (${user.email})` : 'Unknown User'}
                      </p>
                      <p>
                        <strong>Tickets:</strong> {booking.tickets}
                      </p>
                      <p>
                        <strong>Amount:</strong> ${booking.totalAmount}
                      </p>
                      <p>
                        <strong>Status:</strong>{' '}
                        <span className={`status status-${booking.paymentStatus}`}>
                          {booking.paymentStatus}
                        </span>
                      </p>
                      {booking.bookingType && booking.bookingType !== 'regular' && (
                        <p>
                          <strong>Type:</strong> {booking.bookingType.toUpperCase()}
                        </p>
                      )}
                    </div>
                    {booking.paymentStatus === 'completed' && !booking.reminderSent && (
                      <button
                        onClick={() => handleSendReminder(booking._id)}
                        className="btn btn-success"
                      >
                        📧 Send Reminder
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

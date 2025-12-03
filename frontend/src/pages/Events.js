import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'react-toastify';
import './Events.css';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    search: searchParams.get('search') || '',
    dateFilter: 'all',
  });

  const dateFilters = [
    { value: 'all', label: 'All' },
    { value: 'today', label: 'Today' },
    { value: 'tomorrow', label: 'Tomorrow' },
    { value: 'thisWeek', label: 'This Week' },
    { value: 'thisWeekend', label: 'This Weekend' },
    { value: 'nextWeek', label: 'Next Week' },
    { value: 'nextWeekend', label: 'Next Weekend' },
    { value: 'thisMonth', label: 'This Month' },
    { value: 'nextMonth', label: 'Next Month' },
  ];

  const categories = [
    { value: '', label: 'All' },
    { value: 'concert', label: 'Music and Theater' },
    { value: 'conference', label: 'Business' },
    { value: 'workshop', label: 'Education and Training' },
    { value: 'sports', label: 'Sports and Fitness' },
    { value: 'theater', label: 'Arts' },
    { value: 'other', label: 'Community and Culture' },
  ];

  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      category: searchParams.get('category') || '',
      search: searchParams.get('search') || ''
    }));
  }, [searchParams]);

  useEffect(() => {
    fetchEvents();
  }, [filters]);

  const getDateRange = (filter) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let start, end;

    switch (filter) {
      case 'today':
        start = today;
        end = new Date(today);
        end.setDate(end.getDate() + 1);
        break;
      case 'tomorrow':
        start = new Date(today);
        start.setDate(start.getDate() + 1);
        end = new Date(start);
        end.setDate(end.getDate() + 1);
        break;
      case 'thisWeek':
        start = today;
        end = new Date(today);
        end.setDate(end.getDate() + 7);
        break;
      case 'thisWeekend':
        const dayOfWeek = today.getDay();
        const daysUntilSaturday = 6 - dayOfWeek;
        start = new Date(today);
        start.setDate(start.getDate() + daysUntilSaturday);
        end = new Date(start);
        end.setDate(end.getDate() + 2);
        break;
      case 'nextWeek':
        start = new Date(today);
        start.setDate(start.getDate() + 7);
        end = new Date(start);
        end.setDate(end.getDate() + 7);
        break;
      case 'nextWeekend':
        const nextWeekendStart = new Date(today);
        nextWeekendStart.setDate(nextWeekendStart.getDate() + (13 - today.getDay()));
        start = nextWeekendStart;
        end = new Date(start);
        end.setDate(end.getDate() + 2);
        break;
      case 'thisMonth':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        break;
      case 'nextMonth':
        start = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        end = new Date(now.getFullYear(), now.getMonth() + 2, 1);
        break;
      default:
        return null;
    }
    return { start, end };
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.search) params.append('search', filters.search);

      const response = await api.get(`/events?${params.toString()}`);
      let filteredEvents = response.data.data;

      // Apply date filter
      if (filters.dateFilter !== 'all') {
        const dateRange = getDateRange(filters.dateFilter);
        if (dateRange) {
          filteredEvents = filteredEvents.filter((event) => {
            const eventDate = new Date(event.date);
            return eventDate >= dateRange.start && eventDate < dateRange.end;
          });
        }
      }

      setEvents(filteredEvents);
    } catch (error) {
      toast.error('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters({
      ...filters,
      [name]: value,
    });
    if (name === 'category' || name === 'search') {
      const params = new URLSearchParams(searchParams);
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      setSearchParams(params);
    }
  };

  if (loading) {
    return <div className="loading">Loading events...</div>;
  }

  return (
    <div className="events-page">
      <div className="container">
        <div className="filters-section">
          <div className="category-filters">
            {categories.map((cat) => (
              <Link
                key={cat.value}
                to={cat.value ? `/events?category=${cat.value}` : '/events'}
                className={`category-link ${filters.category === cat.value ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleFilterChange('category', cat.value);
                }}
              >
                {cat.label}
              </Link>
            ))}
          </div>
        </div>

        {events.length === 0 ? (
          <div className="no-events">
            <p>No events found</p>
            <p className="no-events-subtitle">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="events-grid">
            {events.map((event) => (
              <div key={event._id} className="event-card">
                <div className="event-image-container">
                  <img
                    src={event.image || 'https://via.placeholder.com/400x300'}
                    alt={event.title}
                    className="event-image"
                  />
                  <div className="event-badge">{event.category}</div>
                </div>
                <div className="event-content">
                  <h3 className="event-title">{event.title}</h3>
                  <p className="event-description">
                    {event.description.substring(0, 80)}...
                  </p>
                  <div className="event-meta">
                    <div className="meta-item">
                      <span className="meta-icon">📅</span>
                      <span>{new Date(event.date).toLocaleDateString()}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-icon">🕐</span>
                      <span>{event.time}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-icon">📍</span>
                      <span>{event.venue}</span>
                    </div>
                  </div>
                  <div className="event-footer">
                    <div className="event-price">
                      <span className="price-label">From</span>
                      <span className="price-amount">${event.price}</span>
                    </div>
                    <Link
                      to={`/events/${event._id}`}
                      className="btn-view-details"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;


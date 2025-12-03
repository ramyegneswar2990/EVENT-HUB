import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const [location, setLocation] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    if (location) params.append('location', location);
    navigate(`/events?${params.toString()}`);
  };

  return (
    <div className="home">
      <div className="hero-section">
        <div className="hero-overlay">
          <div className="container">
            <h1 className="hero-title">Discover Events For All The Things You Love</h1>
            <form className="hero-search" onSubmit={handleSearch}>
              <div className="search-input-group">
                <span className="search-icon">📍</span>
                <input
                  type="text"
                  placeholder="Enter Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="search-field"
                />
              </div>
              <div className="search-input-group">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Search Event"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-field"
                />
              </div>
              <button type="submit" className="search-button">
                Find Events
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="container">
        <section className="features">
          <h2>Why Choose EventHub?</h2>
          <div className="grid">
            <div className="card">
              <h3>🎫 Easy Booking</h3>
              <p>Book your favorite events with just a few clicks</p>
            </div>
            <div className="card">
              <h3>💳 Secure Payments</h3>
              <p>Safe and secure payment processing with Stripe</p>
            </div>
            <div className="card">
              <h3>📅 Event Reminders</h3>
              <p>Never miss an event with our reminder system</p>
            </div>
            <div className="card">
              <h3>📱 Responsive Design</h3>
              <p>Access from any device, anywhere, anytime</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;


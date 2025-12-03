import React, { useContext, useState } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAdmin } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');

  const currentCategory = searchParams.get('category');
  const isEventsPage = location.pathname === '/events';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/events?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const getLinkClass = (category) => {
    if (!isEventsPage) return 'secondary-link';

    if (category === null) {
      // "Events" link (All) - active if no category param
      return !currentCategory ? 'secondary-link active' : 'secondary-link';
    }

    return currentCategory === category ? 'secondary-link active' : 'secondary-link';
  };

  return (
    <>
      <nav className="navbar">
        <div className="container">
          <div className="navbar-content">
            <Link to="/" className="navbar-brand">
              <span className="brand-text">EventHub</span>
            </Link>
            <form className="navbar-search" onSubmit={handleSearch}>
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search for Events, Concerts, Conferences..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="navbar-search-input"
              />
            </form>
            <div className="navbar-right">
              {user ? (
                <>
                  <span className="user-name">Hello, {user.name}</span>
                  <Link to="/bookings" className="navbar-link">My Bookings</Link>
                  {isAdmin() && <Link to="/admin" className="navbar-link">Admin</Link>}
                  <button onClick={handleLogout} className="btn-signin">
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn-signin">
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
      <nav className="navbar-secondary">
        <div className="container">
          <div className="secondary-nav-links">
            <Link to="/events" className={getLinkClass(null)}>Events</Link>
            <Link to="/events?category=concert" className={getLinkClass('concert')}>Concerts</Link>
            <Link to="/events?category=conference" className={getLinkClass('conference')}>Conferences</Link>
            <Link to="/events?category=workshop" className={getLinkClass('workshop')}>Workshops</Link>
            <Link to="/events?category=sports" className={getLinkClass('sports')}>Sports</Link>
            <Link to="/events?category=theater" className={getLinkClass('theater')}>Theater</Link>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;


import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

function Navbar() {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  // Fetch user role directly if user object is not available
  useEffect(() => {
    const fetchUserRole = async () => {
      if (isAuthenticated && !user) {
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get('http://localhost:5454/api/users/me', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          setUserRole(response.data.role);
          console.log('Navbar: Fetched role directly:', response.data.role);
        } catch (error) {
          console.error('Navbar: Failed to fetch role:', error);
        }
      } else if (user) {
        setUserRole(user.role);
      }
    };
    fetchUserRole();
  }, [isAuthenticated, user]);

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      if (isAuthenticated && user?.id) {
        try {
          console.log('🔔 Fetching notifications for user ID:', user.id);
          const response = await axios.get(`http://localhost:8086/api/notifications/user/${user.id}`);
          console.log('📬 Notifications fetched:', response.data?.length || 0, 'notifications');
          setNotifications(response.data || []);
          const unread = (response.data || []).filter(n => !n.isRead).length;
          setUnreadCount(unread);
          console.log('📊 Unread count:', unread);
        } catch (error) {
          console.error('❌ Failed to fetch notifications:', error);
          console.error('Error details:', error.response?.data || error.message);
          setNotifications([]);
          setUnreadCount(0);
        }
      }
    };
    
    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated, user]);

  const isEmployer = (user?.role || userRole) === 'ROLE_EMPLOYER';

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    closeMenu();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" onClick={closeMenu}>
          <span>💼</span> Job Portal
        </Link>
        
        <div className={`hamburger ${menuOpen ? 'active' : ''}`} onClick={toggleMenu}>
          <span></span>
          <span></span>
          <span></span>
        </div>
        
        <div className={`navbar-menu ${menuOpen ? 'active' : ''}`}>
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="navbar-link" onClick={closeMenu}>Dashboard</Link>
              {(user?.role || userRole) === 'ROLE_ADMIN' || (user?.role || userRole) === 'ROLE_ADMINISTRATOR' ? (
                <Link to="/admin" className="navbar-link" onClick={closeMenu}>Admin Panel</Link>
              ) : isEmployer ? (
                <Link to="/post-job" className="navbar-link" onClick={closeMenu}>Add Job</Link>
              ) : (
                <Link to="/jobs" className="navbar-link" onClick={closeMenu}>Jobs</Link>
              )}
              {(user?.role || userRole) !== 'ROLE_ADMIN' && (user?.role || userRole) !== 'ROLE_ADMINISTRATOR' && (
                <>
                  <Link to="/applications" className="navbar-link" onClick={closeMenu}>Applications</Link>
                  <Link to="/profile" className="navbar-link" onClick={closeMenu}>Profile</Link>
                </>
              )}
              
              {/* Notification Bell */}
              <div className="notification-container">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="notification-bell"
                  aria-label="Notifications"
                >
                  🔔
                  {unreadCount > 0 && (
                    <span className="notification-badge">
                      {unreadCount}
                    </span>
                  )}
                </button>
                
                {/* Notification Dropdown */}
                {showNotifications && (
                  <div className="notification-dropdown">
                    <div className="notification-header">
                      <span>Notifications</span>
                      <span style={{ fontSize: '12px', color: '#666', fontWeight: 'normal' }}>
                        {unreadCount} unread
                      </span>
                    </div>
                    {notifications.length === 0 ? (
                      <div style={{ padding: '30px', textAlign: 'center', color: '#999' }}>
                        No notifications yet
                      </div>
                    ) : (
                      notifications.map(notification => (
                        <div 
                          key={notification.id}
                          className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                        >
                          <div style={{ 
                            fontWeight: notification.isRead ? 'normal' : 'bold',
                            color: '#333',
                            marginBottom: '5px',
                            fontSize: '14px'
                          }}>
                            {notification.subject}
                          </div>
                          <div style={{ 
                            color: '#666',
                            fontSize: '13px',
                            marginBottom: '5px'
                          }}>
                            {notification.message}
                          </div>
                          <div style={{ 
                            color: '#999',
                            fontSize: '11px'
                          }}>
                            {new Date(notification.createdAt).toLocaleString()}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
              
              <button onClick={handleLogout} className="navbar-button">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-link" onClick={closeMenu}>Login</Link>
              <Link to="/register" className="navbar-register" onClick={closeMenu}>Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

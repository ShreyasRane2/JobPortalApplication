import React, { useState, useEffect } from 'react';
import { notificationAPI } from '../services/api';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError(null);

      const storedUser = localStorage.getItem("user");

      if (!storedUser) {
        setError("User not logged in");
        setLoading(false);
        return;
      }

      const user = JSON.parse(storedUser);

      if (!user?.id) {
        setError("Invalid user data");
        setLoading(false);
        return;
      }

      const response = await notificationAPI.getNotifications(user.id);
      setNotifications(response.data);

    } catch (error) {
      console.error("❌ Error loading notifications:", error);
      setError("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      await loadNotifications(); // refresh list
    } catch (error) {
      console.error("❌ Error marking notification as read:", error);
    }
  };

  if (loading) {
    return <div className="loading">Loading notifications...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="container">
      <h1 className="page-title">Notifications</h1>

      {notifications.length === 0 ? (
        <div className="card">
          <p>No notifications found.</p>
        </div>
      ) : (
        notifications.map((notif) => (
          <div
            key={notif.id}
            className="card"
            style={{ marginBottom: "15px" }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "start",
              }}
            >
              <div>
                <h4>{notif.subject}</h4>
                <p>{notif.message}</p>
                <small style={{ color: "#999" }}>
                  {notif.createdAt
                    ? new Date(notif.createdAt).toLocaleString()
                    : ""}
                </small>
              </div>

              {!notif.isRead && (
                <button
                  onClick={() => markAsRead(notif.id)}
                  className="btn btn-primary"
                  style={{ fontSize: "12px", padding: "5px 10px" }}
                >
                  Mark as Read
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Notifications;

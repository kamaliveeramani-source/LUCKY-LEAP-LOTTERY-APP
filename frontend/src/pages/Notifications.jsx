import { useEffect, useState } from "react";
import API, { getAuthToken } from "../services/api";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    if (!getAuthToken()) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await API.get("/notifications");
      setNotifications(Array.isArray(response.data?.data) ? response.data.data : []);
      await API.patch("/notifications/read-all");
    } catch (error) {
      console.error("Failed to load notifications", error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="page-content notifications-page-content">
        {loading ? (
          <div className="notification-card empty-card">
            <div className="notification-content">
              <div className="notification-info">
                <div className="notification-title">Loading notifications...</div>
              </div>
            </div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="notification-card empty-card">
            <div className="notification-content">
              <div className="notification-info">
                <div className="notification-title">No notifications yet</div>
                <div className="notification-message">Your activity updates will appear here.</div>
              </div>
            </div>
          </div>
        ) : (
          notifications.map((notification) => (
            <div key={notification.id} className="notification-card">
              <div className="notification-icon">•</div>
              <div className="notification-content">
                <div className="notification-info">
                  <div className="notification-title">{notification.title}</div>
                  <div className="notification-message">{notification.message}</div>
                </div>
                <div className="notification-meta">
                  <div className={`notification-dot ${notification.read ? "read" : "unread"}`} />
                  <span className="notification-time">{new Date(notification.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
  );
}

export default Notifications;


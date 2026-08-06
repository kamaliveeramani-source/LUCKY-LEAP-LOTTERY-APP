import { useEffect, useState } from "react";
import { getNotifications, markAllRead } from "../services/notificationService";

function Notifications() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    setNotifications(getNotifications());
    markAllRead();
  }, []);

  return (
      <div className="page-content notifications-page-content">
        {notifications.length === 0 ? (
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
                  <span className="notification-time">{new Date(notification.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
  );
}

export default Notifications;

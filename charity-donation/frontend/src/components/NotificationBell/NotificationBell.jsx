import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useSocket } from "../../hooks/useSocket";
import { useAuth } from "../../context/AuthContext";
import "./NotificationBell.css";

const NotificationBell = () => {
  const { user } = useAuth();
  const socket = useSocket();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchNotifications();

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on("new_notification", (notification) => {
        setNotifications((prev) => [notification, ...prev]);
        // Tùy chọn: API có thể emit ra notification detail
      });
    }
    return () => {
      if (socket) socket.off("new_notification");
    };
  }, [socket]);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/notifications", {
        withCredentials: true,
      });
      setNotifications(res.data.notifications || []);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/notifications/${id}/read`, {}, {
        withCredentials: true,
      });
      setNotifications((prev) =>
        prev.map((notif) => (notif.id === id ? { ...notif, is_read: 1 } : notif))
      );
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put("http://localhost:5000/api/notifications/read-all", {}, {
        withCredentials: true,
      });
      setNotifications((prev) => prev.map((notif) => ({ ...notif, is_read: 1 })));
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const handleClickNotification = (notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    setIsOpen(false);

    if (notification.type === "PROJECT_SUBMITTED") {
      navigate("/admin/projects/pending");
    } else if (notification.type === "WITHDRAWAL_REQUESTED") {
      navigate("/admin/withdrawals");
    } else if (notification.type === "PROJECT_REVIEWED" || notification.type === "WITHDRAWAL_REVIEWED") {
      // User / Founder click
      navigate("/founder/projects");
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <li className="notification-icon" ref={dropdownRef}>
      <div className="bell-container" onClick={() => setIsOpen(!isOpen)}>
        🔔
        {unreadCount > 0 && <span className="badge-dot">{unreadCount}</span>}
      </div>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="dropdown-header">
            <h4>Notifications</h4>
            {unreadCount > 0 && (
              <button className="mark-all-btn" onClick={markAllAsRead}>
                Mark all as read
              </button>
            )}
          </div>
          <div className="dropdown-body">
            {notifications.length === 0 ? (
              <div className="no-notifications">No notifications yet.</div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`notification-item ${!notif.is_read ? "unread" : "read"}`}
                  onClick={() => handleClickNotification(notif)}
                >
                  <div className="notif-title">{notif.title}</div>
                  <div className="notif-message">{notif.message}</div>
                  <div className="notif-time">
                    {new Date(notif.created_at).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </li>
  );
};

export default NotificationBell;

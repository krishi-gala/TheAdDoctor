import { useState, useEffect, useRef } from "react";
import { Bell, Check, CheckCircle2 } from "lucide-react";
import API from "../../services/api";
import "./NotificationBell.css";

export default function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const fetchUnreadCount = async () => {
    try {
      const res = await API.get("/audit/notifications/unread-count");
      setUnreadCount(res.data.unread_count);
    } catch (err) {
      console.error("Failed to fetch unread count:", err);
    }
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await API.get("/audit/notifications");
      setNotifications(res.data);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 60000); // Poll every minute
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      fetchNotifications();
    }
  };

  const markAsRead = async (e, auditId) => {
    e.stopPropagation();
    try {
      await API.patch(`/audit/notifications/${auditId}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.audit_id === auditId ? { ...n, notification_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await API.patch("/audit/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, notification_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const getSeverityClass = (severity) => {
    switch (severity) {
      case "success": return "success";
      case "warning": return "warning";
      case "error": return "error";
      default: return "info";
    }
  };

  return (
    <div className="notif-bell-container" ref={dropdownRef}>
      <div className="notif-bell-icon" onClick={toggleDropdown}>
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="notif-badge">{unreadCount > 99 ? "99+" : unreadCount}</span>
        )}
      </div>

      {isOpen && (
        <div className="notif-dropdown">
          <div className="notif-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button className="mark-all-read-btn" onClick={markAllAsRead}>
                Mark all read
              </button>
            )}
          </div>
          
          <div className="notif-list">
            {loading ? (
              <div className="notif-empty">Loading notifications...</div>
            ) : notifications.length === 0 ? (
              <div className="notif-empty">No notifications yet.</div>
            ) : (
              notifications.map((notif) => (
                <div 
                  key={notif.audit_id} 
                  className={`notif-item ${notif.notification_read ? 'read' : 'unread'}`}
                >
                  <div className={`notif-indicator ${getSeverityClass(notif.severity)}`}></div>
                  <div className="notif-content">
                    <div className="notif-desc">{notif.description}</div>
                    <div className="notif-meta">
                      <span className="notif-time">{new Date(notif.created_at).toLocaleString()}</span>
                      {notif.target_type && (
                        <span className="notif-type">{notif.target_type.toUpperCase()}</span>
                      )}
                    </div>
                  </div>
                  {!notif.notification_read && (
                    <button 
                      className="notif-mark-read" 
                      onClick={(e) => markAsRead(e, notif.audit_id)}
                      title="Mark as read"
                    >
                      <Check size={14} />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

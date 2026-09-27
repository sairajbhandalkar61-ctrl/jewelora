import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, AlertTriangle, AlertCircle, ShoppingBag, Info, Check } from "lucide-react";
import { api } from "../../api";
import { formatINR } from "../../utils/currency";

export default function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const panelRef = useRef(null);
  const navigate = useNavigate();

  // Load real database signals to generate smart notifications
  const loadNotifications = async () => {
    try {
      const dash = await api.get("/dashboard").catch(() => ({}));
      const items = [];

      // 1. Out of stock items
      if (dash.outOfStockCount > 0) {
        items.push({
          id: "out-stock",
          type: "danger",
          icon: AlertCircle,
          title: "Critical: Items Out of Stock",
          desc: `${dash.outOfStockCount} item(s) are at 0 quantity in the vault.`,
          time: "Just now",
          route: "/jewellery?status=out_of_stock",
          unread: true
        });
      }

      // 2. Low stock items
      if (dash.lowStockCount > 0) {
        items.push({
          id: "low-stock",
          type: "warning",
          icon: AlertTriangle,
          title: "Inventory Alert: Low Stock",
          desc: `${dash.lowStockCount} item(s) are below safety stock level (<= 2 units).`,
          time: "Today",
          route: "/jewellery?status=low_stock",
          unread: true
        });
      }

      // 3. Recent large sales
      if (dash.sales > 0) {
        items.push({
          id: "sales-summary",
          type: "success",
          icon: ShoppingBag,
          title: "Sales Recorded",
          desc: `Total recorded sales currently stand at ${formatINR(dash.sales)}.`,
          time: "Showroom",
          route: "/sales",
          unread: false
        });
      }

      // 4. Showroom valuation note
      if (dash.retailValuation > 0) {
        items.push({
          id: "vault-val",
          type: "info",
          icon: Info,
          title: "Vault Valuation Update",
          desc: `Total active showroom assets valued at ${formatINR(dash.retailValuation)}.`,
          time: "Automated",
          route: "/reports",
          unread: false
        });
      }

      setNotifications(items);
      setUnreadCount(items.filter(n => n.unread).length);
    } catch (e) {
      console.error("Failed to load notifications:", e);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  // Close when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [open]);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    setUnreadCount(0);
  };

  const handleClickItem = (route) => {
    setOpen(false);
    navigate(route);
  };

  return (
    <div className="notification-center-wrap" ref={panelRef}>
      <button
        className="icon-btn notif-bell-btn"
        onClick={() => setOpen(!open)}
        aria-label="Notifications"
        title="Showroom Notifications"
      >
        <Bell size={19} />
        {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
      </button>

      {open && (
        <div className="notif-dropdown">
          <div className="notif-header">
            <div className="notif-head-title">
              <strong>Notifications & Alerts</strong>
              {unreadCount > 0 && <span className="notif-unread-tag">{unreadCount} unread</span>}
            </div>
            {unreadCount > 0 && (
              <button className="mark-read-btn" onClick={markAllRead}>
                <Check size={13} /> Mark all read
              </button>
            )}
          </div>

          <div className="notif-list">
            {notifications.length === 0 ? (
              <div className="notif-empty">No active notifications</div>
            ) : (
              notifications.map(n => {
                const IconComponent = n.icon;
                return (
                  <div
                    key={n.id}
                    className={`notif-item notif-${n.type} ${n.unread ? "unread" : ""}`}
                    onClick={() => handleClickItem(n.route)}
                  >
                    <div className="notif-icon-circle">
                      <IconComponent size={16} />
                    </div>
                    <div className="notif-content">
                      <div className="notif-item-title">{n.title}</div>
                      <div className="notif-item-desc">{n.desc}</div>
                      <span className="notif-item-time">{n.time}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="notif-footer">
            <button className="notif-view-all" onClick={() => { setOpen(false); navigate("/reports"); }}>
              View Business Reports & Insights ?
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

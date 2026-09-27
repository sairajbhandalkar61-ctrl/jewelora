import React, { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Gem,
  Users,
  Truck,
  ShoppingCart,
  Receipt,
  BarChart3,
  LogOut,
  Menu,
  X,
  Search,
  Moon,
  Sun,
  ChevronRight,
  ShieldCheck,
  User
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import GlobalSearch from "../components/common/GlobalSearch";
import NotificationCenter from "../components/common/NotificationCenter";

const links = [
  ["/", "Dashboard", LayoutDashboard],
  ["/jewellery", "Jewellery Vault", Gem],
  ["/customers", "Customers CRM", Users],
  ["/suppliers", "Suppliers", Truck],
  ["/purchases", "Procurement", ShoppingCart],
  ["/sales", "POS & Billing", Receipt],
  ["/reports", "Analytics & Reports", BarChart3]
];

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const { theme, toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const logout = () => {
    localStorage.removeItem("jewelora_auth");
    navigate("/login");
  };

  // Breadcrumbs title resolution
  const currentLink = links.find(([path]) => path === location.pathname) || ["/", "Dashboard", LayoutDashboard];
  const pageTitle = currentLink[1];

  return (
    <div className="app-shell">
      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div className="mobile-overlay" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar (Desktop & Mobile Drawer) */}
      <aside className={`sidebar ${collapsed ? "collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`}>
        <div className="brand-section">
          <div className="brand-logo" onClick={() => navigate("/")}>
            <Gem size={22} className="logo-gem" />
          </div>
          {!collapsed && (
            <div className="brand-titles">
              <span className="brand-name">JEWELORA</span>
              <span className="brand-sub">BUSINESS COMMAND CENTER</span>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="sidebar-nav">
          {links.map(([to, label, Icon]) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
              title={collapsed ? label : undefined}
            >
              <span className="nav-icon-wrap">
                <Icon size={19} />
              </span>
              {!collapsed && <span className="nav-label">{label}</span>}
              {!collapsed && <span className="nav-active-pill" />}
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          <div className="sidebar-profile-card">
            <div className="sidebar-avatar">A</div>
            {!collapsed && (
              <div className="sidebar-user-details">
                <strong className="user-name">Showroom Admin</strong>
                <span className="user-role">Master Privilege</span>
              </div>
            )}
            <button
              className="sidebar-logout-btn"
              onClick={logout}
              title="Logout from Jewelora"
              aria-label="Logout"
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <div className="main-viewport">
        {/* Sticky Header */}
        <header className="topbar">
          <div className="topbar-left">
            {/* Mobile Menu Toggle */}
            <button
              className="icon-btn mobile-toggle"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle navigation menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Desktop Sidebar Collapse Toggle */}
            <button
              className="icon-btn desktop-collapse-btn"
              onClick={() => setCollapsed(!collapsed)}
              title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              aria-label="Toggle sidebar collapse"
            >
              <Menu size={18} />
            </button>

            {/* Breadcrumb Navigation */}
            <div className="breadcrumbs">
              <span className="crumb root" onClick={() => navigate("/")}>Jewelora</span>
              <ChevronRight size={14} className="crumb-separator" />
              <span className="crumb active">{pageTitle}</span>
            </div>
          </div>

          <div className="topbar-right">
            {/* Global Search Bar Trigger */}
            <button
              className="global-search-trigger"
              onClick={() => setSearchOpen(true)}
              title="Global search across showroom (Ctrl+K)"
            >
              <Search size={16} />
              <span className="search-placeholder">Search vault, clients, invoices...</span>
              <kbd className="search-shortcut">Ctrl K</kbd>
            </button>

            {/* Notification Bell */}
            <NotificationCenter />

            {/* Theme Toggle (Light / Dark) */}
            <button
              className="icon-btn theme-toggle-btn"
              onClick={toggleTheme}
              title={`Switch to ${isDark ? "Light" : "Dark"} Mode`}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={18} className="text-gold" /> : <Moon size={18} />}
            </button>

            {/* Admin Profile Pill & Dropdown */}
            <div className="admin-menu-anchor">
              <div
                className="user-pill-btn"
                onClick={() => setProfileOpen(!profileOpen)}
              >
                <div className="avatar-chip">A</div>
                <span className="user-pill-name">Admin</span>
              </div>

              {profileOpen && (
                <div className="profile-dropdown-menu">
                  <div className="profile-dd-header">
                    <strong>Jewelora Admin</strong>
                    <span>admin@jewelora.com</span>
                  </div>
                  <div className="profile-dd-divider" />
                  <button
                    className="profile-dd-item"
                    onClick={() => { setProfileOpen(false); navigate("/reports"); }}
                  >
                    <BarChart3 size={15} /> Business Analytics
                  </button>
                  <button
                    className="profile-dd-item text-danger"
                    onClick={() => { setProfileOpen(false); logout(); }}
                  >
                    <LogOut size={15} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="content-container">
          <Outlet />
        </main>
      </div>

      {/* Global Search Modal */}
      <GlobalSearch isOpen={searchOpen} onClose={setSearchOpen} />
    </div>
  );
}
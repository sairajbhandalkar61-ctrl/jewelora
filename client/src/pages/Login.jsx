import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Gem, Eye, EyeOff, Lock, User, ArrowRight, ShieldCheck, Sparkles, Award } from "lucide-react";
import Button from "../components/common/Button";

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    setTimeout(() => {
      if (username === "admin" && password === "admin123") {
        localStorage.setItem("jewelora_auth", "1");
        navigate("/");
      } else {
        setError("Invalid credentials. Please enter admin / admin123");
        setLoading(false);
      }
    }, 400);
  };

  const handleQuickDemo = () => {
    setUsername("admin");
    setPassword("admin123");
    setError("");
  };

  return (
    <div className="luxury-login-page">
      {/* Left Column: Visual Luxury Jewellery Hero */}
      <div className="login-visual-hero">
        <div className="hero-overlay" />
        <div className="hero-content">
          <div className="hero-brand-emblem">
            <div className="emblem-circle">
              <Gem size={38} className="emblem-gem" />
            </div>
            <div className="emblem-text">
              <h1 className="emblem-name">JEWELORA</h1>
              <span className="emblem-sub">INTELLIGENT BUSINESS COMMAND CENTER</span>
            </div>
          </div>

          <div className="hero-quote-block">
            <span className="quote-eyebrow">SHOWROOM MANAGEMENT REDEFINED</span>
            <h2 className="quote-headline">
              Crafted for luxury houses, diamond merchants, and master artisans.
            </h2>
            <p className="quote-desc">
              Unify showroom inventory, bullion procurement, point-of-sale billing, and commercial GST compliance into one seamless command center.
            </p>
          </div>

          <div className="hero-features-list">
            <div className="hero-feature-item">
              <ShieldCheck size={20} className="feat-icon text-gold" />
              <div>
                <strong>Certified Hallmarking & Valuation</strong>
                <span>Real-time bullion price calculations with automated GST</span>
              </div>
            </div>
            <div className="hero-feature-item">
              <Sparkles size={20} className="feat-icon text-gold" />
              <div>
                <strong>Intelligent Inventory Guard</strong>
                <span>Smart reorder signals and high-value vault protection</span>
              </div>
            </div>
            <div className="hero-feature-item">
              <Award size={20} className="feat-icon text-gold" />
              <div>
                <strong>Commercial Tax Invoicing</strong>
                <span>Print-ready GST invoices with complete audit conformity</span>
              </div>
            </div>
          </div>

          <div className="hero-footer-note">
            © 2026 Jewelora Systems Inc. Enterprise Grade Jewellery SaaS.
          </div>
        </div>
      </div>

      {/* Right Column: Authentication Card */}
      <div className="login-form-pane">
        <div className="login-card-container">
          <div className="login-card-header">
            <div className="login-emblem-badge">
              <Gem size={26} />
            </div>
            <h2 className="login-title">Welcome back to Jewelora</h2>
            <p className="login-subtitle">
              Manage your jewellery business with confidence and precision.
            </p>
          </div>

          {error && (
            <div className="login-error-banner" role="alert">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label>Administrator Username</label>
              <div className="input-icon-wrap">
                <User size={17} className="input-icon" />
                <input
                  type="text"
                  placeholder="Enter username (admin)"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            </div>

            <div className="form-group">
              <label>Secure Password</label>
              <div className="input-icon-wrap">
                <Lock size={17} className="input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password (admin123)"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="show-pass-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="login-options-row">
              <label className="remember-me-checkbox">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                />
                <span>Remember this terminal</span>
              </label>
              <button
                type="button"
                className="quick-demo-link"
                onClick={handleQuickDemo}
              >
                Autofill Demo Login
              </button>
            </div>

            <Button
              type="submit"
              variant="gold"
              size="lg"
              fullWidth
              loading={loading}
              iconRight={ArrowRight}
            >
              Sign In to Command Center
            </Button>
          </form>

          {/* Quick Demo Credentials Footer Card */}
          <div className="demo-credentials-box">
            <div className="demo-pill-title">Academic & Evaluation Demo Credentials</div>
            <div className="demo-creds-details">
              <div>
                <span>Username:</span> <b>admin</b>
              </div>
              <div>
                <span>Password:</span> <b>admin123</b>
              </div>
            </div>
            <button
              type="button"
              className="demo-autofill-btn"
              onClick={handleQuickDemo}
            >
              Click here to fill credentials automatically
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
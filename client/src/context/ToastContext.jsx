import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback((type, title, message) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 4);
    const newToast = { id, type, title, message };
    setToasts(prev => [...prev, newToast]);

    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  const toast = {
    success: (title, message) => addToast("success", title, message),
    error: (title, message) => addToast("error", title, message),
    warning: (title, message) => addToast("warning", title, message),
    info: (title, message) => addToast("info", title, message),
  };

  const getIcon = (type) => {
    switch (type) {
      case "success": return <CheckCircle2 size={18} className="toast-icon success" />;
      case "error": return <AlertCircle size={18} className="toast-icon error" />;
      case "warning": return <AlertTriangle size={18} className="toast-icon warning" />;
      default: return <Info size={18} className="toast-icon info" />;
    }
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toast-container" role="region" aria-live="polite">
        {toasts.map(t => (
          <div key={t.id} className={`toast-card toast-${t.type}`}>
            <div className="toast-lead">
              {getIcon(t.type)}
              <div className="toast-text">
                <strong className="toast-title">{t.title}</strong>
                {t.message && <p className="toast-desc">{t.message}</p>}
              </div>
            </div>
            <button className="toast-close-btn" onClick={() => removeToast(t.id)} aria-label="Close notification">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);

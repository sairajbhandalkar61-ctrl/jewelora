import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Gem, Users, Truck, Receipt, ArrowRight, X } from "lucide-react";
import { api } from "../../api";
import { formatINR } from "../../utils/currency";

export default function GlobalSearch({ isOpen, onClose }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({ jewellery: [], customers: [], suppliers: [], sales: [] });
  const [loading, setLoading] = useState(false);
  const [allData, setAllData] = useState({ jewellery: [], customers: [], suppliers: [], sales: [] });
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Load datasets when modal opens
  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      Promise.all([
        api.get("/jewellery").catch(() => []),
        api.get("/customers").catch(() => []),
        api.get("/suppliers").catch(() => []),
        api.get("/sales").catch(() => [])
      ]).then(([j, c, s, sa]) => {
        setAllData({ jewellery: j, customers: c, suppliers: s, sales: sa });
        setLoading(false);
      });
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  // Keyboard shortcut Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onClose ? onClose(!isOpen) : null;
      }
      if (e.key === "Escape" && isOpen) {
        onClose(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Filter across all four collections
  useEffect(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      setResults({ jewellery: [], customers: [], suppliers: [], sales: [] });
      return;
    }

    const j = (allData.jewellery || []).filter(item =>
      (item.name || "").toLowerCase().includes(q) ||
      (item.sku || "").toLowerCase().includes(q) ||
      (item.category || "").toLowerCase().includes(q) ||
      (item.material || "").toLowerCase().includes(q)
    ).slice(0, 4);

    const c = (allData.customers || []).filter(item =>
      (item.name || "").toLowerCase().includes(q) ||
      (item.phone || "").toLowerCase().includes(q) ||
      (item.email || "").toLowerCase().includes(q)
    ).slice(0, 3);

    const s = (allData.suppliers || []).filter(item =>
      (item.name || "").toLowerCase().includes(q) ||
      (item.phone || "").toLowerCase().includes(q) ||
      (item.email || "").toLowerCase().includes(q)
    ).slice(0, 3);

    const sa = (allData.sales || []).filter(item =>
      (item.invoice_no || "").toLowerCase().includes(q) ||
      (item.customer_name || "").toLowerCase().includes(q) ||
      (item.jewellery_name || "").toLowerCase().includes(q)
    ).slice(0, 3);

    setResults({ jewellery: j, customers: c, suppliers: s, sales: sa });
  }, [query, allData]);

  if (!isOpen) return null;

  const totalResults = results.jewellery.length + results.customers.length + results.suppliers.length + results.sales.length;

  const handleSelect = (route) => {
    navigate(route);
    onClose(false);
  };

  return (
    <div className="global-search-backdrop" onClick={() => onClose(false)}>
      <div className="global-search-modal" onClick={e => e.stopPropagation()}>
        <div className="search-bar-header">
          <Search size={20} className="search-icon-gold" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search jewellery, customers, suppliers, invoices... (Press ESC to close)"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="search-modal-input"
          />
          {query && (
            <button className="clear-search-btn" onClick={() => setQuery("")}>
              <X size={16} />
            </button>
          )}
          <span className="search-kbd-badge">ESC</span>
        </div>

        <div className="search-results-area">
          {loading && <div className="search-status">Loading showroom catalog...</div>}

          {!loading && query && totalResults === 0 && (
            <div className="search-status empty">
              No matching records found for "{query}".
            </div>
          )}

          {!loading && !query && (
            <div className="search-hint">
              <span>Quick navigation: Type <b>Ring</b>, <b>Necklace</b>, a customer name, or an invoice #.</span>
            </div>
          )}

          {/* Jewellery Results */}
          {results.jewellery.length > 0 && (
            <div className="result-group">
              <div className="result-group-title">
                <Gem size={14} /> Jewellery Items
              </div>
              {results.jewellery.map(item => (
                <div
                  key={item.id}
                  className="search-result-item"
                  onClick={() => handleSelect(`/jewellery?id=${item.id}`)}
                >
                  <div className="result-thumb">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} />
                    ) : (
                      <Gem size={16} />
                    )}
                  </div>
                  <div className="result-info">
                    <strong className="result-name">{item.name}</strong>
                    <span className="result-sub">
                      {item.sku} • {item.purity} {item.material} • Stock: {item.quantity}
                    </span>
                  </div>
                  <div className="result-price">
                    {formatINR(item.selling_price)}
                    <ArrowRight size={14} className="result-arrow" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Customer Results */}
          {results.customers.length > 0 && (
            <div className="result-group">
              <div className="result-group-title">
                <Users size={14} /> Customers
              </div>
              {results.customers.map(c => (
                <div
                  key={c.id}
                  className="search-result-item"
                  onClick={() => handleSelect("/customers")}
                >
                  <div className="result-avatar">{c.name.charAt(0)}</div>
                  <div className="result-info">
                    <strong className="result-name">{c.name}</strong>
                    <span className="result-sub">{c.phone} • {c.email || c.address || "No email"}</span>
                  </div>
                  <ArrowRight size={14} className="result-arrow" />
                </div>
              ))}
            </div>
          )}

          {/* Supplier Results */}
          {results.suppliers.length > 0 && (
            <div className="result-group">
              <div className="result-group-title">
                <Truck size={14} /> Suppliers
              </div>
              {results.suppliers.map(s => (
                <div
                  key={s.id}
                  className="search-result-item"
                  onClick={() => handleSelect("/suppliers")}
                >
                  <div className="result-avatar supplier">{s.name.charAt(0)}</div>
                  <div className="result-info">
                    <strong className="result-name">{s.name}</strong>
                    <span className="result-sub">{s.phone} • {s.address || "Vendor"}</span>
                  </div>
                  <ArrowRight size={14} className="result-arrow" />
                </div>
              ))}
            </div>
          )}

          {/* Sales / Invoice Results */}
          {results.sales.length > 0 && (
            <div className="result-group">
              <div className="result-group-title">
                <Receipt size={14} /> Invoices & Sales
              </div>
              {results.sales.map(s => (
                <div
                  key={s.id}
                  className="search-result-item"
                  onClick={() => handleSelect("/sales")}
                >
                  <div className="result-avatar sale"><Receipt size={14} /></div>
                  <div className="result-info">
                    <strong className="result-name">{s.invoice_no || `Sale #${s.id}`}</strong>
                    <span className="result-sub">Customer: {s.customer_name || "Walk-in"} • {s.jewellery_name}</span>
                  </div>
                  <div className="result-price">
                    {formatINR(s.total_amount)}
                    <ArrowRight size={14} className="result-arrow" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

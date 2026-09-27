import React from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, AlertCircle, Sparkles, ChevronRight, Gem, ArrowUpRight } from "lucide-react";
import { formatINR } from "../../utils/currency";

export default function InventoryAlerts({
  lowStockItems = [],
  outOfStockCount = 0,
  retailValuation = 0,
  smartAlerts = []
}) {
  const navigate = useNavigate();

  return (
    <div className="panel inventory-alerts-panel">
      <div className="panel-title-row">
        <div>
          <span className="panel-lead-tag alert-tag">
            <Sparkles size={13} /> Intelligent System
          </span>
          <h3 className="panel-main-title">Inventory Alerts & Insights</h3>
        </div>
        <button
          className="panel-link-btn"
          onClick={() => navigate("/jewellery")}
        >
          Manage All <ChevronRight size={15} />
        </button>
      </div>

      <div className="alerts-stack">
        {/* Out of stock highlight */}
        {outOfStockCount > 0 && (
          <div
            className="smart-alert-card alert-danger clickable"
            onClick={() => navigate("/jewellery?status=out_of_stock")}
          >
            <div className="alert-icon-wrap">
              <AlertCircle size={18} />
            </div>
            <div className="alert-info">
              <strong className="alert-headline">{outOfStockCount} Product(s) Completely Out of Stock</strong>
              <p className="alert-body">Customer demand cannot be fulfilled until restocked.</p>
            </div>
            <ArrowUpRight size={16} className="alert-arrow" />
          </div>
        )}

        {/* Low Stock Items List */}
        {lowStockItems.length > 0 ? (
          lowStockItems.slice(0, 3).map(item => (
            <div
              key={item.id}
              className="smart-alert-card alert-warning clickable"
              onClick={() => navigate(`/jewellery?id=${item.id}`)}
            >
              <div className="alert-thumb">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.name} />
                ) : (
                  <Gem size={16} />
                )}
              </div>
              <div className="alert-info">
                <div className="alert-item-header">
                  <strong className="alert-headline">{item.name}</strong>
                  <span className="stock-pill warning">{item.quantity} left</span>
                </div>
                <p className="alert-body">
                  {item.purity} {item.category} • Value: {formatINR(item.selling_price)}
                </p>
              </div>
              <ArrowUpRight size={16} className="alert-arrow" />
            </div>
          ))
        ) : (
          <div className="alert-all-good">
            <Sparkles size={20} className="text-gold" />
            <div>
              <strong>All safety stocks healthy</strong>
              <p>No critical stock depletion detected in the showroom.</p>
            </div>
          </div>
        )}

        {/* Showroom Valuation Card */}
        {retailValuation > 0 && (
          <div
            className="smart-alert-card alert-gold clickable"
            onClick={() => navigate("/reports")}
          >
            <div className="alert-icon-wrap gold-icon">
              <Gem size={18} />
            </div>
            <div className="alert-info">
              <strong className="alert-headline">Active Vault Value: {formatINR(retailValuation)}</strong>
              <p className="alert-body">Total asset retail value across showroom collection.</p>
            </div>
            <ArrowUpRight size={16} className="alert-arrow" />
          </div>
        )}
      </div>
    </div>
  );
}

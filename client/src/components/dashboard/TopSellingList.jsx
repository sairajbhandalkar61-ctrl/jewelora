import React from "react";
import { useNavigate } from "react-router-dom";
import { Award, Gem, ChevronRight } from "lucide-react";
import { formatINR } from "../../utils/currency";

export default function TopSellingList({ topSelling = [] }) {
  const navigate = useNavigate();

  return (
    <div className="panel top-selling-panel">
      <div className="panel-title-row">
        <div>
          <span className="panel-lead-tag">
            <Award size={13} /> Best Performers
          </span>
          <h3 className="panel-main-title">Top Selling Jewellery</h3>
        </div>
        <button className="panel-link-btn" onClick={() => navigate("/sales")}>
          View Sales <ChevronRight size={15} />
        </button>
      </div>

      <div className="top-selling-list">
        {topSelling.length === 0 ? (
          <div className="empty-mini">
            <Gem size={28} className="text-muted" />
            <p>No sales records logged yet.</p>
          </div>
        ) : (
          topSelling.map((item, index) => {
            const rank = index + 1;
            return (
              <div
                key={item.id}
                className="top-product-row clickable"
                onClick={() => navigate(`/jewellery?id=${item.id}`)}
              >
                <div className={`rank-badge rank-${rank <= 3 ? rank : "other"}`}>
                  #{rank}
                </div>

                <div className="product-media">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} />
                  ) : (
                    <Gem size={18} />
                  )}
                </div>

                <div className="product-details">
                  <strong className="product-title">{item.name}</strong>
                  <span className="product-meta">
                    {item.purity} • {item.category} • SKU: {item.sku || `JWL-${item.id}`}
                  </span>
                </div>

                <div className="product-sales-stats">
                  <span className="sold-count">
                    <strong>{item.units_sold}</strong> sold
                  </span>
                  <strong className="sold-revenue">{formatINR(item.total_revenue)}</strong>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

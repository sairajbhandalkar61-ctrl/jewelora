import React from "react";
import Badge from "../common/Badge";
import { Gem, Eye, Edit3, Trash2, Scale, ShoppingCart } from "lucide-react";
import { formatINR } from "../../utils/currency";

export default function JewelleryCard({
  item,
  onView,
  onEdit,
  onDelete,
  onQuickSell
}) {
  const isOutOfStock = item.quantity === 0;
  const isLowStock = item.quantity > 0 && item.quantity <= 2;

  return (
    <div className={`luxury-jewellery-card ${isOutOfStock ? "out-of-stock" : ""}`}>
      {/* Product Image & Badges */}
      <div className="card-media-wrap">
        {item.image_url ? (
          <img src={item.image_url} alt={item.name} className="card-product-img" />
        ) : (
          <div className="card-img-placeholder">
            <Gem size={42} className="placeholder-icon" />
          </div>
        )}

        <div className="card-top-badges">
          <Badge variant="gold" size="sm">
            {item.purity || "22K"}
          </Badge>
          <Badge variant="neutral" size="sm">
            {item.category || "Jewellery"}
          </Badge>
        </div>

        {/* Hover Action Overlay */}
        <div className="card-hover-actions">
          <button
            className="card-action-btn view"
            title="View Details & Specs"
            onClick={() => onView(item)}
          >
            <Eye size={16} />
          </button>
          <button
            className="card-action-btn edit"
            title="Edit Jewellery"
            onClick={() => onEdit(item)}
          >
            <Edit3 size={16} />
          </button>
          {onQuickSell && !isOutOfStock && (
            <button
              className="card-action-btn sell"
              title="Sell in POS"
              onClick={() => onQuickSell(item)}
            >
              <ShoppingCart size={16} />
            </button>
          )}
          <button
            className="card-action-btn delete"
            title="Delete Item"
            onClick={() => onDelete(item)}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Product Information */}
      <div className="card-body-content">
        <div className="card-sku-row">
          <span className="card-sku">{item.sku || `JWL-${item.id}`}</span>
          <span className="card-weight">
            <Scale size={12} /> {Number(item.weight || 0).toFixed(2)} g
          </span>
        </div>

        <h4 className="card-product-title" title={item.name} onClick={() => onView(item)}>
          {item.name}
        </h4>

        <div className="card-pricing-row">
          <div>
            <span className="price-label">Retail Price</span>
            <div className="card-retail-price">{formatINR(item.selling_price)}</div>
          </div>

          <div className="card-stock-indicator">
            {isOutOfStock ? (
              <Badge variant="danger" size="sm" dot>
                Out of Stock
              </Badge>
            ) : isLowStock ? (
              <Badge variant="warning" size="sm" dot>
                {item.quantity} left
              </Badge>
            ) : (
              <Badge variant="success" size="sm" dot>
                {item.quantity} in stock
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

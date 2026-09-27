import React, { useState } from "react";
import { Search, Gem, Plus, Check } from "lucide-react";
import { formatINR } from "../../utils/currency";

export default function ProductCatalog({
  items = [],
  onAddToCart,
  cartItems = []
}) {
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("All");

  const categories = ["All", "Ring", "Necklace", "Earrings", "Bangles", "Chain", "Pendant", "Bracelet"];

  const filtered = items.filter(item => {
    const matchCat = selectedCat === "All" || item.category === selectedCat;
    const matchQuery =
      (item.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (item.sku || "").toLowerCase().includes(search.toLowerCase()) ||
      (item.material || "").toLowerCase().includes(search.toLowerCase());
    return matchCat && matchQuery;
  });

  return (
    <div className="pos-catalog-panel">
      {/* Search & Categories Bar */}
      <div className="pos-catalog-header">
        <div className="pos-search-wrap">
          <Search size={18} className="pos-search-icon" />
          <input
            type="text"
            placeholder="Search jewellery by name, SKU, or metal..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pos-search-input"
          />
        </div>

        <div className="pos-category-chips">
          {categories.map(cat => (
            <button
              key={cat}
              className={`pos-cat-chip ${selectedCat === cat ? "active" : ""}`}
              onClick={() => setSelectedCat(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of POS Product Cards */}
      <div className="pos-grid">
        {filtered.length === 0 ? (
          <div className="pos-empty-catalog">
            <Gem size={36} className="text-muted" />
            <p>No jewellery matches the selected filter.</p>
          </div>
        ) : (
          filtered.map(item => {
            const inCart = cartItems.find(c => c.jewellery_id === item.id);
            const isOutOfStock = item.quantity === 0;
            const cartQty = inCart ? inCart.quantity : 0;
            const remaining = item.quantity - cartQty;

            return (
              <div
                key={item.id}
                className={`pos-product-card ${isOutOfStock || remaining <= 0 ? "disabled" : ""} ${inCart ? "in-cart" : ""}`}
                onClick={() => {
                  if (remaining > 0) onAddToCart(item);
                }}
              >
                <div className="pos-card-thumb">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} />
                  ) : (
                    <Gem size={28} className="text-muted" />
                  )}
                  <div className="pos-thumb-purity">{item.purity || "22K"}</div>
                  {inCart && (
                    <div className="pos-in-cart-badge">
                      <Check size={12} /> {inCart.quantity} in bill
                    </div>
                  )}
                </div>

                <div className="pos-card-info">
                  <div className="pos-card-sku">{item.sku || `JWL-${item.id}`}</div>
                  <strong className="pos-card-title" title={item.name}>
                    {item.name}
                  </strong>
                  <div className="pos-card-sub">
                    <span>{Number(item.weight || 0).toFixed(2)}g</span>
                    <span className={`stock-text ${remaining <= 2 ? "low" : ""}`}>
                      {remaining > 0 ? `${remaining} in stock` : "Out of stock"}
                    </span>
                  </div>

                  <div className="pos-card-bottom-row">
                    <span className="pos-card-price">{formatINR(item.selling_price)}</span>
                    <button
                      className="pos-add-btn"
                      disabled={remaining <= 0}
                      title="Add to Bill"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
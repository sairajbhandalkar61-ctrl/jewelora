import React, { useEffect, useState } from "react";
import Modal from "../common/Modal";
import Button from "../common/Button";
import Badge from "../common/Badge";
import { Gem, Edit3, ShoppingCart, ArrowDownLeft, Printer, Scale, ShieldCheck } from "lucide-react";
import { formatINR } from "../../utils/currency";
import { calculatePriceBreakdown } from "../../utils/calculations";
import { api } from "../../api";

export default function JewelleryDetailModal({
  isOpen,
  onClose,
  itemId,
  onEdit,
  onSell,
  onRestock
}) {
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && itemId) {
      setLoading(true);
      api.get(`/jewellery/${itemId}`)
        .then(data => {
          setItem(data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    } else {
      setItem(null);
    }
  }, [isOpen, itemId]);

  if (!isOpen) return null;

  const breakdown = item ? calculatePriceBreakdown({
    weight: item.weight,
    purity: item.purity,
    makingCharges: item.making_charges,
    stoneCharges: item.stone_charges
  }) : {};

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={item ? item.name : "Jewellery Specifications"}
      subtitle={item ? `${item.sku || `JWL-${item.id}`} • Certified Luxury Collection` : "Loading..."}
      maxWidth="820px"
    >
      {loading || !item ? (
        <div className="detail-loading-box">
          <Gem size={32} className="spin-slow text-gold" />
          <p>Fetching certified piece specifications...</p>
        </div>
      ) : (
        <div className="jewellery-detail-content">
          <div className="detail-top-split">
            {/* Left: Product Showcase Media */}
            <div className="detail-media-card">
              {item.image_url ? (
                <img src={item.image_url} alt={item.name} className="detail-hero-img" />
              ) : (
                <div className="detail-img-placeholder">
                  <Gem size={64} className="text-muted" />
                </div>
              )}
              <div className="hallmark-badge">
                <ShieldCheck size={16} />
                <span>100% Certified Hallmark Standard</span>
              </div>
            </div>

            {/* Right: Technical Specifications */}
            <div className="detail-specs-card">
              <div className="detail-badges-row">
                <Badge variant="gold" size="md">
                  {item.purity || "22K"} Purity
                </Badge>
                <Badge variant="neutral" size="md">
                  {item.category || "Jewellery"}
                </Badge>
                <Badge
                  variant={item.quantity === 0 ? "danger" : item.quantity <= 2 ? "warning" : "success"}
                  size="md"
                  dot
                >
                  {item.quantity === 0 ? "Out of Stock" : `${item.quantity} In Stock`}
                </Badge>
              </div>

              <h2 className="detail-product-name">{item.name}</h2>
              {item.description && (
                <p className="detail-product-desc">{item.description}</p>
              )}

              <div className="spec-attributes-grid">
                <div className="spec-item">
                  <span className="spec-label">Material</span>
                  <strong className="spec-val">{item.material || "Gold"}</strong>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Net Weight</span>
                  <strong className="spec-val">
                    <Scale size={13} /> {Number(item.weight || 0).toFixed(2)} g
                  </strong>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Cost / Purchase Price</span>
                  <strong className="spec-val text-muted">{formatINR(item.purchase_price)}</strong>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Showroom Retail Price</span>
                  <strong className="spec-val text-gold font-lg">{formatINR(item.selling_price)}</strong>
                </div>
              </div>

              {/* Pricing Breakdown Card */}
              <div className="detail-breakdown-card">
                <h5 className="breakdown-title">Commercial Valuation Breakdown</h5>
                <div className="breakdown-lines">
                  <div className="b-line">
                    <span>Base Metal Value ({Number(item.weight || 0)}g @ {item.purity}):</span>
                    <strong>{formatINR(breakdown.baseGoldValue)}</strong>
                  </div>
                  <div className="b-line">
                    <span>Making / Craftsmanship:</span>
                    <strong>{formatINR(item.making_charges || 0)}</strong>
                  </div>
                  <div className="b-line">
                    <span>Stone & Embellishment:</span>
                    <strong>{formatINR(item.stone_charges || 0)}</strong>
                  </div>
                  <div className="b-line">
                    <span>Tax (3% GST):</span>
                    <strong>{formatINR(breakdown.gst)}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Transaction Activity Feed */}
          <div className="detail-history-section">
            <h4 className="section-title">Vault Movement & Transaction Log</h4>
            <div className="history-columns">
              {/* Sales History */}
              <div className="history-sub-col">
                <h5>Recent Sales</h5>
                {item.recent_sales && item.recent_sales.length > 0 ? (
                  <ul className="history-mini-list">
                    {item.recent_sales.map(s => (
                      <li key={s.id}>
                        <span className="h-date">{new Date(s.sale_date).toLocaleDateString("en-IN")}</span>
                        <span className="h-party">{s.customer_name || "Guest"}</span>
                        <strong className="h-amount">{formatINR(s.total_amount)}</strong>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="no-history-text">No recorded sales yet</p>
                )}
              </div>

              {/* Purchases History */}
              <div className="history-sub-col">
                <h5>Recent Restocks</h5>
                {item.recent_purchases && item.recent_purchases.length > 0 ? (
                  <ul className="history-mini-list">
                    {item.recent_purchases.map(p => (
                      <li key={p.id}>
                        <span className="h-date">{new Date(p.purchase_date).toLocaleDateString("en-IN")}</span>
                        <span className="h-party">{p.supplier_name || "Vendor"}</span>
                        <strong className="h-amount">{formatINR(p.total_amount)}</strong>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="no-history-text">Initial showroom stock</p>
                )}
              </div>
            </div>
          </div>

          {/* Modal Action Controls */}
          <div className="detail-modal-actions">
            <Button variant="secondary" icon={Printer} onClick={handlePrint}>
              Print Spec Sheet
            </Button>
            {onEdit && (
              <Button variant="secondary" icon={Edit3} onClick={() => { onClose(); onEdit(item); }}>
                Edit Details
              </Button>
            )}
            {onRestock && (
              <Button variant="secondary" icon={ArrowDownLeft} onClick={() => { onClose(); onRestock(item); }}>
                Restock Item
              </Button>
            )}
            {onSell && item.quantity > 0 && (
              <Button variant="gold" icon={ShoppingCart} onClick={() => { onClose(); onSell(item); }}>
                Sell in POS Billing
              </Button>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
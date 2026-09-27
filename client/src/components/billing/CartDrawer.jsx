import React, { useState } from "react";
import Button from "../common/Button";
import { Plus, Minus, Trash2, UserPlus, CreditCard, Banknote, QrCode, Building, Receipt, Sparkles } from "lucide-react";
import { formatINR } from "../../utils/currency";

export default function CartDrawer({
  cartItems = [],
  customers = [],
  selectedCustomer,
  onSelectCustomer,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCheckout,
  loading = false,
  onQuickAddCustomer
}) {
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [discount, setDiscount] = useState("0");
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [newCust, setNewCust] = useState({ name: "", phone: "" });

  // Calculations
  const subtotal = cartItems.reduce((sum, item) => sum + (Number(item.selling_price || 0) * item.quantity), 0);
  const totalMaking = cartItems.reduce((sum, item) => sum + (Number(item.making_charges || 0) * item.quantity), 0);
  const discountVal = Math.min(Math.max(Number(discount) || 0, 0), subtotal);
  const taxableAmount = Math.max(subtotal - discountVal, 0);
  const gstAmount = Math.round(taxableAmount * 0.03); // 3% jewellery GST
  const grandTotal = taxableAmount + gstAmount;

  const handleCheckout = (isDraft = false) => {
    if (cartItems.length === 0) return alert("Please select jewellery pieces to generate a bill.");
    onCheckout({
      items: cartItems.map(c => ({
        jewellery_id: c.id,
        quantity: c.quantity,
        selling_price: c.selling_price,
        line_total: c.selling_price * c.quantity
      })),
      customer_id: selectedCustomer ? selectedCustomer.id : null,
      payment_method: paymentMethod,
      discount: discountVal,
      tax_amount: gstAmount,
      total_amount: grandTotal,
      subtotal,
      isDraft
    });
  };

  const handleSaveQuickCustomer = async (e) => {
    e.preventDefault();
    if (!newCust.name.trim()) return;
    if (onQuickAddCustomer) {
      await onQuickAddCustomer(newCust);
      setNewCust({ name: "", phone: "" });
      setShowAddCustomer(false);
    }
  };

  const paymentOptions = [
    { id: "UPI", label: "UPI / QR", icon: QrCode },
    { id: "Cash", label: "Cash", icon: Banknote },
    { id: "Card", label: "Card POS", icon: CreditCard },
    { id: "Net Banking", label: "Bank Transfer", icon: Building }
  ];

  return (
    <div className="pos-cart-panel">
      {/* Customer Header Bar */}
      <div className="cart-header-box">
        <div className="cart-header-title">
          <Receipt size={18} className="text-gold" />
          <h4>Active Invoice</h4>
          <span className="cart-count-pill">{cartItems.length} items</span>
        </div>

        {/* Customer Selector */}
        <div className="cart-customer-section">
          {!showAddCustomer ? (
            <div className="cust-select-row">
              <select
                className="cart-customer-select"
                value={selectedCustomer ? selectedCustomer.id : ""}
                onChange={(e) => {
                  const id = e.target.value;
                  const c = customers.find(x => String(x.id) === String(id));
                  onSelectCustomer(c || null);
                }}
              >
                <option value="">Walk-in Customer (Guest)</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.phone || "No phone"})
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="quick-add-cust-btn"
                title="Add New Customer"
                onClick={() => setShowAddCustomer(true)}
              >
                <UserPlus size={15} />
              </button>
            </div>
          ) : (
            <form onSubmit={handleSaveQuickCustomer} className="quick-add-cust-form">
              <input
                type="text"
                placeholder="Customer Name *"
                value={newCust.name}
                onChange={e => setNewCust({ ...newCust, name: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Phone Number"
                value={newCust.phone}
                onChange={e => setNewCust({ ...newCust, phone: e.target.value })}
              />
              <div className="quick-cust-actions">
                <Button size="sm" variant="gold" type="submit">Save</Button>
                <Button size="sm" variant="ghost" onClick={() => setShowAddCustomer(false)}>Cancel</Button>
              </div>
            </form>
          )}

          {selectedCustomer && (
            <div className="selected-cust-pill">
              <span>Billed to: <b>{selectedCustomer.name}</b> • {selectedCustomer.phone}</span>
            </div>
          )}
        </div>
      </div>

      {/* Cart Items List */}
      <div className="cart-items-scroll">
        {cartItems.length === 0 ? (
          <div className="cart-empty-state">
            <Sparkles size={36} className="text-muted" />
            <p>Your active bill is empty.</p>
            <span>Click any jewellery piece from the catalogue to add it to the bill.</span>
          </div>
        ) : (
          cartItems.map(item => {
            const lineTotal = Number(item.selling_price || 0) * item.quantity;
            return (
              <div key={item.id} className="cart-item-row">
                <div className="cart-item-thumb">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} />
                  ) : (
                    <Receipt size={16} />
                  )}
                </div>

                <div className="cart-item-info">
                  <strong className="cart-item-name">{item.name}</strong>
                  <span className="cart-item-meta">
                    {item.purity} • {Number(item.weight || 0)}g • @{formatINR(item.selling_price)}
                  </span>
                </div>

                {/* Quantity Stepper */}
                <div className="cart-qty-stepper">
                  <button
                    className="stepper-btn"
                    onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    <Minus size={13} />
                  </button>
                  <span className="stepper-qty">{item.quantity}</span>
                  <button
                    className="stepper-btn"
                    onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                    disabled={item.quantity >= item.stock}
                  >
                    <Plus size={13} />
                  </button>
                </div>

                <div className="cart-line-total">
                  {formatINR(lineTotal)}
                </div>

                <button
                  className="cart-remove-btn"
                  title="Remove piece"
                  onClick={() => onRemoveItem(item.id)}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Financial Breakdown & Checkout */}
      {cartItems.length > 0 && (
        <div className="cart-checkout-footer">
          <div className="financial-breakdown">
            <div className="fin-row">
              <span>Items Subtotal:</span>
              <span>{formatINR(subtotal)}</span>
            </div>

            <div className="fin-row discount-row">
              <span>Showroom Discount (₹):</span>
              <input
                type="number"
                min="0"
                max={subtotal}
                value={discount}
                onChange={e => setDiscount(e.target.value)}
                className="cart-discount-input"
              />
            </div>

            <div className="fin-row">
              <span>Jewellery GST (3% - 1.5% CGST + 1.5% SGST):</span>
              <span>{formatINR(gstAmount)}</span>
            </div>

            <div className="fin-row grand-total-row">
              <span className="grand-label">Grand Total:</span>
              <strong className="grand-val text-gold">{formatINR(grandTotal)}</strong>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="payment-method-selector">
            <span className="pm-label">Payment Mode:</span>
            <div className="pm-grid">
              {paymentOptions.map(pm => {
                const IconComponent = pm.icon;
                return (
                  <button
                    key={pm.id}
                    type="button"
                    className={`pm-btn ${paymentMethod === pm.id ? "active" : ""}`}
                    onClick={() => setPaymentMethod(pm.id)}
                  >
                    <IconComponent size={14} />
                    <span>{pm.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Checkout Action Buttons */}
          <div className="cart-action-buttons">
            <Button
              variant="secondary"
              size="sm"
              onClick={onClearCart}
              disabled={loading}
            >
              Clear
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCheckout(true)}
              disabled={loading}
            >
              Save Draft
            </Button>
            <Button
              variant="gold"
              fullWidth
              loading={loading}
              onClick={() => handleCheckout(false)}
            >
              Complete Sale & Print Invoice ({formatINR(grandTotal)})
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
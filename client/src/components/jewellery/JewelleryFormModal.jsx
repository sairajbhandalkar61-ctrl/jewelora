import React, { useState, useEffect } from "react";
import Modal from "../common/Modal";
import Button from "../common/Button";
import { Calculator, Sparkles, Image, Check, RefreshCw } from "lucide-react";
import { calculatePriceBreakdown, DEFAULT_RATES } from "../../utils/calculations";
import { formatINR } from "../../utils/currency";

const IMAGE_PRESETS = [
  { label: "Diamond Ring", url: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80" },
  { label: "Polki Necklace", url: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80" },
  { label: "Emerald Earrings", url: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80" },
  { label: "Gold Chain", url: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=800&q=80" },
  { label: "Gold Kada / Bangles", url: "https://images.unsplash.com/photo-1611591475155-42e9fba5ce55?auto=format&fit=crop&w=800&q=80" },
  { label: "Floral Pendant", url: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80" }
];

export default function JewelleryFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  loading = false
}) {
  const [form, setForm] = useState({
    name: "",
    category: "Ring",
    material: "Gold",
    purity: "22K",
    weight: "",
    quantity: "1",
    purchase_price: "",
    selling_price: "",
    sku: "",
    description: "",
    image_url: IMAGE_PRESETS[0].url,
    making_charges: "3500",
    stone_charges: "0"
  });

  const [autoCalc, setAutoCalc] = useState(true);

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || "",
        category: initialData.category || "Ring",
        material: initialData.material || "Gold",
        purity: initialData.purity || "22K",
        weight: initialData.weight || "",
        quantity: initialData.quantity !== undefined ? String(initialData.quantity) : "1",
        purchase_price: initialData.purchase_price || "",
        selling_price: initialData.selling_price || "",
        sku: initialData.sku || "",
        description: initialData.description || "",
        image_url: initialData.image_url || IMAGE_PRESETS[0].url,
        making_charges: initialData.making_charges || "0",
        stone_charges: initialData.stone_charges || "0"
      });
      setAutoCalc(false);
    } else {
      setForm({
        name: "",
        category: "Ring",
        material: "Gold",
        purity: "22K",
        weight: "4.5",
        quantity: "5",
        purchase_price: "28000",
        selling_price: "32000",
        sku: `JWL-${Math.floor(1000 + Math.random() * 9000)}`,
        description: "",
        image_url: IMAGE_PRESETS[0].url,
        making_charges: "3500",
        stone_charges: "0"
      });
      setAutoCalc(true);
    }
  }, [initialData, isOpen]);

  // Live price breakdown calculation
  const breakdown = calculatePriceBreakdown({
    weight: form.weight,
    purity: form.purity,
    makingCharges: form.making_charges,
    stoneCharges: form.stone_charges
  });

  // Sync selling price automatically if autoCalc enabled
  useEffect(() => {
    if (autoCalc && breakdown.finalPrice > 0) {
      setForm(prev => ({
        ...prev,
        selling_price: String(breakdown.finalPrice),
        purchase_price: String(Math.round(breakdown.baseGoldValue * 0.98))
      }));
    }
  }, [autoCalc, breakdown.finalPrice, breakdown.baseGoldValue]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleApplyCalculated = () => {
    setForm(prev => ({
      ...prev,
      selling_price: String(breakdown.finalPrice),
      purchase_price: String(Math.round(breakdown.baseGoldValue * 0.98))
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return alert("Product name is required");
    onSubmit(form);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Edit Jewellery Piece" : "Add New Jewellery Piece"}
      subtitle="Complete specification sheet and real-time gold valuation calculation"
      maxWidth="780px"
    >
      <form onSubmit={handleSubmit} className="jewellery-form">
        <div className="form-layout-split">
          {/* Left Column: Form Fields */}
          <div className="form-inputs-col">
            <div className="form-row-2">
              <div className="form-group">
                <label>Product Name *</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Royal Solitaire Ring"
                  required
                />
              </div>

              <div className="form-group">
                <label>SKU / Serial No.</label>
                <div className="input-with-action">
                  <input
                    name="sku"
                    value={form.sku}
                    onChange={handleChange}
                    placeholder="e.g. JWL-2041"
                  />
                  <button
                    type="button"
                    className="inner-action-btn"
                    title="Generate unique SKU"
                    onClick={() => setForm(f => ({ ...f, sku: `JWL-${Math.floor(1000 + Math.random() * 9000)}` }))}
                  >
                    <RefreshCw size={13} />
                  </button>
                </div>
              </div>
            </div>

            <div className="form-row-3">
              <div className="form-group">
                <label>Category</label>
                <select name="category" value={form.category} onChange={handleChange}>
                  <option value="Ring">Ring</option>
                  <option value="Necklace">Necklace</option>
                  <option value="Earrings">Earrings</option>
                  <option value="Bangles">Bangles</option>
                  <option value="Chain">Chain</option>
                  <option value="Pendant">Pendant</option>
                  <option value="Bracelet">Bracelet</option>
                </select>
              </div>

              <div className="form-group">
                <label>Material</label>
                <select name="material" value={form.material} onChange={handleChange}>
                  <option value="Gold">Gold</option>
                  <option value="Gold + Diamond">Gold + Diamond</option>
                  <option value="Diamond">Diamond</option>
                  <option value="Platinum">Platinum</option>
                  <option value="Silver">Silver</option>
                </select>
              </div>

              <div className="form-group">
                <label>Purity</label>
                <select name="purity" value={form.purity} onChange={handleChange}>
                  <option value="24K">24K (99.9%)</option>
                  <option value="22K">22K (91.6%)</option>
                  <option value="18K">18K (75.0%)</option>
                  <option value="14K">14K (58.5%)</option>
                  <option value="925">925 Sterling</option>
                </select>
              </div>
            </div>

            <div className="form-row-3">
              <div className="form-group">
                <label>Weight (grams) *</label>
                <input
                  type="number"
                  step="0.01"
                  name="weight"
                  value={form.weight}
                  onChange={handleChange}
                  placeholder="e.g. 4.5"
                  required
                />
              </div>

              <div className="form-group">
                <label>Making Charges (₹)</label>
                <input
                  type="number"
                  name="making_charges"
                  value={form.making_charges}
                  onChange={handleChange}
                  placeholder="e.g. 3500"
                />
              </div>

              <div className="form-group">
                <label>Stone Charges (₹)</label>
                <input
                  type="number"
                  name="stone_charges"
                  value={form.stone_charges}
                  onChange={handleChange}
                  placeholder="e.g. 2000"
                />
              </div>
            </div>

            <div className="form-row-3">
              <div className="form-group">
                <label>Cost / Purchase Price (₹)</label>
                <input
                  type="number"
                  name="purchase_price"
                  value={form.purchase_price}
                  onChange={handleChange}
                  placeholder="e.g. 28000"
                />
              </div>

              <div className="form-group">
                <label>Retail Selling Price (₹) *</label>
                <input
                  type="number"
                  name="selling_price"
                  value={form.selling_price}
                  onChange={handleChange}
                  placeholder="e.g. 32000"
                  required
                />
              </div>

              <div className="form-group">
                <label>Initial Stock Units *</label>
                <input
                  type="number"
                  min="0"
                  name="quantity"
                  value={form.quantity}
                  onChange={handleChange}
                  placeholder="e.g. 5"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Description / Hallmarking Notes</label>
              <textarea
                name="description"
                rows="2"
                value={form.description}
                onChange={handleChange}
                placeholder="BIS Hallmarked, certified authentic craftsmanship..."
              />
            </div>

            {/* Quick Image Selection */}
            <div className="form-group">
              <label>Showroom Photograph URL</label>
              <input
                name="image_url"
                value={form.image_url}
                onChange={handleChange}
                placeholder="https://..."
              />
              <div className="image-preset-chips">
                <span className="preset-lead">Presets:</span>
                {IMAGE_PRESETS.map((p, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`preset-chip ${form.image_url === p.url ? "active" : ""}`}
                    onClick={() => setForm(f => ({ ...f, image_url: p.url }))}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Live Price Breakdown & Image Preview */}
          <div className="form-preview-col">
            <div className="live-pricing-calculator">
              <div className="calc-header">
                <div className="calc-title">
                  <Calculator size={16} /> Live Price Calculation
                </div>
                <label className="auto-calc-toggle">
                  <input
                    type="checkbox"
                    checked={autoCalc}
                    onChange={e => setAutoCalc(e.target.checked)}
                  />
                  <span>Auto-sync</span>
                </label>
              </div>

              <div className="calc-rates-banner">
                <span>Benchmark {form.purity} Rate:</span>
                <strong>₹ {DEFAULT_RATES[form.purity] || 6875} /g</strong>
              </div>

              <div className="calc-breakdown-list">
                <div className="calc-row">
                  <span>Base Metal ({Number(form.weight || 0)}g):</span>
                  <strong>{formatINR(breakdown.baseGoldValue)}</strong>
                </div>
                <div className="calc-row">
                  <span>Making Charges:</span>
                  <strong>{formatINR(breakdown.makingCharges)}</strong>
                </div>
                <div className="calc-row">
                  <span>Stone / Diamond:</span>
                  <strong>{formatINR(breakdown.stoneCharges)}</strong>
                </div>
                <div className="calc-row subtotal">
                  <span>Subtotal:</span>
                  <strong>{formatINR(breakdown.subtotal)}</strong>
                </div>
                <div className="calc-row tax">
                  <span>GST (3% - 1.5% CGST + 1.5% SGST):</span>
                  <strong>{formatINR(breakdown.gst)}</strong>
                </div>
                <div className="calc-row final">
                  <span>Suggested Retail:</span>
                  <strong className="text-gold">{formatINR(breakdown.finalPrice)}</strong>
                </div>
              </div>

              {!autoCalc && (
                <button
                  type="button"
                  className="apply-calc-btn"
                  onClick={handleApplyCalculated}
                >
                  <Sparkles size={14} /> Apply Calculated Retail Price
                </button>
              )}
            </div>

            {/* Live Media Card Preview */}
            <div className="live-media-preview">
              <span className="preview-label">Visual Preview</span>
              <div className="preview-thumb-box">
                {form.image_url ? (
                  <img src={form.image_url} alt="Preview" />
                ) : (
                  <Image size={32} className="text-muted" />
                )}
                <div className="preview-tag-overlay">
                  {form.purity} {form.category}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-actions-bar">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="gold" loading={loading} icon={Check}>
            {initialData ? "Update Jewellery" : "Save Jewellery to Vault"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
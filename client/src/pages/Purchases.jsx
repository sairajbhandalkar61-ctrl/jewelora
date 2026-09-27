import React, { useEffect, useState } from "react";
import { api } from "../api";
import { ShoppingCart, Plus, Search, Download, Check, Truck, Gem, Calendar, AlertCircle } from "lucide-react";
import Modal from "../components/common/Modal";
import Button from "../components/common/Button";
import Badge from "../components/common/Badge";
import EmptyState from "../components/common/EmptyState";
import { TableSkeleton } from "../components/common/LoadingSkeleton";
import { useToast } from "../context/ToastContext";
import { formatINR } from "../utils/currency";
import { exportToCSV } from "../utils/exportCsv";

export default function Purchases() {
  const [purchases, setPurchases] = useState([]);
  const [jewelleryItems, setJewelleryItems] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const [form, setForm] = useState({
    jewellery_id: "",
    supplier_id: "",
    quantity: "1",
    total_amount: "",
    invoice_ref: "",
    payment_status: "Paid"
  });

  const toast = useToast();

  const loadData = () => {
    setLoading(true);
    Promise.all([
      api.get("/purchases"),
      api.get("/jewellery"),
      api.get("/suppliers")
    ])
      .then(([p, j, s]) => {
        setPurchases(p || []);
        setJewelleryItems(j || []);
        setSuppliers(s || []);
        setLoading(false);
      })
      .catch(err => {
        toast.error("Failed to load purchases", err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenModal = () => {
    setForm({
      jewellery_id: jewelleryItems[0]?.id || "",
      supplier_id: suppliers[0]?.id || "",
      quantity: "2",
      total_amount: jewelleryItems[0] ? String(Number(jewelleryItems[0].purchase_price || 0) * 2) : "",
      invoice_ref: `PUR-${Math.floor(10000 + Math.random() * 90000)}`,
      payment_status: "Paid"
    });
    setModalOpen(true);
  };

  // Auto calculate total amount when jewellery item or quantity changes
  const handleItemSelect = (itemId) => {
    const selected = jewelleryItems.find(j => String(j.id) === String(itemId));
    const qty = Number(form.quantity) || 1;
    const unitPrice = selected ? Number(selected.purchase_price || 0) : 0;
    setForm(prev => ({
      ...prev,
      jewellery_id: itemId,
      total_amount: String(unitPrice * qty)
    }));
  };

  const handleQtyChange = (qty) => {
    const selected = jewelleryItems.find(j => String(j.id) === String(form.jewellery_id));
    const unitPrice = selected ? Number(selected.purchase_price || 0) : 0;
    setForm(prev => ({
      ...prev,
      quantity: qty,
      total_amount: String(unitPrice * Number(qty || 0))
    }));
  };

  const handleSavePurchase = async (e) => {
    e.preventDefault();
    if (!form.jewellery_id) return alert("Please select a jewellery piece");
    setActionLoading(true);
    try {
      await api.post("/purchases", form);
      toast.success("Purchase Logged", "Stock added to vault and inventory reconciled.");
      setModalOpen(false);
      loadData();
    } catch (e) {
      toast.error("Purchase Failed", e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = purchases.filter(p => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      (p.invoice_ref || "").toLowerCase().includes(q) ||
      (p.jewellery_name || "").toLowerCase().includes(q) ||
      (p.supplier_name || "").toLowerCase().includes(q)
    );
  });

  const totalExpenditure = purchases.reduce((sum, p) => sum + Number(p.total_amount || 0), 0);

  const handleExportCSV = () => {
    exportToCSV("Jewelora_Procurement_Orders", [
      { label: "Purchase Ref", key: "invoice_ref" },
      { label: "Date", key: p => new Date(p.purchase_date).toLocaleDateString("en-IN") },
      { label: "Jewellery Item", key: "jewellery_name" },
      { label: "Supplier", key: "supplier_name" },
      { label: "Quantity", key: "quantity" },
      { label: "Total Amount (INR)", key: "total_amount" },
      { label: "Payment Status", key: "payment_status" }
    ], filtered);
    toast.info("CSV Exported", "Procurement history spreadsheet downloaded.");
  };

  return (
    <div className="purchases-page">
      {/* Header Banner */}
      <div className="module-header-banner">
        <div>
          <span className="panel-lead-tag">
            <ShoppingCart size={13} /> Vault Procurement
          </span>
          <h1 className="module-title">Purchases & Stock Procurement</h1>
          <p className="module-subtitle">
            Log precious metal acquisitions from bullion vendors and auto-reconcile stock.
          </p>
        </div>

        <div className="module-header-actions">
          <Button variant="secondary" icon={Download} onClick={handleExportCSV}>
            Export CSV
          </Button>
          <Button variant="gold" icon={Plus} onClick={handleOpenModal}>
            Record New Purchase
          </Button>
        </div>
      </div>

      {/* Procurement Metrics */}
      <div className="crm-stats-grid">
        <div className="crm-stat-card">
          <span className="crm-stat-label">Total Procurement Value</span>
          <strong className="crm-stat-val text-slate">{formatINR(totalExpenditure)}</strong>
        </div>
        <div className="crm-stat-card">
          <span className="crm-stat-label">Procurement Orders Logged</span>
          <strong className="crm-stat-val text-gold">{purchases.length}</strong>
        </div>
        <div className="crm-stat-card">
          <span className="crm-stat-label">Bullion Sourcing Partners</span>
          <strong className="crm-stat-val">{suppliers.length}</strong>
        </div>
      </div>

      {/* Purchases Table Panel */}
      <div className="panel crm-table-panel">
        <div className="crm-panel-header">
          <div className="inventory-search-wrap">
            <Search size={17} className="search-icon" />
            <input
              type="text"
              placeholder="Search purchases by reference, item, or vendor..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="inventory-search-input"
            />
          </div>
          <span className="results-count-pill">
            <b>{filtered.length}</b> purchase orders
          </span>
        </div>

        {loading ? (
          <TableSkeleton rows={6} cols={7} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={ShoppingCart}
            title="No purchases recorded yet"
            description="Log stock receipts from bullion vendors to increase item quantities automatically."
            actionText="Record First Purchase"
            actionIcon={Plus}
            onAction={handleOpenModal}
          />
        ) : (
          <div className="table-wrap">
            <table className="luxury-table">
              <thead>
                <tr>
                  <th>Order Reference</th>
                  <th>Order Date</th>
                  <th>Jewellery Piece</th>
                  <th>Vendor / Supplier</th>
                  <th>Units Inward</th>
                  <th>Total Cost</th>
                  <th>Payment Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id} className="hover-row">
                    <td>
                      <span className="font-mono text-strong">
                        {p.invoice_ref || `PUR-${String(p.id).padStart(4, "0")}`}
                      </span>
                    </td>
                    <td className="text-muted">
                      {new Date(p.purchase_date).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                      })}
                    </td>
                    <td>
                      <div className="table-product-cell">
                        <Gem size={15} className="text-gold" />
                        <strong>{p.jewellery_name || "Jewellery Item"}</strong>
                      </div>
                    </td>
                    <td>
                      <span className="text-party">{p.supplier_name || "Bullion Merchant"}</span>
                    </td>
                    <td>
                      <span className="inward-qty-pill">+{p.quantity} pcs</span>
                    </td>
                    <td>
                      <strong className="text-slate font-medium">
                        {formatINR(p.total_amount)}
                      </strong>
                    </td>
                    <td>
                      <Badge
                        variant={p.payment_status === "Paid" ? "success" : "warning"}
                        size="sm"
                        dot
                      >
                        {p.payment_status || "Paid"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Purchase Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Record Stock Procurement"
        subtitle="Receipt of goods from vendor. Reconciles inventory vault stock automatically."
        maxWidth="560px"
      >
        <form onSubmit={handleSavePurchase} className="standard-form">
          <div className="form-group">
            <label>Jewellery Piece to Restock *</label>
            <select
              value={form.jewellery_id}
              onChange={e => handleItemSelect(e.target.value)}
              required
            >
              <option value="">Select jewellery item</option>
              {jewelleryItems.map(j => (
                <option key={j.id} value={j.id}>
                  {j.name} (Current Stock: {j.quantity}) • Cost: {formatINR(j.purchase_price)}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Bullion Vendor / Supplier *</label>
            <select
              value={form.supplier_id}
              onChange={e => setForm({ ...form, supplier_id: e.target.value })}
              required
            >
              <option value="">Select vendor</option>
              {suppliers.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.address || "Vendor"})
                </option>
              ))}
            </select>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label>Units Received *</label>
              <input
                type="number"
                min="1"
                required
                value={form.quantity}
                onChange={e => handleQtyChange(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Total Invoice Cost (₹) *</label>
              <input
                type="number"
                required
                value={form.total_amount}
                onChange={e => setForm({ ...form, total_amount: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label>Vendor Invoice / Challan Ref</label>
              <input
                type="text"
                placeholder="e.g. VEND-INV-8491"
                value={form.invoice_ref}
                onChange={e => setForm({ ...form, invoice_ref: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Payment Status</label>
              <select
                value={form.payment_status}
                onChange={e => setForm({ ...form, payment_status: e.target.value })}
              >
                <option value="Paid">Paid in Full</option>
                <option value="Pending">Payment Pending</option>
                <option value="Credit">Consignment / Credit</option>
              </select>
            </div>
          </div>

          <div className="modal-actions-bar">
            <Button variant="secondary" onClick={() => setModalOpen(false)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button type="submit" variant="gold" loading={actionLoading} icon={Check}>
              Confirm Inward Receipt
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
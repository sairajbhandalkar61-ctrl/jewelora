import React, { useEffect, useState } from "react";
import { api } from "../api";
import { Receipt, History, ShoppingBag, Plus, Eye, Printer, Download, Sparkles } from "lucide-react";
import ProductCatalog from "../components/billing/ProductCatalog";
import CartDrawer from "../components/billing/CartDrawer";
import InvoiceModal from "../components/billing/InvoiceModal";
import Button from "../components/common/Button";
import Badge from "../components/common/Badge";
import { useToast } from "../context/ToastContext";
import { formatINR } from "../utils/currency";
import { exportToCSV } from "../utils/exportCsv";

export default function Sales() {
  const [jewelleryItems, setJewelleryItems] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [salesHistory, setSalesHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // POS Cart State
  const [cartItems, setCartItems] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Mode: "pos" (active terminal) vs "history" (invoices log)
  const [viewTab, setViewTab] = useState("pos");

  // Active Invoice Modal
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [activeInvoice, setActiveInvoice] = useState(null);

  const toast = useToast();

  const loadData = () => {
    setLoading(true);
    Promise.all([
      api.get("/jewellery"),
      api.get("/customers"),
      api.get("/sales")
    ])
      .then(([j, c, s]) => {
        setJewelleryItems(j || []);
        setCustomers(c || []);
        setSalesHistory(s || []);
        setLoading(false);
      })
      .catch(err => {
        toast.error("Failed to load POS data", err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  // Cart operations
  const handleAddToCart = (product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.quantity) {
          toast.warning("Stock Limit Reached", `Only ${product.quantity} pieces available in vault.`);
          return prev;
        }
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prev, { ...product, quantity: 1, stock: product.quantity }];
      }
    });
  };

  const handleUpdateQuantity = (productId, newQty) => {
    if (newQty <= 0) {
      handleRemoveItem(productId);
      return;
    }
    setCartItems(prev =>
      prev.map(item => {
        if (item.id === productId) {
          const clamped = Math.min(newQty, item.stock);
          return { ...item, quantity: clamped };
        }
        return item;
      })
    );
  };

  const handleRemoveItem = (productId) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
  };

  const handleClearCart = () => {
    setCartItems([]);
    setSelectedCustomer(null);
  };

  // Quick Customer Creation inline from Cart
  const handleQuickAddCustomer = async (custData) => {
    try {
      const created = await api.post("/customers", custData);
      setCustomers(prev => [created, ...prev]);
      setSelectedCustomer(created);
      toast.success("Customer Registered", `${created.name} linked to active bill.`);
    } catch (e) {
      toast.error("Failed to add customer", e.message);
    }
  };

  // Complete Sale & Checkout
  const handleCheckout = async (checkoutPayload) => {
    setCheckoutLoading(true);
    try {
      const res = await api.post("/sales", checkoutPayload);

      // Construct detailed invoice object for display & printing
      const invoiceData = {
        invoice_no: res.invoice_no,
        date: new Date().toISOString(),
        customer_name: selectedCustomer ? selectedCustomer.name : "Walk-in Guest",
        customer_phone: selectedCustomer ? selectedCustomer.phone : "",
        customer_address: selectedCustomer ? selectedCustomer.address : "",
        payment_method: checkoutPayload.payment_method,
        discount: checkoutPayload.discount,
        tax_amount: checkoutPayload.tax_amount,
        total_amount: checkoutPayload.total_amount,
        subtotal: checkoutPayload.subtotal,
        items: cartItems.map(c => ({
          name: c.name,
          sku: c.sku,
          category: c.category,
          purity: c.purity,
          weight: c.weight,
          quantity: c.quantity,
          rate: c.selling_price,
          total: c.selling_price * c.quantity
        }))
      };

      toast.success("Sale Completed", `Invoice ${res.invoice_no} generated successfully.`);
      setActiveInvoice(invoiceData);
      setInvoiceModalOpen(true);

      // Clear bill & reload updated stock from server
      handleClearCart();
      loadData();
    } catch (e) {
      toast.error("Checkout Failed", e.message);
    } finally {
      setCheckoutLoading(false);
    }
  };

  // Open existing historical invoice
  const handleViewHistoricalInvoice = async (sale) => {
    try {
      const details = await api.get(`/sales/${sale.id}`);
      setActiveInvoice({
        ...details,
        date: details.sale_date,
        items: [{
          name: details.jewellery_name,
          sku: details.jewellery_sku,
          category: details.jewellery_category,
          purity: details.jewellery_purity,
          weight: details.jewellery_weight,
          quantity: details.quantity,
          rate: details.jewellery_unit_price || details.total_amount,
          total: details.total_amount
        }]
      });
      setInvoiceModalOpen(true);
    } catch (e) {
      toast.error("Unable to load invoice", e.message);
    }
  };

  const handleExportCSV = () => {
    exportToCSV("Jewelora_Sales_Invoices", [
      { label: "Invoice No", key: "invoice_no" },
      { label: "Date", key: s => new Date(s.sale_date).toLocaleDateString("en-IN") },
      { label: "Customer", key: "customer_name" },
      { label: "Item", key: "jewellery_name" },
      { label: "Quantity", key: "quantity" },
      { label: "Total (INR)", key: "total_amount" },
      { label: "Payment Mode", key: "payment_method" }
    ], salesHistory);
    toast.info("CSV Exported", "Sales history spreadsheet downloaded.");
  };

  return (
    <div className="pos-sales-page">
      {/* Top Banner & Mode Switcher */}
      <div className="module-header-banner">
        <div>
          <span className="panel-lead-tag">
            <Receipt size={13} /> Billing Counter & POS
          </span>
          <h1 className="module-title">Sales Terminal & Invoicing</h1>
          <p className="module-subtitle">
            Modern high-speed jewellery checkout, customer selection, automated GST calculation, and tax invoice printing.
          </p>
        </div>

        <div className="module-header-actions">
          <div className="tab-pill-switcher">
            <button
              className={`tab-pill-btn ${viewTab === "pos" ? "active" : ""}`}
              onClick={() => setViewTab("pos")}
            >
              <Receipt size={15} /> Active Terminal
            </button>
            <button
              className={`tab-pill-btn ${viewTab === "history" ? "active" : ""}`}
              onClick={() => setViewTab("history")}
            >
              <History size={15} /> Invoices Log ({salesHistory.length})
            </button>
          </div>
          {viewTab === "history" && (
            <Button variant="secondary" icon={Download} onClick={handleExportCSV}>
              Export CSV
            </Button>
          )}
        </div>
      </div>

      {/* POS Active Terminal View */}
      {viewTab === "pos" ? (
        <div className="pos-terminal-layout">
          {/* Left Column: Catalogue */}
          <div className="pos-catalogue-column">
            <ProductCatalog
              items={jewelleryItems}
              onAddToCart={handleAddToCart}
              cartItems={cartItems}
            />
          </div>

          {/* Right Column: Active Bill Drawer */}
          <div className="pos-cart-column">
            <CartDrawer
              cartItems={cartItems}
              customers={customers}
              selectedCustomer={selectedCustomer}
              onSelectCustomer={setSelectedCustomer}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
              onClearCart={handleClearCart}
              onCheckout={handleCheckout}
              onQuickAddCustomer={handleQuickAddCustomer}
              loading={checkoutLoading}
            />
          </div>
        </div>
      ) : (
        /* Invoices Log / Sales History View */
        <div className="panel crm-table-panel">
          <div className="crm-panel-header">
            <h4>Past Invoices & Sales Transactions</h4>
            <span className="results-count-pill">
              <b>{salesHistory.length}</b> historical records
            </span>
          </div>

          <div className="table-wrap">
            <table className="luxury-table">
              <thead>
                <tr>
                  <th>Invoice No</th>
                  <th>Date & Time</th>
                  <th>Patron</th>
                  <th>Item Purchased</th>
                  <th>Qty</th>
                  <th>Gross Amount</th>
                  <th>Payment Mode</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {salesHistory.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="table-empty-cell">
                      No invoices recorded yet. Start billing on the Active Terminal.
                    </td>
                  </tr>
                ) : (
                  salesHistory.map(s => (
                    <tr key={s.id} className="hover-row">
                      <td>
                        <span className="font-mono text-strong">
                          {s.invoice_no || `INV-2026-${String(s.id).padStart(4, "0")}`}
                        </span>
                      </td>
                      <td className="text-muted">
                        {new Date(s.sale_date).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric"
                        })}
                      </td>
                      <td>
                        <span className="text-party">{s.customer_name || "Walk-in Guest"}</span>
                      </td>
                      <td>
                        <div className="table-product-cell">
                          <strong>{s.jewellery_name || "Jewellery piece"}</strong>
                        </div>
                      </td>
                      <td>{s.quantity}</td>
                      <td>
                        <strong className="text-gold font-medium">
                          {formatINR(s.total_amount)}
                        </strong>
                      </td>
                      <td>
                        <Badge variant="neutral" size="sm">
                          {s.payment_method || "Cash"}
                        </Badge>
                      </td>
                      <td>
                        <div className="table-actions-cell">
                          <button
                            className="table-action-icon"
                            title="Print / View Tax Invoice"
                            onClick={() => handleViewHistoricalInvoice(s)}
                          >
                            <Printer size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Commercial Tax Invoice Modal */}
      <InvoiceModal
        isOpen={invoiceModalOpen}
        onClose={() => setInvoiceModalOpen(false)}
        invoiceData={activeInvoice}
      />
    </div>
  );
}
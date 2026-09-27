import React, { useRef } from "react";
import Modal from "../common/Modal";
import Button from "../common/Button";
import { Printer, Download, Gem, ShieldCheck, CheckCircle2 } from "lucide-react";
import { formatINR, numberToWordsINR } from "../../utils/currency";

export default function InvoiceModal({
  isOpen,
  onClose,
  invoiceData = null
}) {
  const invoiceRef = useRef(null);

  if (!isOpen || !invoiceData) return null;

  const handlePrint = () => {
    window.print();
  };

  const invoiceNo = invoiceData.invoice_no || `INV-2026-${String(invoiceData.id || 1).padStart(4, "0")}`;
  const dateStr = invoiceData.date 
    ? new Date(invoiceData.date).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })
    : new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });

  const items = invoiceData.items || [
    {
      name: invoiceData.jewellery_name || "Certified Gold Jewellery",
      sku: invoiceData.jewellery_sku || `JWL-${invoiceData.jewellery_id || "001"}`,
      category: invoiceData.jewellery_category || "Ring",
      purity: invoiceData.jewellery_purity || "22K",
      weight: invoiceData.jewellery_weight || 4.5,
      quantity: invoiceData.quantity || 1,
      rate: invoiceData.jewellery_unit_price || invoiceData.total_amount,
      total: invoiceData.total_amount || 32000
    }
  ];

  const subtotal = invoiceData.subtotal || invoiceData.total_amount || 0;
  const discount = Number(invoiceData.discount) || 0;
  const taxAmount = Number(invoiceData.tax_amount) || Math.round((subtotal - discount) * 0.03);
  const grandTotal = Number(invoiceData.total_amount) || (subtotal - discount + taxAmount);
  const paymentMethod = invoiceData.payment_method || "UPI / Digital Transfer";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tax Invoice"
      subtitle={`Reference: ${invoiceNo} • Ready for Printing`}
      maxWidth="860px"
      footer={
        <div className="invoice-modal-footer">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button variant="gold" icon={Printer} onClick={handlePrint}>
            Print Tax Invoice
          </Button>
        </div>
      }
    >
      <div className="invoice-print-container" ref={invoiceRef}>
        {/* Printable Tax Invoice Document */}
        <div className="invoice-document" id="jewelora-printable-invoice">
          {/* Header */}
          <div className="invoice-doc-header">
            <div className="doc-brand">
              <div className="doc-brand-logo">
                <Gem size={26} />
              </div>
              <div>
                <h2 className="doc-brand-name">JEWELORA</h2>
                <span className="doc-brand-sub">LUXURY JEWELLERS & DIAMOND MERCHANTS</span>
              </div>
            </div>

            <div className="doc-invoice-meta">
              <span className="doc-type-badge">TAX INVOICE / CASH MEMO</span>
              <div className="meta-line">
                <span>Invoice No:</span>
                <strong>{invoiceNo}</strong>
              </div>
              <div className="meta-line">
                <span>Date:</span>
                <span>{dateStr}</span>
              </div>
              <div className="meta-line">
                <span>GSTIN:</span>
                <span className="font-mono">27AAAAJ0000A1Z5</span>
              </div>
            </div>
          </div>

          <div className="doc-divider" />

          {/* Customer & Showroom Info */}
          <div className="doc-parties-grid">
            <div className="party-box billed-to">
              <span className="party-title">BILLED TO:</span>
              <strong className="party-name">
                {invoiceData.customer_name || (invoiceData.customer && invoiceData.customer.name) || "Valued Walk-in Customer"}
              </strong>
              <p className="party-contact">
                Phone: {invoiceData.customer_phone || (invoiceData.customer && invoiceData.customer.phone) || "Not provided"}
              </p>
              <p className="party-contact">
                {invoiceData.customer_address || (invoiceData.customer && invoiceData.customer.address) || "Showroom Counter Purchase"}
              </p>
            </div>

            <div className="party-box showroom-from">
              <span className="party-title">ISSUED BY:</span>
              <strong className="party-name">Jewelora Flagship Showroom</strong>
              <p className="party-contact">Jewellery Square, High Street Arcade</p>
              <p className="party-contact">Contact: +91 98765 43210 • contact@jewelora.com</p>
              <p className="party-contact">Place of Supply: Maharashtra (27)</p>
            </div>
          </div>

          {/* Itemized Table */}
          <table className="doc-items-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Description</th>
                <th>SKU</th>
                <th>Purity</th>
                <th>Net Wt. (g)</th>
                <th>Qty</th>
                <th>Rate (₹)</th>
                <th className="text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx}>
                  <td>{idx + 1}</td>
                  <td>
                    <strong>{item.name || item.jewellery_name}</strong>
                    <small className="item-sub-desc">{item.category || "Fine Jewellery"} • Hallmarked</small>
                  </td>
                  <td className="font-mono">{item.sku || `JWL-${idx + 1}`}</td>
                  <td>{item.purity || "22K"}</td>
                  <td>{Number(item.weight || 0).toFixed(2)}</td>
                  <td>{item.quantity || 1}</td>
                  <td>{formatINR(item.rate || item.selling_price || item.total, false)}</td>
                  <td className="text-right font-medium">
                    {formatINR(item.total || ((item.rate || item.selling_price || 0) * (item.quantity || 1)), false)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Financial Breakdown & Summary */}
          <div className="doc-summary-split">
            <div className="doc-terms-box">
              <div className="doc-hallmark-notice">
                <ShieldCheck size={18} className="text-gold" />
                <span>Certified 100% BIS Hallmarked Jewellery. Purity guaranteed as per Bureau of Indian Standards.</span>
              </div>
              <div className="doc-terms-list">
                <span>• 14-day exchange policy against original invoice and certification.</span>
                <span>• Lifetime buyback guarantee at prevailing bullion rates.</span>
                <span>• Subject to local jurisdiction.</span>
              </div>
            </div>

            <div className="doc-fin-calc-box">
              <div className="doc-calc-row">
                <span>Taxable Subtotal:</span>
                <strong>{formatINR(subtotal)}</strong>
              </div>
              {discount > 0 && (
                <div className="doc-calc-row text-success">
                  <span>Showroom Discount:</span>
                  <span>- {formatINR(discount)}</span>
                </div>
              )}
              <div className="doc-calc-row">
                <span>CGST (1.5%):</span>
                <span>{formatINR(Math.round(taxAmount / 2))}</span>
              </div>
              <div className="doc-calc-row">
                <span>SGST (1.5%):</span>
                <span>{formatINR(taxAmount - Math.round(taxAmount / 2))}</span>
              </div>
              <div className="doc-calc-row grand-total">
                <span>Invoice Total:</span>
                <strong className="text-gold">{formatINR(grandTotal)}</strong>
              </div>
              <div className="doc-payment-status">
                <span className="paid-stamp">
                  <CheckCircle2 size={14} /> PAID VIA {paymentMethod.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Amount in words */}
          <div className="doc-amount-in-words">
            <span>Amount in words:</span>
            <strong>{numberToWordsINR(grandTotal)}</strong>
          </div>

          {/* Signatures */}
          <div className="doc-signatures-row">
            <div className="sig-block">
              <div className="sig-line" />
              <span>Customer Acknowledgment</span>
            </div>
            <div className="sig-block authorized">
              <div className="sig-line" />
              <span>For JEWELORA LUXURY JEWELLERS</span>
              <small>(Authorized Signatory)</small>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
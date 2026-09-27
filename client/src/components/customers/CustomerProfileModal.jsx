import React, { useEffect, useState } from "react";
import Modal from "../common/Modal";
import Button from "../common/Button";
import { User, Phone, Mail, MapPin, ShoppingBag, Receipt, Sparkles } from "lucide-react";
import { formatINR } from "../../utils/currency";
import { api } from "../../api";

export default function CustomerProfileModal({
  isOpen,
  onClose,
  customerId,
  onStartSale
}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && customerId) {
      setLoading(true);
      api.get(`/customers/${customerId}`)
        .then(res => {
          setData(res);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    } else {
      setData(null);
    }
  }, [isOpen, customerId]);

  if (!isOpen) return null;

  const aov = data && data.purchase_count > 0 
    ? Math.round(data.total_spent / data.purchase_count) 
    : 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={data ? data.name : "Customer Profile"}
      subtitle="Patron portfolio and historical acquisition record"
      maxWidth="720px"
    >
      {loading || !data ? (
        <div className="profile-loading-box">
          <p>Loading customer portfolio...</p>
        </div>
      ) : (
        <div className="customer-profile-content">
          {/* Header Card */}
          <div className="profile-top-card">
            <div className="profile-avatar-large">
              {data.name.charAt(0)}
            </div>
            <div className="profile-meta-block">
              <h3>{data.name}</h3>
              <div className="profile-contacts-row">
                {data.phone && (
                  <span><Phone size={13} /> {data.phone}</span>
                )}
                {data.email && (
                  <span><Mail size={13} /> {data.email}</span>
                )}
                {data.address && (
                  <span><MapPin size={13} /> {data.address}</span>
                )}
              </div>
            </div>

            {onStartSale && (
              <Button
                variant="gold"
                size="sm"
                icon={ShoppingBag}
                onClick={() => { onClose(); onStartSale(data); }}
              >
                Create Bill
              </Button>
            )}
          </div>

          {/* KPI Summary Cards */}
          <div className="profile-kpi-grid">
            <div className="profile-kpi-card">
              <span className="p-kpi-label">Lifetime Spend</span>
              <strong className="p-kpi-val text-gold">{formatINR(data.total_spent || 0)}</strong>
            </div>
            <div className="profile-kpi-card">
              <span className="p-kpi-label">Total Invoices</span>
              <strong className="p-kpi-val">{data.purchase_count || 0}</strong>
            </div>
            <div className="profile-kpi-card">
              <span className="p-kpi-label">Average Order Value</span>
              <strong className="p-kpi-val">{formatINR(aov)}</strong>
            </div>
            <div className="profile-kpi-card">
              <span className="p-kpi-label">Favorite Category</span>
              <strong className="p-kpi-val">{data.favorite_category || "None"}</strong>
            </div>
          </div>

          {/* Invoices List */}
          <div className="profile-history-table">
            <div className="p-table-head">
              <Receipt size={16} />
              <h4>Purchase History</h4>
            </div>

            <div className="table-wrap">
              <table className="luxury-table mini">
                <thead>
                  <tr>
                    <th>Invoice / Date</th>
                    <th>Item Purchased</th>
                    <th>Category</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {data.history && data.history.length > 0 ? (
                    data.history.map(h => (
                      <tr key={h.id}>
                        <td>
                          <strong>{h.invoice_no || `INV-${h.id}`}</strong>
                          <small className="block text-muted">
                            {new Date(h.sale_date).toLocaleDateString("en-IN")}
                          </small>
                        </td>
                        <td>{h.jewellery_name || "Jewellery piece"}</td>
                        <td>{h.jewellery_category || "-"}</td>
                        <td>
                          <strong className="text-gold">{formatINR(h.total_amount)}</strong>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="table-empty-cell">
                        No purchase transactions recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
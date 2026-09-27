import React, { useEffect, useState } from "react";
import Modal from "../common/Modal";
import Button from "../common/Button";
import { Truck, Phone, Mail, MapPin, ShoppingCart } from "lucide-react";
import { formatINR } from "../../utils/currency";
import { api } from "../../api";

export default function SupplierProfileModal({
  isOpen,
  onClose,
  supplierId,
  onRecordPurchase
}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && supplierId) {
      setLoading(true);
      api.get(`/suppliers/${supplierId}`)
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
  }, [isOpen, supplierId]);

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={data ? data.name : "Supplier Profile"}
      subtitle="Procurement history and sourcing partner record"
      maxWidth="720px"
    >
      {loading || !data ? (
        <div className="profile-loading-box">
          <p>Loading vendor profile...</p>
        </div>
      ) : (
        <div className="customer-profile-content">
          <div className="profile-top-card">
            <div className="profile-avatar-large supplier">
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

            {onRecordPurchase && (
              <Button
                variant="gold"
                size="sm"
                icon={ShoppingCart}
                onClick={() => { onClose(); onRecordPurchase(data); }}
              >
                Record Purchase
              </Button>
            )}
          </div>

          <div className="profile-kpi-grid">
            <div className="profile-kpi-card">
              <span className="p-kpi-label">Total Sourced Value</span>
              <strong className="p-kpi-val text-gold">{formatINR(data.total_procurement_value || 0)}</strong>
            </div>
            <div className="profile-kpi-card">
              <span className="p-kpi-label">Purchase Orders</span>
              <strong className="p-kpi-val">{data.orders_count || 0}</strong>
            </div>
          </div>

          <div className="profile-history-table">
            <div className="p-table-head">
              <ShoppingCart size={16} />
              <h4>Procurement Orders</h4>
            </div>

            <div className="table-wrap">
              <table className="luxury-table mini">
                <thead>
                  <tr>
                    <th>Ref / Date</th>
                    <th>Item Received</th>
                    <th>Qty</th>
                    <th>Total Sourced</th>
                  </tr>
                </thead>
                <tbody>
                  {data.orders && data.orders.length > 0 ? (
                    data.orders.map(o => (
                      <tr key={o.id}>
                        <td>
                          <strong>{o.invoice_ref || `PUR-${o.id}`}</strong>
                          <small className="block text-muted">
                            {new Date(o.purchase_date).toLocaleDateString("en-IN")}
                          </small>
                        </td>
                        <td>{o.jewellery_name || "Jewellery Item"}</td>
                        <td>{o.quantity} units</td>
                        <td>
                          <strong className="text-gold">{formatINR(o.total_amount)}</strong>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="table-empty-cell">
                        No purchase orders logged with this vendor yet.
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
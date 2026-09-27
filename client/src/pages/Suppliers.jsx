import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { Truck, Plus, Search, Download, Trash2, Edit3, Eye, Phone, Mail, MapPin, ShoppingBag } from "lucide-react";
import SupplierFormModal from "../components/suppliers/SupplierFormModal";
import SupplierProfileModal from "../components/suppliers/SupplierProfileModal";
import ConfirmDialog from "../components/common/ConfirmDialog";
import EmptyState from "../components/common/EmptyState";
import Button from "../components/common/Button";
import { TableSkeleton } from "../components/common/LoadingSkeleton";
import { useToast } from "../context/ToastContext";
import { formatINR } from "../utils/currency";
import { exportToCSV } from "../utils/exportCsv";

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editSupplier, setEditSupplier] = useState(null);
  const [profileSupplierId, setProfileSupplierId] = useState(null);
  const [deleteSupplier, setDeleteSupplier] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const navigate = useNavigate();
  const toast = useToast();

  const loadSuppliers = () => {
    setLoading(true);
    api.get("/suppliers")
      .then(res => {
        setSuppliers(res || []);
        setLoading(false);
      })
      .catch(err => {
        toast.error("Failed to load suppliers", err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  const handleSave = async (formData) => {
    setActionLoading(true);
    try {
      if (editSupplier) {
        await api.put(`/suppliers/${editSupplier.id}`, formData);
        toast.success("Supplier Updated", `${formData.name}'s record has been updated.`);
      } else {
        await api.post("/suppliers", formData);
        toast.success("Supplier Added", `${formData.name} added to vendor directory.`);
      }
      setFormOpen(false);
      setEditSupplier(null);
      loadSuppliers();
    } catch (e) {
      toast.error("Operation Failed", e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteSupplier) return;
    setActionLoading(true);
    try {
      await api.del(`/suppliers/${deleteSupplier.id}`);
      toast.success("Supplier Deleted", `${deleteSupplier.name} removed from directory.`);
      setDeleteSupplier(null);
      loadSuppliers();
    } catch (e) {
      toast.error("Deletion Failed", e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = suppliers.filter(s => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      (s.name || "").toLowerCase().includes(q) ||
      (s.phone || "").toLowerCase().includes(q) ||
      (s.email || "").toLowerCase().includes(q) ||
      (s.address || "").toLowerCase().includes(q)
    );
  });

  const totalProcurementAll = suppliers.reduce((sum, s) => sum + Number(s.total_procurement_value || 0), 0);

  const handleExportCSV = () => {
    exportToCSV("Jewelora_Suppliers", [
      { label: "Supplier ID", key: "id" },
      { label: "Name", key: "name" },
      { label: "Phone", key: "phone" },
      { label: "Email", key: "email" },
      { label: "Address", key: "address" },
      { label: "Total Orders Count", key: "total_orders_count" },
      { label: "Total Sourced Value (INR)", key: "total_procurement_value" }
    ], filtered);
    toast.info("CSV Exported", "Supplier directory spreadsheet downloaded.");
  };

  return (
    <div className="suppliers-page">
      {/* Page Header */}
      <div className="module-header-banner">
        <div>
          <span className="panel-lead-tag">
            <Truck size={13} /> Sourcing & Bullion Vendors
          </span>
          <h1 className="module-title">Supplier & Vendor Directory</h1>
          <p className="module-subtitle">
            Manage precious metal merchants, gemstone dealers, and artisan manufacturing partners.
          </p>
        </div>

        <div className="module-header-actions">
          <Button variant="secondary" icon={Download} onClick={handleExportCSV}>
            Export CSV
          </Button>
          <Button
            variant="gold"
            icon={Plus}
            onClick={() => { setEditSupplier(null); setFormOpen(true); }}
          >
            Add Supplier
          </Button>
        </div>
      </div>

      {/* Sourcing Statistics */}
      <div className="crm-stats-grid">
        <div className="crm-stat-card">
          <span className="crm-stat-label">Active Bullion Partners</span>
          <strong className="crm-stat-val text-gold">{suppliers.length}</strong>
        </div>
        <div className="crm-stat-card">
          <span className="crm-stat-label">Total Sourced Value</span>
          <strong className="crm-stat-val text-slate">{formatINR(totalProcurementAll)}</strong>
        </div>
        <div className="crm-stat-card">
          <span className="crm-stat-label">Average Sourced per Partner</span>
          <strong className="crm-stat-val">
            {formatINR(suppliers.length > 0 ? Math.round(totalProcurementAll / suppliers.length) : 0)}
          </strong>
        </div>
      </div>

      {/* Table Panel */}
      <div className="panel crm-table-panel">
        <div className="crm-panel-header">
          <div className="inventory-search-wrap">
            <Search size={17} className="search-icon" />
            <input
              type="text"
              placeholder="Search suppliers by company name, contact, or city..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="inventory-search-input"
            />
          </div>
          <span className="results-count-pill">
            <b>{filtered.length}</b> supplier(s)
          </span>
        </div>

        {loading ? (
          <TableSkeleton rows={5} cols={6} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Truck}
            title="No suppliers found"
            description="Add your first bullion vendor to start logging purchase orders and inventory restocks."
            actionText="Add Supplier"
            actionIcon={Plus}
            onAction={() => { setEditSupplier(null); setFormOpen(true); }}
          />
        ) : (
          <div className="table-wrap">
            <table className="luxury-table">
              <thead>
                <tr>
                  <th>Vendor / Company</th>
                  <th>Contact Phone</th>
                  <th>Email</th>
                  <th>Trading Address</th>
                  <th>Total Sourced</th>
                  <th>Orders</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s.id} className="hover-row">
                    <td>
                      <div className="crm-customer-cell" onClick={() => setProfileSupplierId(s.id)}>
                        <div className="crm-customer-avatar supplier">{s.name.charAt(0)}</div>
                        <div className="crm-customer-info">
                          <strong className="crm-customer-name">{s.name}</strong>
                          <small className="crm-customer-id">Vendor #{String(s.id).padStart(4, "0")}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      {s.phone ? (
                        <span className="crm-contact-chip"><Phone size={12} /> {s.phone}</span>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td>
                      {s.email ? (
                        <span className="crm-contact-chip"><Mail size={12} /> {s.email}</span>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td>
                      {s.address ? (
                        <span className="crm-contact-chip"><MapPin size={12} /> {s.address}</span>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td>
                      <strong className="text-gold font-medium">
                        {formatINR(s.total_procurement_value || 0)}
                      </strong>
                    </td>
                    <td>
                      <span className="invoices-pill">
                        {s.total_orders_count || 0} orders
                      </span>
                    </td>
                    <td>
                      <div className="table-actions-cell">
                        <button
                          className="table-action-icon"
                          title="View Vendor Portfolio"
                          onClick={() => setProfileSupplierId(s.id)}
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          className="table-action-icon"
                          title="Edit Supplier"
                          onClick={() => { setEditSupplier(s); setFormOpen(true); }}
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          className="table-action-icon danger"
                          title="Delete Supplier"
                          onClick={() => setDeleteSupplier(s)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <SupplierFormModal
        isOpen={formOpen}
        onClose={() => { setFormOpen(false); setEditSupplier(null); }}
        onSubmit={handleSave}
        initialData={editSupplier}
        loading={actionLoading}
      />

      <SupplierProfileModal
        isOpen={profileSupplierId !== null}
        onClose={() => setProfileSupplierId(null)}
        supplierId={profileSupplierId}
        onRecordPurchase={() => navigate("/purchases")}
      />

      <ConfirmDialog
        isOpen={deleteSupplier !== null}
        onClose={() => setDeleteSupplier(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Supplier Record?"
        message={deleteSupplier ? `Are you sure you want to delete "${deleteSupplier.name}"? Past purchase receipts will be preserved.` : ""}
        confirmText="Delete Supplier"
        confirmVariant="danger"
        loading={actionLoading}
      />
    </div>
  );
}
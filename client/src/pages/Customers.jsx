import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { Users, Plus, Search, Download, Trash2, Edit3, Eye, Phone, Mail, MapPin, Receipt, Sparkles } from "lucide-react";
import CustomerFormModal from "../components/customers/CustomerFormModal";
import CustomerProfileModal from "../components/customers/CustomerProfileModal";
import ConfirmDialog from "../components/common/ConfirmDialog";
import EmptyState from "../components/common/EmptyState";
import Button from "../components/common/Button";
import { TableSkeleton } from "../components/common/LoadingSkeleton";
import { useToast } from "../context/ToastContext";
import { formatINR } from "../utils/currency";
import { exportToCSV } from "../utils/exportCsv";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editCustomer, setEditCustomer] = useState(null);
  const [profileCustomerId, setProfileCustomerId] = useState(null);
  const [deleteCustomer, setDeleteCustomer] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const navigate = useNavigate();
  const toast = useToast();

  const loadCustomers = () => {
    setLoading(true);
    api.get("/customers")
      .then(res => {
        setCustomers(res || []);
        setLoading(false);
      })
      .catch(err => {
        toast.error("Failed to load customers", err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleSave = async (formData) => {
    setActionLoading(true);
    try {
      if (editCustomer) {
        await api.put(`/customers/${editCustomer.id}`, formData);
        toast.success("Customer Updated", `${formData.name}'s record has been updated.`);
      } else {
        await api.post("/customers", formData);
        toast.success("Customer Added", `${formData.name} added to patron directory.`);
      }
      setFormOpen(false);
      setEditCustomer(null);
      loadCustomers();
    } catch (e) {
      toast.error("Operation Failed", e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteCustomer) return;
    setActionLoading(true);
    try {
      await api.del(`/customers/${deleteCustomer.id}`);
      toast.success("Customer Deleted", `${deleteCustomer.name} removed from directory.`);
      setDeleteCustomer(null);
      loadCustomers();
    } catch (e) {
      toast.error("Deletion Failed", e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = customers.filter(c => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      (c.name || "").toLowerCase().includes(q) ||
      (c.phone || "").toLowerCase().includes(q) ||
      (c.email || "").toLowerCase().includes(q) ||
      (c.address || "").toLowerCase().includes(q)
    );
  });

  const totalSpentAll = customers.reduce((sum, c) => sum + Number(c.total_spent || 0), 0);

  const handleExportCSV = () => {
    exportToCSV("Jewelora_Customers", [
      { label: "Customer ID", key: "id" },
      { label: "Name", key: "name" },
      { label: "Phone", key: "phone" },
      { label: "Email", key: "email" },
      { label: "Address", key: "address" },
      { label: "Total Purchases Count", key: "total_purchases_count" },
      { label: "Total Spent (INR)", key: "total_spent" }
    ], filtered);
    toast.info("CSV Exported", "Customer directory spreadsheet downloaded.");
  };

  return (
    <div className="customers-page">
      {/* Page Header */}
      <div className="module-header-banner">
        <div>
          <span className="panel-lead-tag">
            <Users size={13} /> Patron Directory
          </span>
          <h1 className="module-title">Customer Relationship Management</h1>
          <p className="module-subtitle">
            Maintain verified customer profiles, purchase history, and average order values.
          </p>
        </div>

        <div className="module-header-actions">
          <Button variant="secondary" icon={Download} onClick={handleExportCSV}>
            Export CSV
          </Button>
          <Button
            variant="gold"
            icon={Plus}
            onClick={() => { setEditCustomer(null); setFormOpen(true); }}
          >
            Add Customer
          </Button>
        </div>
      </div>

      {/* CRM Statistics Row */}
      <div className="crm-stats-grid">
        <div className="crm-stat-card">
          <span className="crm-stat-label">Total Verified Patrons</span>
          <strong className="crm-stat-val text-gold">{customers.length}</strong>
        </div>
        <div className="crm-stat-card">
          <span className="crm-stat-label">Total Patron Acquisition Spend</span>
          <strong className="crm-stat-val text-success">{formatINR(totalSpentAll)}</strong>
        </div>
        <div className="crm-stat-card">
          <span className="crm-stat-label">Average Spending per Patron</span>
          <strong className="crm-stat-val">
            {formatINR(customers.length > 0 ? Math.round(totalSpentAll / customers.length) : 0)}
          </strong>
        </div>
      </div>

      {/* Search Bar & Table Panel */}
      <div className="panel crm-table-panel">
        <div className="crm-panel-header">
          <div className="inventory-search-wrap">
            <Search size={17} className="search-icon" />
            <input
              type="text"
              placeholder="Search customers by name, phone, or location..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="inventory-search-input"
            />
          </div>
          <span className="results-count-pill">
            <b>{filtered.length}</b> customer(s)
          </span>
        </div>

        {loading ? (
          <TableSkeleton rows={6} cols={6} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No customers found"
            description="Add your first customer to start tracking purchase history and lifetime spending."
            actionText="Add Customer"
            actionIcon={Plus}
            onAction={() => { setEditCustomer(null); setFormOpen(true); }}
          />
        ) : (
          <div className="table-wrap">
            <table className="luxury-table">
              <thead>
                <tr>
                  <th>Patron</th>
                  <th>Contact Phone</th>
                  <th>Email</th>
                  <th>Location</th>
                  <th>Total Spent</th>
                  <th>Invoices</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id} className="hover-row">
                    <td>
                      <div className="crm-customer-cell" onClick={() => setProfileCustomerId(c.id)}>
                        <div className="crm-customer-avatar">{c.name.charAt(0)}</div>
                        <div className="crm-customer-info">
                          <strong className="crm-customer-name">{c.name}</strong>
                          <small className="crm-customer-id">ID: #{String(c.id).padStart(4, "0")}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      {c.phone ? (
                        <span className="crm-contact-chip"><Phone size={12} /> {c.phone}</span>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td>
                      {c.email ? (
                        <span className="crm-contact-chip"><Mail size={12} /> {c.email}</span>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td>
                      {c.address ? (
                        <span className="crm-contact-chip"><MapPin size={12} /> {c.address}</span>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td>
                      <strong className="text-gold font-medium">
                        {formatINR(c.total_spent || 0)}
                      </strong>
                    </td>
                    <td>
                      <span className="invoices-pill">
                        {c.total_purchases_count || 0} bills
                      </span>
                    </td>
                    <td>
                      <div className="table-actions-cell">
                        <button
                          className="table-action-icon"
                          title="View Patron Portfolio"
                          onClick={() => setProfileCustomerId(c.id)}
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          className="table-action-icon"
                          title="Edit Customer"
                          onClick={() => { setEditCustomer(c); setFormOpen(true); }}
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          className="table-action-icon danger"
                          title="Delete Customer"
                          onClick={() => setDeleteCustomer(c)}
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
      <CustomerFormModal
        isOpen={formOpen}
        onClose={() => { setFormOpen(false); setEditCustomer(null); }}
        onSubmit={handleSave}
        initialData={editCustomer}
        loading={actionLoading}
      />

      <CustomerProfileModal
        isOpen={profileCustomerId !== null}
        onClose={() => setProfileCustomerId(null)}
        customerId={profileCustomerId}
        onStartSale={() => navigate("/sales")}
      />

      <ConfirmDialog
        isOpen={deleteCustomer !== null}
        onClose={() => setDeleteCustomer(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Customer Record?"
        message={deleteCustomer ? `Are you sure you want to permanently delete "${deleteCustomer.name}"? Historical invoices will remain in audit archives.` : ""}
        confirmText="Delete Record"
        confirmVariant="danger"
        loading={actionLoading}
      />
    </div>
  );
}
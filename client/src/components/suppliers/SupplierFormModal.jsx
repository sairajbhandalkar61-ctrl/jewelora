import React, { useState, useEffect } from "react";
import Modal from "../common/Modal";
import Button from "../common/Button";
import { Truck, Phone, Mail, MapPin, Check } from "lucide-react";

export default function SupplierFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  loading = false
}) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: ""
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || "",
        phone: initialData.phone || "",
        email: initialData.email || "",
        address: initialData.address || ""
      });
    } else {
      setForm({ name: "", phone: "", email: "", address: "" });
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return alert("Supplier / Bullion merchant name is required");
    onSubmit(form);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Edit Supplier Record" : "Add New Supplier / Vendor"}
      subtitle="Bullion merchants, artisan workshops, and gemstone suppliers"
      maxWidth="520px"
    >
      <form onSubmit={handleSubmit} className="standard-form">
        <div className="form-group">
          <label>Company / Supplier Name *</label>
          <div className="input-icon-wrap">
            <Truck size={16} className="input-icon" />
            <input
              type="text"
              required
              placeholder="e.g. Mahalaxmi Bullion & Gems"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
            />
          </div>
        </div>

        <div className="form-row-2">
          <div className="form-group">
            <label>Contact Phone</label>
            <div className="input-icon-wrap">
              <Phone size={16} className="input-icon" />
              <input
                type="tel"
                placeholder="+91 98765 00000"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <div className="input-icon-wrap">
              <Mail size={16} className="input-icon" />
              <input
                type="email"
                placeholder="supplier@bullion.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="form-group">
          <label>Trading Address / City</label>
          <div className="input-icon-wrap">
            <MapPin size={16} className="input-icon" />
            <textarea
              rows="2"
              placeholder="Zaveri Bazaar, Mumbai..."
              value={form.address}
              onChange={e => setForm({ ...form, address: e.target.value })}
            />
          </div>
        </div>

        <div className="modal-actions-bar">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="gold" loading={loading} icon={Check}>
            {initialData ? "Update Supplier" : "Register Supplier"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
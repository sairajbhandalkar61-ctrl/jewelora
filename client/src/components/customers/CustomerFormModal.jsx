import React, { useState, useEffect } from "react";
import Modal from "../common/Modal";
import Button from "../common/Button";
import { User, Phone, Mail, MapPin, Check } from "lucide-react";

export default function CustomerFormModal({
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
    if (!form.name.trim()) return alert("Customer name is required");
    onSubmit(form);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Edit Customer Record" : "Add New Customer"}
      subtitle="Maintain verified patron contact and profile details"
      maxWidth="520px"
    >
      <form onSubmit={handleSubmit} className="standard-form">
        <div className="form-group">
          <label>Full Name *</label>
          <div className="input-icon-wrap">
            <User size={16} className="input-icon" />
            <input
              type="text"
              required
              placeholder="e.g. Vikram Malhotra"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
            />
          </div>
        </div>

        <div className="form-row-2">
          <div className="form-group">
            <label>Phone Number</label>
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
                placeholder="customer@domain.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="form-group">
          <label>Residential / Billing Address</label>
          <div className="input-icon-wrap">
            <MapPin size={16} className="input-icon" />
            <textarea
              rows="2"
              placeholder="City, State, Pin Code..."
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
            {initialData ? "Update Customer" : "Add Customer"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
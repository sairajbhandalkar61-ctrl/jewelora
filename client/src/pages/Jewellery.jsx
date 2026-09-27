import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { api } from "../api";
import {
  Gem,
  Plus,
  LayoutGrid,
  List,
  Search,
  Filter,
  Download,
  Trash2,
  RefreshCw
} from "lucide-react";
import JewelleryCard from "../components/jewellery/JewelleryCard";
import JewelleryTable from "../components/jewellery/JewelleryTable";
import JewelleryFormModal from "../components/jewellery/JewelleryFormModal";
import JewelleryDetailModal from "../components/jewellery/JewelleryDetailModal";
import ConfirmDialog from "../components/common/ConfirmDialog";
import EmptyState from "../components/common/EmptyState";
import Button from "../components/common/Button";
import { TableSkeleton, CardSkeleton } from "../components/common/LoadingSkeleton";
import { useToast } from "../context/ToastContext";
import { exportToCSV } from "../utils/exportCsv";

export default function Jewellery() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "table"
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedMaterial, setSelectedMaterial] = useState("All");
  const [selectedPurity, setSelectedPurity] = useState("All");
  const [stockStatus, setStockStatus] = useState("all"); // "all" | "in_stock" | "low_stock" | "out_of_stock"
  const [sortBy, setSortBy] = useState("newest"); // "newest", "price_asc", "price_desc", "weight_desc"

  // Modals state
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [detailItemId, setDetailItemId] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();

  const loadJewellery = () => {
    setLoading(true);
    api.get("/jewellery")
      .then(res => {
        setItems(res || []);
        setLoading(false);
      })
      .catch(err => {
        toast.error("Failed to load inventory", err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadJewellery();
  }, []);

  // Handle URL query parameters (e.g. ?id=5 or ?status=low_stock)
  useEffect(() => {
    const idParam = searchParams.get("id");
    const statusParam = searchParams.get("status");
    if (idParam) {
      setDetailItemId(idParam);
    }
    if (statusParam) {
      setStockStatus(statusParam);
    }
  }, [searchParams]);

  // Handle Save (Create / Update)
  const handleSave = async (formData) => {
    setActionLoading(true);
    try {
      if (editItem) {
        await api.put(`/jewellery/${editItem.id}`, formData);
        toast.success("Jewellery Updated", `"${formData.name}" has been updated.`);
      } else {
        await api.post("/jewellery", formData);
        toast.success("Jewellery Added", `"${formData.name}" added to vault.`);
      }
      setFormOpen(false);
      setEditItem(null);
      loadJewellery();
    } catch (e) {
      toast.error("Operation Failed", e.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Delete
  const handleConfirmDelete = async () => {
    if (!deleteItem) return;
    setActionLoading(true);
    try {
      await api.del(`/jewellery/${deleteItem.id}`);
      toast.success("Jewellery Deleted", `"${deleteItem.name}" was removed from the inventory.`);
      setDeleteItem(null);
      loadJewellery();
    } catch (e) {
      toast.error("Deletion Failed", e.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Filter & Sort logic
  const categories = ["All", "Ring", "Necklace", "Earrings", "Bangles", "Chain", "Pendant", "Bracelet"];
  const materials = ["All", "Gold", "Gold + Diamond", "Diamond", "Platinum", "Silver"];
  const purities = ["All", "24K", "22K", "18K", "14K", "925"];

  const filteredItems = items
    .filter(item => {
      const matchCat = selectedCategory === "All" || item.category === selectedCategory;
      const matchMat = selectedMaterial === "All" || item.material === selectedMaterial;
      const matchPur = selectedPurity === "All" || item.purity === selectedPurity;
      
      let matchStock = true;
      if (stockStatus === "in_stock") matchStock = item.quantity > 2;
      else if (stockStatus === "low_stock") matchStock = item.quantity > 0 && item.quantity <= 2;
      else if (stockStatus === "out_of_stock") matchStock = item.quantity === 0;

      const q = search.trim().toLowerCase();
      const matchSearch = !q ||
        (item.name || "").toLowerCase().includes(q) ||
        (item.sku || "").toLowerCase().includes(q) ||
        (item.category || "").toLowerCase().includes(q);

      return matchCat && matchMat && matchPur && matchStock && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === "price_asc") return Number(a.selling_price) - Number(b.selling_price);
      if (sortBy === "price_desc") return Number(b.selling_price) - Number(a.selling_price);
      if (sortBy === "weight_desc") return Number(b.weight) - Number(a.weight);
      return b.id - a.id; // newest
    });

  const handleExportCSV = () => {
    exportToCSV("Jewelora_Inventory", [
      { label: "SKU", key: "sku" },
      { label: "Name", key: "name" },
      { label: "Category", key: "category" },
      { label: "Material", key: "material" },
      { label: "Purity", key: "purity" },
      { label: "Weight (g)", key: "weight" },
      { label: "Cost Price (INR)", key: "purchase_price" },
      { label: "Selling Price (INR)", key: "selling_price" },
      { label: "Quantity", key: "quantity" }
    ], filteredItems);
    toast.info("CSV Exported", "Jewellery inventory spreadsheet downloaded.");
  };

  return (
    <div className="jewellery-page">
      {/* Top Banner */}
      <div className="module-header-banner">
        <div>
          <span className="panel-lead-tag">
            <Gem size={13} /> Vault Collection
          </span>
          <h1 className="module-title">Jewellery Inventory</h1>
          <p className="module-subtitle">
            Manage your certified precious metals, hallmarked jewellery pieces, and showroom stock.
          </p>
        </div>

        <div className="module-header-actions">
          <Button
            variant="secondary"
            icon={Download}
            onClick={handleExportCSV}
          >
            Export CSV
          </Button>
          <Button
            variant="gold"
            icon={Plus}
            onClick={() => { setEditItem(null); setFormOpen(true); }}
          >
            Add Jewellery Piece
          </Button>
        </div>
      </div>

      {/* Filter and View Controls Bar */}
      <div className="filter-controls-card">
        <div className="search-and-view-row">
          <div className="inventory-search-wrap">
            <Search size={17} className="search-icon" />
            <input
              type="text"
              placeholder="Search by name, SKU, or purity..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="inventory-search-input"
            />
          </div>

          <div className="view-mode-toggle">
            <button
              className={`view-btn ${viewMode === "grid" ? "active" : ""}`}
              onClick={() => setViewMode("grid")}
              title="Show Grid Cards"
              aria-label="Grid view"
            >
              <LayoutGrid size={16} /> Grid
            </button>
            <button
              className={`view-btn ${viewMode === "table" ? "active" : ""}`}
              onClick={() => setViewMode("table")}
              title="Show Tabular List"
              aria-label="Table view"
            >
              <List size={16} /> Table
            </button>
          </div>
        </div>

        {/* Category Chips Bar */}
        <div className="category-scroll-chips">
          {categories.map(cat => (
            <button
              key={cat}
              className={`cat-chip ${selectedCategory === cat ? "active" : ""}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Multi-facet dropdown filters */}
        <div className="dropdown-filters-row">
          <div className="filter-select-group">
            <label>Material:</label>
            <select
              value={selectedMaterial}
              onChange={e => setSelectedMaterial(e.target.value)}
            >
              {materials.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div className="filter-select-group">
            <label>Purity:</label>
            <select
              value={selectedPurity}
              onChange={e => setSelectedPurity(e.target.value)}
            >
              {purities.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div className="filter-select-group">
            <label>Stock Status:</label>
            <select
              value={stockStatus}
              onChange={e => setStockStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="in_stock">In Stock (&gt; 2)</option>
              <option value="low_stock">Low Stock (1–2)</option>
              <option value="out_of_stock">Out of Stock (0)</option>
            </select>
          </div>

          <div className="filter-select-group">
            <label>Sort By:</label>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
            >
              <option value="newest">Recently Added</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="weight_desc">Weight: High to Low</option>
            </select>
          </div>

          <div className="results-count-pill">
            <span><b>{filteredItems.length}</b> pieces found</span>
          </div>
        </div>
      </div>

      {/* Main Content Area: Grid or Table */}
      {loading ? (
        viewMode === "grid" ? <CardSkeleton count={8} /> : <TableSkeleton rows={8} cols={8} />
      ) : filteredItems.length === 0 ? (
        <EmptyState
          icon={Gem}
          title="No jewellery items found"
          description="Adjust your search filters or add a new jewellery piece to the vault."
          actionText="Add Jewellery Piece"
          actionIcon={Plus}
          onAction={() => { setEditItem(null); setFormOpen(true); }}
        />
      ) : viewMode === "grid" ? (
        <div className="jewellery-grid-view">
          {filteredItems.map(item => (
            <JewelleryCard
              key={item.id}
              item={item}
              onView={(it) => setDetailItemId(it.id)}
              onEdit={(it) => { setEditItem(it); setFormOpen(true); }}
              onDelete={(it) => setDeleteItem(it)}
              onQuickSell={(it) => navigate("/sales")}
            />
          ))}
        </div>
      ) : (
        <JewelleryTable
          items={filteredItems}
          onView={(it) => setDetailItemId(it.id)}
          onEdit={(it) => { setEditItem(it); setFormOpen(true); }}
          onDelete={(it) => setDeleteItem(it)}
        />
      )}

      {/* Add / Edit Form Modal with Live Price Calculation */}
      <JewelleryFormModal
        isOpen={formOpen}
        onClose={() => { setFormOpen(false); setEditItem(null); }}
        onSubmit={handleSave}
        initialData={editItem}
        loading={actionLoading}
      />

      {/* Spec Details & Transaction Log Modal */}
      <JewelleryDetailModal
        isOpen={detailItemId !== null}
        onClose={() => setDetailItemId(null)}
        itemId={detailItemId}
        onEdit={(it) => { setEditItem(it); setFormOpen(true); }}
        onSell={(it) => navigate("/sales")}
        onRestock={(it) => navigate("/purchases")}
      />

      {/* Safe Deletion Confirmation Modal */}
      <ConfirmDialog
        isOpen={deleteItem !== null}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Jewellery Piece?"
        message={deleteItem ? `Are you sure you want to permanently delete "${deleteItem.name}" (${deleteItem.sku || `JWL-${deleteItem.id}`})? This action cannot be undone.` : ""}
        confirmText="Delete Piece"
        confirmVariant="danger"
        loading={actionLoading}
      />
    </div>
  );
}
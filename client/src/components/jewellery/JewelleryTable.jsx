import React, { useState } from "react";
import Badge from "../common/Badge";
import { Gem, Eye, Edit3, Trash2, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { formatINR } from "../../utils/currency";

export default function JewelleryTable({ items = [], onView, onEdit, onDelete }) {
  const [sortField, setSortField] = useState("id");
  const [sortDir, setSortDir] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const handleSort = (field) => {
    if (sortField === field) setSortDir(prev => (prev === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir("asc"); }
  };

  const sortedItems = [...items].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];
    if (["selling_price", "purchase_price", "weight", "quantity"].includes(sortField)) {
      aVal = Number(aVal) || 0;
      bVal = Number(bVal) || 0;
    } else {
      aVal = (aVal || "").toString().toLowerCase();
      bVal = (bVal || "").toString().toLowerCase();
    }
    if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
    if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sortedItems.length / itemsPerPage) || 1;
  const paginatedItems = sortedItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="table-module-wrapper">
      <div className="table-wrap">
        <table className="luxury-table">
          <thead>
            <tr>
              <th onClick={() => handleSort("sku")} className="sortable-th">SKU <ArrowUpDown size={12} /></th>
              <th onClick={() => handleSort("name")} className="sortable-th">Product Details <ArrowUpDown size={12} /></th>
              <th onClick={() => handleSort("category")} className="sortable-th">Category <ArrowUpDown size={12} /></th>
              <th>Material & Purity</th>
              <th onClick={() => handleSort("weight")} className="sortable-th">Weight <ArrowUpDown size={12} /></th>
              <th onClick={() => handleSort("purchase_price")} className="sortable-th">Cost Price <ArrowUpDown size={12} /></th>
              <th onClick={() => handleSort("selling_price")} className="sortable-th">Retail Price <ArrowUpDown size={12} /></th>
              <th onClick={() => handleSort("quantity")} className="sortable-th">Stock <ArrowUpDown size={12} /></th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.length === 0 ? (
              <tr><td colSpan="9" className="table-empty-cell">No matching jewellery pieces found.</td></tr>
            ) : (
              paginatedItems.map(item => {
                const isOutOfStock = item.quantity === 0;
                const isLowStock = item.quantity > 0 && item.quantity <= 2;
                return (
                  <tr key={item.id} className="hover-row">
                    <td><span className="table-sku-tag">{item.sku || `JWL-${item.id}`}</span></td>
                    <td>
                      <div className="table-product-cell" onClick={() => onView(item)}>
                        <div className="table-product-thumb">
                          {item.image_url ? <img src={item.image_url} alt={item.name} /> : <Gem size={16} />}
                        </div>
                        <div className="table-product-meta">
                          <strong className="table-product-name">{item.name}</strong>
                          <span className="table-product-sub">{item.material}</span>
                        </div>
                      </div>
                    </td>
                    <td><Badge variant="neutral" size="sm">{item.category}</Badge></td>
                    <td><span className="table-purity-label"><strong>{item.purity || "22K"}</strong></span></td>
                    <td>{Number(item.weight || 0).toFixed(2)} g</td>
                    <td className="text-muted">{formatINR(item.purchase_price)}</td>
                    <td><strong className="text-gold">{formatINR(item.selling_price)}</strong></td>
                    <td>
                      {isOutOfStock ? (
                        <Badge variant="danger" size="sm" dot>0 Out</Badge>
                      ) : isLowStock ? (
                        <Badge variant="warning" size="sm" dot>{item.quantity} Low</Badge>
                      ) : (
                        <Badge variant="success" size="sm" dot>{item.quantity} in stock</Badge>
                      )}
                    </td>
                    <td>
                      <div className="table-actions-cell">
                        <button className="table-action-icon" title="View Spec Details" onClick={() => onView(item)}><Eye size={15} /></button>
                        <button className="table-action-icon" title="Edit Details" onClick={() => onEdit(item)}><Edit3 size={15} /></button>
                        <button className="table-action-icon danger" title="Delete Piece" onClick={() => onDelete(item)}><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="table-pagination-row">
          <span className="pagination-info">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, sortedItems.length)} of {sortedItems.length} items
          </span>
          <div className="pagination-buttons">
            <button className="page-nav-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}>
              <ChevronLeft size={16} /> Prev
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button key={i} className={`page-num-btn ${currentPage === i + 1 ? "active" : ""}`} onClick={() => setCurrentPage(i + 1)}>
                {i + 1}
              </button>
            ))}
            <button className="page-nav-btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}>
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
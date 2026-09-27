import React from "react";
import { useNavigate } from "react-router-dom";
import { Receipt, ShoppingBag, ChevronRight, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import Badge from "../common/Badge";
import { formatINR } from "../../utils/currency";

export default function RecentTransactions({ transactions = [] }) {
  const navigate = useNavigate();

  return (
    <div className="panel recent-transactions-panel">
      <div className="panel-title-row">
        <div>
          <span className="panel-lead-tag">
            <Receipt size={13} /> Activity Feed
          </span>
          <h3 className="panel-main-title">Recent Transactions</h3>
        </div>
        <div className="feed-actions">
          <button className="panel-link-btn" onClick={() => navigate("/sales")}>
            All Sales <ChevronRight size={15} />
          </button>
        </div>
      </div>

      <div className="table-wrap">
        <table className="luxury-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Reference / Invoice</th>
              <th>Customer / Vendor</th>
              <th>Item</th>
              <th>Qty</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td colSpan="8" className="table-empty-cell">
                  No transactions recorded yet.
                </td>
              </tr>
            ) : (
              transactions.map((tx, idx) => {
                const isSale = tx.type === "Sale";
                return (
                  <tr key={`${tx.type}-${tx.id}-${idx}`} className="hover-row">
                    <td>
                      <div className="tx-type-pill">
                        {isSale ? (
                          <span className="type-icon sale" title="Showroom Sale">
                            <ArrowUpRight size={13} /> Sale
                          </span>
                        ) : (
                          <span className="type-icon purchase" title="Stock Procurement">
                            <ArrowDownLeft size={13} /> Purchase
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="font-mono text-strong">
                        {tx.invoice_no || (isSale ? `INV-${tx.id}` : `PO-${tx.id}`)}
                      </span>
                    </td>
                    <td>
                      <span className="text-party">{tx.party_name || "Walk-in Guest"}</span>
                    </td>
                    <td>
                      <span className="text-item-name">{tx.item_name || "Jewellery Piece"}</span>
                    </td>
                    <td>{tx.quantity || 1}</td>
                    <td>
                      <strong className={`font-medium ${isSale ? "text-success" : "text-slate"}`}>
                        {formatINR(tx.amount)}
                      </strong>
                    </td>
                    <td>
                      <Badge
                        variant={tx.status === "Paid" ? "success" : tx.status === "Pending" ? "warning" : "neutral"}
                        size="sm"
                        dot
                      >
                        {tx.status || "Paid"}
                      </Badge>
                    </td>
                    <td className="text-muted">
                      {new Date(tx.date).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short"
                      })}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

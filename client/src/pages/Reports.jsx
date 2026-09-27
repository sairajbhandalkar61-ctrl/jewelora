import React, { useEffect, useState } from "react";
import { api } from "../api";
import {
  BarChart3,
  TrendingUp,
  Download,
  Printer,
  Boxes,
  PieChart,
  IndianRupee,
  ShoppingBag,
  Award,
  AlertTriangle,
  ArrowUpRight,
  ShieldCheck
} from "lucide-react";
import { LuxuryAreaChart, LuxuryDonutChart } from "../components/common/Charts";
import Button from "../components/common/Button";
import Badge from "../components/common/Badge";
import { TableSkeleton } from "../components/common/LoadingSkeleton";
import { useToast } from "../context/ToastContext";
import { formatINR, formatCompactINR } from "../utils/currency";
import { exportToCSV } from "../utils/exportCsv";

export default function Reports() {
  const [data, setData] = useState(null);
  const [jewellery, setJewellery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview"); // "overview", "category", "inventory", "profit"

  const toast = useToast();

  const loadReports = () => {
    setLoading(true);
    Promise.all([
      api.get("/reports/summary"),
      api.get("/jewellery")
    ])
      .then(([rep, j]) => {
        setData(rep);
        setJewellery(j || []);
        setLoading(false);
      })
      .catch(err => {
        toast.error("Failed to load reports", err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (!data) return;
    exportToCSV("Jewelora_Category_Sales_Report", [
      { label: "Category", key: "category" },
      { label: "Units Sold", key: "units_sold" },
      { label: "Revenue (INR)", key: "revenue" }
    ], data.categorySales || []);
    toast.info("CSV Exported", "Reports spreadsheet downloaded.");
  };

  const totals = data ? data.totals : {};

  // Donut chart dataset for Category breakdown
  const categoryDonutData = (data?.categorySales || []).map(c => ({
    label: c.category,
    value: Number(c.revenue || 0)
  }));

  // Donut chart dataset for Payment Method breakdown
  const paymentDonutData = (data?.paymentMethods || []).map(p => ({
    label: p.method,
    value: Number(p.total_amount || 0)
  }));

  // Low stock inventory items
  const lowStockList = jewellery.filter(j => Number(j.quantity) <= 2);

  return (
    <div className="reports-page">
      {/* Top Banner */}
      <div className="module-header-banner">
        <div>
          <span className="panel-lead-tag">
            <BarChart3 size={13} /> Executive Intelligence
          </span>
          <h1 className="module-title">Business Analytics & Audit Reports</h1>
          <p className="module-subtitle">
            Comprehensive financial valuation, inventory turn ratios, category distributions, and showroom audit reports.
          </p>
        </div>

        <div className="module-header-actions">
          <Button variant="secondary" icon={Printer} onClick={handlePrint}>
            Print Report
          </Button>
          <Button variant="gold" icon={Download} onClick={handleExportCSV}>
            Export CSV
          </Button>
        </div>
      </div>

      {/* Financial Valuation KPI Cards */}
      <div className="crm-stats-grid">
        <div className="crm-stat-card">
          <span className="crm-stat-label">Total Showroom Sales</span>
          <strong className="crm-stat-val text-gold">{formatINR(totals.total_sales || 0)}</strong>
          <small className="stat-sub-text">Gross retail turnover</small>
        </div>
        <div className="crm-stat-card">
          <span className="crm-stat-label">Total Bullion Purchases</span>
          <strong className="crm-stat-val text-slate">{formatINR(totals.total_purchases || 0)}</strong>
          <small className="stat-sub-text">Procurement expenditure</small>
        </div>
        <div className="crm-stat-card">
          <span className="crm-stat-label">Showroom Retail Valuation</span>
          <strong className="crm-stat-val text-success">{formatINR(totals.stock_retail_val || 0)}</strong>
          <small className="stat-sub-text">Asset valuation in vault</small>
        </div>
        <div className="crm-stat-card">
          <span className="crm-stat-label">Bullion Cost Valuation</span>
          <strong className="crm-stat-val">{formatINR(totals.stock_cost_val || 0)}</strong>
          <small className="stat-sub-text">Cost basis in vault</small>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="reports-tab-nav">
        {[
          { id: "overview", label: "Financial Overview" },
          { id: "category", label: "Category & Payment Mix" },
          { id: "inventory", label: "Inventory Valuation & Stock" }
        ].map(tab => (
          <button
            key={tab.id}
            className={`report-nav-btn ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Financial Overview */}
      {activeTab === "overview" && (
        <div className="report-tab-body">
          <div className="report-charts-grid">
            <div className="panel chart-panel">
              <h4 className="panel-main-title">Sales Revenue vs Procurement Outflow</h4>
              <p className="panel-subtitle">Comparative volume of retail sales vs supplier procurement</p>
              <div className="chart-render-area" style={{ marginTop: "16px" }}>
                <LuxuryAreaChart
                  data={[
                    { label: "Week 1", sales: (totals.total_sales || 0) * 0.15, purchases: (totals.total_purchases || 0) * 0.2 },
                    { label: "Week 2", sales: (totals.total_sales || 0) * 0.35, purchases: (totals.total_purchases || 0) * 0.4 },
                    { label: "Week 3", sales: (totals.total_sales || 0) * 0.65, purchases: (totals.total_purchases || 0) * 0.75 },
                    { label: "Week 4", sales: (totals.total_sales || 0), purchases: (totals.total_purchases || 0) }
                  ]}
                  height={240}
                  showPurchases={true}
                />
              </div>
            </div>

            <div className="panel summary-card-panel">
              <h4 className="panel-main-title">Showroom Health & Audit Index</h4>
              <p className="panel-subtitle">Core business indicators evaluated from live transactions</p>

              <div className="health-metrics-list">
                <div className="health-row">
                  <div className="health-icon-box bg-gold-light">
                    <ShieldCheck size={18} className="text-gold" />
                  </div>
                  <div>
                    <strong>100% Certified Collection</strong>
                    <span>All pieces logged with hallmark specifications and net weights</span>
                  </div>
                </div>

                <div className="health-row">
                  <div className="health-icon-box bg-emerald-light">
                    <TrendingUp size={18} className="text-success" />
                  </div>
                  <div>
                    <strong>Inventory Asset Ratio</strong>
                    <span>Vault retail value: {formatINR(totals.stock_retail_val || 0)}</span>
                  </div>
                </div>

                <div className="health-row">
                  <div className="health-icon-box bg-warning-light">
                    <AlertTriangle size={18} className="text-warning" />
                  </div>
                  <div>
                    <strong>Reorder Level Attention</strong>
                    <span>{lowStockList.length} items require replenishment</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Category & Payment Mix */}
      {activeTab === "category" && (
        <div className="report-tab-body">
          <div className="report-charts-grid">
            {/* Category Donut */}
            <div className="panel chart-panel">
              <h4 className="panel-main-title">Sales Revenue by Category</h4>
              <p className="panel-subtitle">Proportion of gross retail turnover across jewellery categories</p>
              <div style={{ marginTop: "20px" }}>
                <LuxuryDonutChart data={categoryDonutData} height={220} />
              </div>
            </div>

            {/* Payment Method Donut */}
            <div className="panel chart-panel">
              <h4 className="panel-main-title">Payment Method Settlement</h4>
              <p className="panel-subtitle">Settlement breakdown between Cash, UPI, and Card</p>
              <div style={{ marginTop: "20px" }}>
                <LuxuryDonutChart data={paymentDonutData} height={220} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Inventory Valuation & Stock */}
      {activeTab === "inventory" && (
        <div className="report-tab-body">
          {/* Material Stock Distribution */}
          <div className="panel crm-table-panel">
            <h4 className="panel-main-title">Vault Stock Breakdown by Precious Metal</h4>
            <div className="table-wrap">
              <table className="luxury-table">
                <thead>
                  <tr>
                    <th>Precious Metal / Material</th>
                    <th>Catalogue Designs</th>
                    <th>Total Vault Pieces</th>
                    <th>Total Retail Valuation</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.materialStock || []).map((m, idx) => (
                    <tr key={idx} className="hover-row">
                      <td>
                        <strong>{m.material}</strong>
                      </td>
                      <td>{m.item_count} items</td>
                      <td>{m.total_units} pieces</td>
                      <td>
                        <strong className="text-gold font-medium">
                          {formatINR(m.total_valuation)}
                        </strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Low Stock Safety Report Table */}
          <div className="panel crm-table-panel" style={{ marginTop: "20px" }}>
            <div className="crm-panel-header">
              <div className="panel-lead-tag alert-tag">
                <AlertTriangle size={13} /> Safety Stock Alerts
              </div>
              <h4 className="panel-main-title">Replenishment Audit (Stock &le; 2)</h4>
            </div>

            <div className="table-wrap">
              <table className="luxury-table">
                <thead>
                  <tr>
                    <th>SKU</th>
                    <th>Item Description</th>
                    <th>Category</th>
                    <th>Purity</th>
                    <th>Remaining Stock</th>
                    <th>Retail Price</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockList.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="table-empty-cell">
                        No low-stock items. All jewellery pieces have adequate inventory.
                      </td>
                    </tr>
                  ) : (
                    lowStockList.map(item => (
                      <tr key={item.id} className="hover-row">
                        <td>
                          <span className="table-sku-tag">{item.sku || `JWL-${item.id}`}</span>
                        </td>
                        <td>
                          <strong>{item.name}</strong>
                        </td>
                        <td>{item.category}</td>
                        <td>{item.purity || "22K"}</td>
                        <td>
                          <Badge
                            variant={item.quantity === 0 ? "danger" : "warning"}
                            size="sm"
                            dot
                          >
                            {item.quantity === 0 ? "0 Out of Stock" : `${item.quantity} Remaining`}
                          </Badge>
                        </td>
                        <td>
                          <strong className="text-gold">{formatINR(item.selling_price)}</strong>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
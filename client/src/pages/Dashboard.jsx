import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import {
  Gem,
  Users,
  Truck,
  Boxes,
  IndianRupee,
  ShoppingBag,
  AlertTriangle,
  Receipt,
  Plus,
  ArrowRight,
  Clock,
  Sparkles
} from "lucide-react";
import StatCard from "../components/dashboard/StatCard";
import RevenueChart from "../components/dashboard/RevenueChart";
import InventoryAlerts from "../components/dashboard/InventoryAlerts";
import TopSellingList from "../components/dashboard/TopSellingList";
import RecentTransactions from "../components/dashboard/RecentTransactions";
import Button from "../components/common/Button";
import { CardSkeleton } from "../components/common/LoadingSkeleton";
import { formatINR, formatCompactINR } from "../utils/currency";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());

  const navigate = useNavigate();

  // Live Clock updater
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const loadDashboard = () => {
    setLoading(true);
    setError("");
    api.get("/dashboard")
      .then(res => {
        setData(res);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || "Failed to connect to Jewelora server.");
        setLoading(false);
      });
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  // Time-based greeting
  const hour = currentTime.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const formattedDate = currentTime.toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  const formattedTime = currentTime.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });

  return (
    <div className="dashboard-page">
      {/* Page Header with Live Clock & Quick Actions */}
      <div className="dashboard-header-banner">
        <div className="dash-greeting-col">
          <div className="dash-time-chip">
            <Clock size={13} />
            <span>{formattedDate} • <b>{formattedTime}</b></span>
          </div>
          <h1 className="dash-main-title">{greeting}, Admin</h1>
          <p className="dash-subtitle">
            Here's what's happening with your jewellery showroom command center today.
          </p>
        </div>

        <div className="dash-quick-actions">
          <Button
            variant="gold"
            icon={Receipt}
            onClick={() => navigate("/sales")}
          >
            New Sale / POS
          </Button>
          <Button
            variant="secondary"
            icon={Plus}
            onClick={() => navigate("/jewellery")}
          >
            Add Jewellery
          </Button>
          <Button
            variant="secondary"
            icon={ShoppingBag}
            onClick={() => navigate("/purchases")}
          >
            Record Purchase
          </Button>
        </div>
      </div>

      {/* Error Retry Banner */}
      {error && (
        <div className="dashboard-error-banner">
          <div>
            <strong>Unable to connect to Jewelora server</strong>
            <p>{error}</p>
          </div>
          <Button variant="secondary" size="sm" onClick={loadDashboard}>
            Retry Connection
          </Button>
        </div>
      )}

      {/* 8 Interactive KPI Cards */}
      {loading ? (
        <CardSkeleton count={8} />
      ) : data ? (
        <div className="dashboard-kpi-grid">
          <StatCard
            title="Total Jewellery Items"
            value={data.jewelleryCount || 0}
            sublabel="Catalogued pieces"
            icon={Gem}
            color="#C89A45"
            trend="+4 new"
            trendUp={true}
            sparklineData={[3, 5, 6, 7, 8, 9, data.jewelleryCount || 10]}
            onClick={() => navigate("/jewellery")}
          />
          <StatCard
            title="Total Customers"
            value={data.customerCount || 0}
            sublabel="Verified patrons"
            icon={Users}
            color="#766B5D"
            trend="+12%"
            trendUp={true}
            sparklineData={[1, 2, 2, 3, 3, 4, data.customerCount || 5]}
            onClick={() => navigate("/customers")}
          />
          <StatCard
            title="Total Suppliers"
            value={data.supplierCount || 0}
            sublabel="Bullion partners"
            icon={Truck}
            color="#5A5248"
            sparklineData={[1, 1, 2, 2, 2, 2, data.supplierCount || 2]}
            onClick={() => navigate("/suppliers")}
          />
          <StatCard
            title="Current Stock Units"
            value={data.stock || 0}
            sublabel="Vault inventory count"
            icon={Boxes}
            color="#9F7025"
            trend="-3 today"
            trendUp={false}
            sparklineData={[50, 48, 47, 45, 44, 43, data.stock || 43]}
            onClick={() => navigate("/jewellery")}
          />
          <StatCard
            title="Today's Sales"
            value={formatCompactINR(data.todaySales || data.sales || 0)}
            sublabel={`${formatINR(data.todaySales || data.sales || 0)} gross`}
            icon={IndianRupee}
            color="#3F7D4A"
            trend="+14.2%"
            trendUp={true}
            sparklineData={[10, 25, 40, 30, 60, 80, 97]}
            onClick={() => navigate("/sales")}
          />
          <StatCard
            title="Today's Purchases"
            value={formatCompactINR(data.todayPurchases || data.purchases || 0)}
            sublabel="Procurement outflow"
            icon={ShoppingBag}
            color="#766B5D"
            sparklineData={[40, 60, 50, 80, 90, 110, 150]}
            onClick={() => navigate("/purchases")}
          />
          <StatCard
            title="Low Stock Items"
            value={data.lowStockCount || 0}
            sublabel="Safety stock <= 2 units"
            icon={AlertTriangle}
            color="#B8832E"
            badgeText={data.lowStockCount > 0 ? "Requires Restock" : "Optimal"}
            sparklineData={[1, 2, 1, 3, 2, 2, data.lowStockCount || 2]}
            onClick={() => navigate("/jewellery?status=low_stock")}
          />
          <StatCard
            title="Total Vault Valuation"
            value={formatCompactINR(data.retailValuation || 0)}
            sublabel={`Cost: ${formatCompactINR(data.costValuation || 0)}`}
            icon={Gem}
            color="#C89A45"
            trend="+8.5%"
            trendUp={true}
            sparklineData={[30, 35, 40, 42, 45, 48, 50]}
            onClick={() => navigate("/reports")}
          />
        </div>
      ) : null}

      {/* Main Analytics & Intelligence Section */}
      <div className="dashboard-charts-layout">
        {/* Left: Revenue Dynamics Area Chart */}
        <div className="charts-main-column">
          <RevenueChart
            salesTimeline={data ? data.salesTimeline : []}
            purchasesTimeline={data ? data.purchasesTimeline : []}
            totalSales={data ? data.sales : 0}
            totalPurchases={data ? data.purchases : 0}
          />
        </div>

        {/* Right: Smart Inventory Alerts Panel */}
        <div className="charts-side-column">
          <InventoryAlerts
            lowStockItems={data ? data.lowStockItems : []}
            outOfStockCount={data ? data.outOfStockCount : 0}
            retailValuation={data ? data.retailValuation : 0}
            smartAlerts={data ? data.smartAlerts : []}
          />
        </div>
      </div>

      {/* Ranked Top Products & Recent Activity */}
      <div className="dashboard-bottom-grid">
        <TopSellingList topSelling={data ? data.topSelling : []} />
        <RecentTransactions transactions={data ? data.recentTransactions : []} />
      </div>
    </div>
  );
}
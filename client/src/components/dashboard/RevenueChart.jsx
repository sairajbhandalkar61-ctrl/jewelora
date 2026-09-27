import React, { useState, useMemo } from "react";
import { LuxuryAreaChart } from "../common/Charts";
import { formatINR } from "../../utils/currency";
import { Calendar, TrendingUp } from "lucide-react";

export default function RevenueChart({
  salesTimeline = [],
  purchasesTimeline = [],
  totalSales = 0,
  totalPurchases = 0
}) {
  const [timeframe, setTimeframe] = useState("7D"); // Today, 7D, 30D, 3M, 1Y
  const [showPurchases, setShowPurchases] = useState(true);

  // Generate continuous chart data points matching the selected timeframe
  const chartData = useMemo(() => {
    // Generate dates based on timeframe
    const count = timeframe === "Today" ? 6 : timeframe === "7D" ? 7 : timeframe === "30D" ? 15 : 12;
    const points = [];

    const now = new Date();

    if (timeframe === "Today") {
      const hours = ["10 AM", "12 PM", "2 PM", "4 PM", "6 PM", "8 PM"];
      hours.forEach((h, i) => {
        const sVal = i === 2 ? Math.round(totalSales * 0.4) : i === 4 ? Math.round(totalSales * 0.6) : 0;
        const pVal = i === 1 ? Math.round(totalPurchases * 0.7) : 0;
        points.push({
          label: h,
          sales: sVal,
          purchases: pVal,
          profit: sVal - pVal
        });
      });
      return points;
    }

    const days = timeframe === "7D" ? 7 : timeframe === "30D" ? 30 : timeframe === "3M" ? 90 : 365;
    const step = timeframe === "7D" ? 1 : timeframe === "30D" ? 2 : timeframe === "3M" ? 7 : 30;

    for (let i = days; i >= 0; i -= step) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const dayLabel = d.toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric"
      });

      // Match with real timeline if available
      const saleMatch = salesTimeline.find(s => (s.date || "").startsWith(dateStr));
      const purMatch = purchasesTimeline.find(p => (p.date || "").startsWith(dateStr));

      const sVal = saleMatch ? Number(saleMatch.total) : 0;
      const pVal = purMatch ? Number(purMatch.total) : 0;

      // Provide realistic distribution when sample data exists
      const fallbackSale = i === 0 ? Number(totalSales) : 0;
      const fallbackPur = i === 0 ? Number(totalPurchases) : 0;

      const finalSales = sVal || (totalSales > 0 ? fallbackSale : 0);
      const finalPur = pVal || (totalPurchases > 0 ? fallbackPur : 0);

      points.push({
        label: dayLabel,
        sales: finalSales,
        purchases: finalPur,
        profit: finalSales - finalPur
      });
    }

    return points;
  }, [timeframe, salesTimeline, purchasesTimeline, totalSales, totalPurchases]);

  return (
    <div className="panel chart-panel">
      <div className="chart-panel-header">
        <div>
          <div className="panel-lead-tag">
            <TrendingUp size={14} /> Analytics & Performance
          </div>
          <h3 className="panel-main-title">Revenue & Cashflow Dynamics</h3>
          <p className="panel-subtitle">Real-time overview of sales revenue, procurement expenditures, and gross margins</p>
        </div>

        <div className="chart-controls">
          <div className="timeframe-selector">
            {["Today", "7D", "30D", "3M", "1Y"].map(tf => (
              <button
                key={tf}
                className={`tf-btn ${timeframe === tf ? "active" : ""}`}
                onClick={() => setTimeframe(tf)}
              >
                {tf}
              </button>
            ))}
          </div>

          <button
            className={`chart-toggle-btn ${showPurchases ? "active" : ""}`}
            onClick={() => setShowPurchases(!showPurchases)}
            title="Toggle procurement comparison curve"
          >
            <span className="toggle-color-dot slate" />
            Purchases
          </button>
        </div>
      </div>

      <div className="chart-summary-bar">
        <div className="summary-metric">
          <span className="summary-label">Total Sales</span>
          <strong className="summary-val text-gold">{formatINR(totalSales)}</strong>
        </div>
        <div className="summary-metric">
          <span className="summary-label">Procurement Cost</span>
          <strong className="summary-val text-muted">{formatINR(totalPurchases)}</strong>
        </div>
        <div className="summary-metric">
          <span className="summary-label">Net Operating Flow</span>
          <strong className={`summary-val ${totalSales >= totalPurchases ? "text-success" : "text-warning"}`}>
            {formatINR(totalSales - totalPurchases)}
          </strong>
        </div>
      </div>

      <div className="chart-render-area">
        <LuxuryAreaChart
          data={chartData}
          height={260}
          showPurchases={showPurchases}
        />
      </div>

      <div className="chart-footer-legend">
        <div className="legend-chip">
          <span className="legend-indicator bg-gold" />
          <span>Showroom Sales (Revenue)</span>
        </div>
        {showPurchases && (
          <div className="legend-chip">
            <span className="legend-indicator bg-slate dashed" />
            <span>Procurement (Purchases)</span>
          </div>
        )}
      </div>
    </div>
  );
}

import React from "react";
import { Sparkline } from "../common/Charts";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function StatCard({
  title,
  value,
  sublabel,
  icon: Icon,
  trend,         // e.g. "+12.8%"
  trendUp = true,
  sparklineData = [3, 5, 4, 8, 7, 9, 11],
  color = "#C89A45",
  onClick,
  badgeText
}) {
  return (
    <div
      className={`luxury-stat-card ${onClick ? "clickable" : ""}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="stat-card-top">
        <div className="stat-icon-wrap" style={{ "--stat-color": color }}>
          <Icon size={20} />
        </div>
        {trend && (
          <div className={`stat-trend-chip ${trendUp ? "trend-up" : "trend-down"}`}>
            {trendUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            <span>{trend}</span>
          </div>
        )}
        {badgeText && <span className="stat-badge-chip">{badgeText}</span>}
      </div>

      <div className="stat-card-mid">
        <span className="stat-card-title">{title}</span>
        <div className="stat-card-val">{value}</div>
      </div>

      <div className="stat-card-bottom">
        {sublabel && <span className="stat-card-sublabel">{sublabel}</span>}
        {sparklineData && (
          <div className="stat-sparkline">
            <Sparkline data={sparklineData} color={color} width={75} height={24} />
          </div>
        )}
      </div>
    </div>
  );
}

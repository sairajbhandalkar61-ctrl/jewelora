import React, { useState } from "react";
import { formatINR } from "../../utils/currency";

/**
 * Interactive SVG Area Chart for Revenue & Cashflow Analytics
 */
export function LuxuryAreaChart({
  data = [],
  height = 260,
  showPurchases = true
}) {
  const [hoverIndex, setHoverIndex] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div className="chart-empty" style={{ height }}>
        <span>No chart data available for this timeframe</span>
      </div>
    );
  }

  const padding = { top: 20, right: 30, bottom: 35, left: 55 };
  const width = 700;
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const maxVal = Math.max(
    ...data.map(d => Math.max(Number(d.sales || 0), Number(d.purchases || 0))),
    10000
  );

  const getX = (index) => {
    if (data.length <= 1) return padding.left + chartWidth / 2;
    return padding.left + (index / (data.length - 1)) * chartWidth;
  };

  const getY = (val) => {
    const ratio = Number(val || 0) / maxVal;
    return padding.top + chartHeight - ratio * chartHeight;
  };

  // Build SVG path string with smooth bezier curve
  const buildSmoothPath = (key) => {
    const points = data.map((d, i) => ({ x: getX(i), y: getY(d[key]) }));
    if (points.length === 0) return "";
    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? 0 : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2] || p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return path;
  };

  const salesLine = buildSmoothPath("sales");
  const salesArea = data.length > 1 
    ? `${salesLine} L ${getX(data.length - 1)} ${padding.top + chartHeight} L ${getX(0)} ${padding.top + chartHeight} Z`
    : "";

  const purchasesLine = showPurchases ? buildSmoothPath("purchases") : "";

  // Generate 4 horizontal gridlines
  const gridTicks = [0, 0.33, 0.66, 1].map(r => ({
    val: Math.round(maxVal * r),
    y: padding.top + chartHeight - r * chartHeight
  }));

  const activeItem = hoverIndex !== null ? data[hoverIndex] : null;

  return (
    <div className="luxury-chart-container" style={{ position: "relative" }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="luxury-svg-chart"
        preserveAspectRatio="none"
        onMouseLeave={() => setHoverIndex(null)}
      >
        <defs>
          <linearGradient id="goldSalesGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#C89A45" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#C89A45" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id="slatePurchaseGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#766B5D" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#766B5D" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Gridlines */}
        {gridTicks.map((tick, i) => (
          <g key={i}>
            <line
              x1={padding.left}
              y1={tick.y}
              x2={width - padding.right}
              y2={tick.y}
              className="chart-gridline"
            />
            <text
              x={padding.left - 10}
              y={tick.y + 4}
              className="chart-axis-text"
              textAnchor="end"
            >
              {tick.val >= 100000 ? `${(tick.val / 100000).toFixed(1)}L` : tick.val >= 1000 ? `${(tick.val / 1000).toFixed(0)}k` : tick.val}
            </text>
          </g>
        ))}

        {/* Sales Area */}
        {salesArea && <path d={salesArea} fill="url(#goldSalesGradient)" />}

        {/* Purchases Line */}
        {showPurchases && purchasesLine && (
          <path
            d={purchasesLine}
            fill="none"
            stroke="#766B5D"
            strokeWidth="2.5"
            strokeDasharray="4 4"
            className="chart-line-purchases"
          />
        )}

        {/* Sales Line */}
        {salesLine && (
          <path
            d={salesLine}
            fill="none"
            stroke="#C89A45"
            strokeWidth="3"
            className="chart-line-sales"
          />
        )}

        {/* X Axis Labels & Interactive Bars */}
        {data.map((d, i) => {
          const x = getX(i);
          return (
            <g key={i}>
              <text
                x={x}
                y={height - 10}
                className={`chart-axis-text ${hoverIndex === i ? "active" : ""}`}
                textAnchor="middle"
              >
                {d.label}
              </text>
              {/* Invisible wide hit target for hover */}
              <rect
                x={x - (chartWidth / data.length) / 2}
                y={padding.top}
                width={chartWidth / data.length}
                height={chartHeight}
                fill="transparent"
                style={{ cursor: "pointer" }}
                onMouseEnter={() => setHoverIndex(i)}
              />
            </g>
          );
        })}

        {/* Hover Indicator Crosshair */}
        {hoverIndex !== null && (
          <g>
            <line
              x1={getX(hoverIndex)}
              y1={padding.top}
              x2={getX(hoverIndex)}
              y2={padding.top + chartHeight}
              stroke="#C89A45"
              strokeWidth="1.5"
              strokeDasharray="3 3"
              className="chart-crosshair"
            />
            <circle
              cx={getX(hoverIndex)}
              cy={getY(data[hoverIndex].sales)}
              r="5.5"
              fill="#C89A45"
              stroke="#FFFFFF"
              strokeWidth="2.5"
            />
            {showPurchases && (
              <circle
                cx={getX(hoverIndex)}
                cy={getY(data[hoverIndex].purchases)}
                r="4.5"
                fill="#766B5D"
                stroke="#FFFFFF"
                strokeWidth="2"
              />
            )}
          </g>
        )}
      </svg>

      {/* Floating Tooltip */}
      {activeItem && (
        <div
          className="chart-tooltip"
          style={{
            position: "absolute",
            left: `${(getX(hoverIndex) / width) * 100}%`,
            top: "10px",
            transform: "translateX(-50%)"
          }}
        >
          <div className="tooltip-date">{activeItem.label}</div>
          <div className="tooltip-row">
            <span className="tooltip-dot gold" />
            <span>Sales:</span>
            <strong>{formatINR(activeItem.sales || 0)}</strong>
          </div>
          {showPurchases && (
            <div className="tooltip-row">
              <span className="tooltip-dot slate" />
              <span>Purchases:</span>
              <strong>{formatINR(activeItem.purchases || 0)}</strong>
            </div>
          )}
          {activeItem.profit !== undefined && (
            <div className="tooltip-row">
              <span className="tooltip-dot emerald" />
              <span>Net:</span>
              <strong className={activeItem.profit >= 0 ? "text-success" : "text-danger"}>
                {formatINR(activeItem.profit || 0)}
              </strong>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Interactive SVG Donut Chart
 */
export function LuxuryDonutChart({ data = [], height = 220 }) {
  const [hoverSegment, setHoverSegment] = useState(null);

  if (!data || !data.length) {
    return <div className="chart-empty" style={{ height }}>No category data</div>;
  }

  const total = data.reduce((sum, d) => sum + Number(d.value || 0), 0);
  const size = height;
  const strokeWidth = 32;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const luxuryPalette = ["#C89A45", "#766B5D", "#9F7025", "#3F7D4A", "#EAD9B8", "#B8832E", "#5A5248"];

  let accumulated = 0;

  return (
    <div className="donut-chart-wrap">
      <div className="donut-svg-holder" style={{ width: size, height: size, position: "relative" }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {data.map((item, index) => {
            const val = Number(item.value || 0);
            const ratio = total > 0 ? val / total : 0;
            const strokeDasharray = `${ratio * circumference} ${circumference}`;
            const strokeDashoffset = -accumulated * circumference;
            accumulated += ratio;
            const color = item.color || luxuryPalette[index % luxuryPalette.length];

            return (
              <circle
                key={index}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke={color}
                strokeWidth={hoverSegment === index ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
                style={{ transition: "stroke-width 0.2s ease, opacity 0.2s ease", cursor: "pointer" }}
                onMouseEnter={() => setHoverSegment(index)}
                onMouseLeave={() => setHoverSegment(null)}
              />
            );
          })}
        </svg>

        {/* Center label */}
        <div className="donut-center-label">
          <span className="donut-center-title">
            {hoverSegment !== null ? data[hoverSegment].label : "Total"}
          </span>
          <strong className="donut-center-val">
            {hoverSegment !== null 
              ? formatINR(data[hoverSegment].value) 
              : formatINR(total)}
          </strong>
        </div>
      </div>

      {/* Legend */}
      <div className="donut-legend">
        {data.map((item, index) => {
          const color = item.color || luxuryPalette[index % luxuryPalette.length];
          const pct = total > 0 ? ((Number(item.value || 0) / total) * 100).toFixed(0) : 0;
          return (
            <div
              key={index}
              className={`donut-legend-item ${hoverSegment === index ? "active" : ""}`}
              onMouseEnter={() => setHoverSegment(index)}
              onMouseLeave={() => setHoverSegment(null)}
            >
              <span className="legend-indicator" style={{ backgroundColor: color }} />
              <span className="legend-label">{item.label}</span>
              <span className="legend-pct">{pct}%</span>
              <strong className="legend-val">{formatINR(item.value)}</strong>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Mini Sparkline for Stat Cards
 */
export function Sparkline({ data = [2, 4, 3, 7, 5, 8, 9], color = "#C89A45", width = 80, height = 30 }) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;

  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * (height - 6) - 3;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg width={width} height={height} className="sparkline-svg">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

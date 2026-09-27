import React from "react";

export function SkeletonBox({ width = "100%", height = "20px", borderRadius = "8px", className = "" }) {
  return (
    <div
      className={`skeleton-pulse ${className}`}
      style={{ width, height, borderRadius }}
    />
  );
}

export function TableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <div className="table-skeleton-wrap">
      <div className="table-skeleton-header">
        {Array.from({ length: cols }).map((_, i) => (
          <SkeletonBox key={i} height="18px" width={`${80 / cols}%`} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="table-skeleton-row">
          {Array.from({ length: cols }).map((_, c) => (
            <SkeletonBox key={c} height="24px" width={c === 0 ? "40%" : "20%"} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton({ count = 4 }) {
  return (
    <div className="card-skeleton-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card-skeleton">
          <SkeletonBox height="180px" borderRadius="12px" />
          <div style={{ marginTop: "12px" }}>
            <SkeletonBox height="20px" width="70%" />
            <div style={{ marginTop: "8px" }}>
              <SkeletonBox height="16px" width="45%" />
            </div>
            <div style={{ marginTop: "12px", display: "flex", justifyContent: "space-between" }}>
              <SkeletonBox height="22px" width="35%" />
              <SkeletonBox height="22px" width="25%" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

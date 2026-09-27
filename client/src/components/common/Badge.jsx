import React from "react";

export default function Badge({
  children,
  variant = "neutral", // gold, success, warning, danger, info, neutral, purple
  size = "md",        // sm, md
  dot = false,
  className = ""
}) {
  return (
    <span className={`badge badge-${variant} badge-${size} ${className}`}>
      {dot && <span className="badge-dot" />}
      {children}
    </span>
  );
}

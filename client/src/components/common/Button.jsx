import React from "react";
import { Loader2 } from "lucide-react";

export default function Button({
  children,
  variant = "primary", // primary, secondary, gold, ghost, danger, outline
  size = "md",        // sm, md, lg
  icon: Icon,
  iconRight: IconRight,
  loading = false,
  disabled = false,
  fullWidth = false,
  className = "",
  type = "button",
  onClick,
  ...props
}) {
  const baseClasses = `btn btn-${variant} btn-${size} ${fullWidth ? "btn-full" : ""} ${className}`;

  return (
    <button
      type={type}
      className={baseClasses}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <Loader2 size={size === "sm" ? 14 : 17} className="btn-spinner" />
      ) : (
        Icon && <Icon size={size === "sm" ? 14 : 17} className="btn-icon-left" />
      )}
      <span>{children}</span>
      {!loading && IconRight && <IconRight size={size === "sm" ? 14 : 17} className="btn-icon-right" />}
    </button>
  );
}

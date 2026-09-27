import React from "react";
import Button from "./Button";
import { Gem } from "lucide-react";

export default function EmptyState({
  icon: Icon = Gem,
  title = "No data found",
  description = "Get started by adding your first record.",
  actionText,
  onAction,
  actionIcon
}) {
  return (
    <div className="empty-state-box">
      <div className="empty-icon-wrap">
        <Icon size={38} className="empty-state-icon" />
      </div>
      <h4 className="empty-title">{title}</h4>
      <p className="empty-description">{description}</p>
      {actionText && onAction && (
        <Button variant="gold" icon={actionIcon} onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
}

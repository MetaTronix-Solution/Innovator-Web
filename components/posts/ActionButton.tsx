"use client";

import { memo } from "react";
import { ReactNode } from "react";

interface ActionButtonProps {
  icon: ReactNode;
  label: ReactNode;
  onClick?: () => void;
  onLabelClick?: () => void; // ← new: separate click for the count/label
  active?: boolean;
}

const ActionButton = memo(
  ({
    icon,
    label,
    onClick,
    onLabelClick,
    active = false,
  }: ActionButtonProps) => (
    <div
      className={`flex items-center rounded-lg transition-all ${
        active ? "text-primary bg-primary/5" : "text-muted-foreground"
      }`}
    >
      <button
        onClick={onClick}
        className={`flex items-center px-2 py-2 rounded-l-lg transition-all hover:bg-accent ${
          active ? "hover:text-primary" : "hover:text-foreground"
        }`}
      >
        {icon}
      </button>

      {/* Label zone — opens modal if onLabelClick provided, else same as icon */}
      <button
        onClick={onLabelClick ?? onClick}
        className={`flex items-center pr-3 py-2 rounded-r-lg text-sm font-semibold transition-all hover:bg-accent ${
          onLabelClick
            ? "hover:underline hover:text-foreground cursor-pointer"
            : "hover:text-foreground"
        }`}
      >
        {label}
      </button>
    </div>
  ),
);

ActionButton.displayName = "ActionButton";
export default ActionButton;

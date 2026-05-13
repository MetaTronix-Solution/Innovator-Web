import { memo } from "react";

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string | number;
  onClick: () => void;
  active?: boolean;
}

const ActionButton = memo(
  ({ icon, label, onClick, active = false }: ActionButtonProps) => (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all hover:bg-accent ${
        active
          ? "text-primary bg-primary/5"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {icon}
      <span className="text-sm font-semibold">{label}</span>
    </button>
  ),
);
ActionButton.displayName = "ActionButton";

export default ActionButton;

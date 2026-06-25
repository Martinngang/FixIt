import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "./button";
import { cn } from "./utils";

export interface EmptyStateAction {
  label: string;
  onClick: () => void;
}

// Single shared "nothing here yet" moment, replacing the icon+h3+p div every
// screen used to hand-roll independently (AdminPanel, TechnicianPanel,
// Inventory, NotificationsPanel, Dashboard, MyIssues, Community all had
// their own near-identical version).
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  size = "md",
  className,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: EmptyStateAction;
  size?: "sm" | "md";
  className?: string;
}) {
  const compact = size === "sm";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "flex flex-col items-center justify-center text-center",
        compact ? "gap-2 py-8 px-4" : "gap-3 py-14 px-6",
        className,
      )}
    >
      <div
        className={cn(
          "flex items-center justify-center rounded-full bg-primary/10 text-primary",
          compact ? "h-10 w-10" : "h-14 w-14",
        )}
      >
        <Icon className={compact ? "h-5 w-5" : "h-7 w-7"} />
      </div>
      <h3 className={cn("font-display font-semibold text-foreground", compact ? "text-sm" : "text-base")}>
        {title}
      </h3>
      {description && (
        <p className={cn("text-muted-foreground max-w-sm", compact ? "text-xs" : "text-sm")}>
          {description}
        </p>
      )}
      {action && (
        <Button size={compact ? "sm" : "default"} onClick={action.onClick} className="mt-1">
          {action.label}
        </Button>
      )}
    </motion.div>
  );
}

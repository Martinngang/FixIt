import type { LucideIcon } from "lucide-react";
import {
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  ShoppingCart,
  Ban,
  AlertTriangle,
  CreditCard,
} from "lucide-react";
import { Badge, type badgeVariants } from "./badge";
import type { VariantProps } from "class-variance-authority";

type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];

interface StatusEntry {
  variant: BadgeVariant;
  icon: LucideIcon;
}

// Each domain gets its own kind/map rather than one merged table - "status"
// (issue lifecycle) and "reorder" (supply-chain lifecycle) both happen to
// use the string "cancelled" for very different severities, so collapsing
// them into one map would silently mis-color one of the two.
const STATUS_CONFIG: Record<string, StatusEntry> = {
  reported: { variant: "warning", icon: AlertCircle },
  "in-progress": { variant: "info", icon: Clock },
  assigned: { variant: "info", icon: Clock },
  resolved: { variant: "success", icon: CheckCircle },
  rejected: { variant: "destructive", icon: XCircle },
};

const REORDER_CONFIG: Record<string, StatusEntry> = {
  pending: { variant: "warning", icon: Clock },
  ordered: { variant: "info", icon: ShoppingCart },
  received: { variant: "success", icon: CheckCircle },
  cancelled: { variant: "secondary", icon: Ban },
};

const TASK_EVENT_CONFIG: Record<string, StatusEntry> = {
  open: { variant: "info", icon: Clock },
  upcoming: { variant: "info", icon: Clock },
  completed: { variant: "success", icon: CheckCircle },
  cancelled: { variant: "destructive", icon: XCircle },
};

const PRIORITY_CONFIG: Record<string, StatusEntry> = {
  high: { variant: "destructive", icon: AlertTriangle },
  medium: { variant: "warning", icon: AlertCircle },
  low: { variant: "success", icon: CheckCircle },
};

const STOCK_CONFIG: Record<string, StatusEntry> = {
  low: { variant: "destructive", icon: AlertTriangle },
  ok: { variant: "success", icon: CheckCircle },
};

const MARKETPLACE_CONFIG: Record<string, StatusEntry> = {
  open: { variant: "info", icon: Clock },
  claimed: { variant: "info", icon: Clock },
  completed: { variant: "warning", icon: CheckCircle },
  paid: { variant: "success", icon: CreditCard },
};

const CONFIG_BY_KIND = {
  status: STATUS_CONFIG,
  reorder: REORDER_CONFIG,
  taskEvent: TASK_EVENT_CONFIG,
  priority: PRIORITY_CONFIG,
  stock: STOCK_CONFIG,
  marketplace: MARKETPLACE_CONFIG,
};

export type StatusBadgeKind = keyof typeof CONFIG_BY_KIND;

// Single source of truth for status/priority/stock badges, replacing the
// getStatusVariant()/getPriorityVariant()/getStatusIcon() trio that used to
// be hand-duplicated (with inconsistent text-transform conventions) in
// AdminPanel, TechnicianPanel, Dashboard, MyIssues, Community,
// MarketplacePanel and Inventory. `label` lets each screen keep sourcing its
// own translated string (t.xxx) while this component owns variant + icon.
export function StatusBadge({
  kind,
  value,
  label,
  size,
  className,
}: {
  kind: StatusBadgeKind;
  value: string;
  label?: string;
  size?: "sm" | "default" | "lg";
  className?: string;
}) {
  const config = CONFIG_BY_KIND[kind][value] ?? { variant: "secondary" as BadgeVariant, icon: AlertCircle };
  const Icon = config.icon;
  const text = label ?? value.replace(/-/g, " ");

  return (
    <Badge variant={config.variant} size={size} className={className}>
      <Icon className="h-3 w-3" />
      <span className="capitalize">{text}</span>
    </Badge>
  );
}

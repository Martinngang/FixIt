import { ShieldCheck, ShieldAlert, ShieldX } from "lucide-react";
import { Badge } from "./badge";

export interface CredibilitySignals {
  hasPhoto: boolean;
  hasCoordinates: boolean;
  descriptionLength: number;
  corroboratingReports: number;
  upvotes: number;
  reporterRejectionRate: number | null;
}

const LEVEL_CONFIG = {
  high: { variant: "success" as const, icon: ShieldCheck, label: "Credible" },
  medium: { variant: "warning" as const, icon: ShieldAlert, label: "Unverified" },
  low: { variant: "destructive" as const, icon: ShieldX, label: "Low credibility" },
};

function describeSignals(signals?: CredibilitySignals) {
  if (!signals) return undefined;
  const parts: string[] = [];
  parts.push(signals.hasPhoto ? "Has photo" : "No photo");
  parts.push(signals.hasCoordinates ? "Has GPS location" : "No GPS location");
  parts.push(
    signals.descriptionLength >= 40
      ? "Detailed description"
      : signals.descriptionLength < 15
      ? "Very short description"
      : "Description"
  );
  if (signals.corroboratingReports > 0) {
    parts.push(`Corroborated by ${signals.corroboratingReports} other report(s) nearby`);
  }
  if (signals.upvotes > 0) {
    parts.push(`${signals.upvotes} upvote(s)`);
  }
  if (signals.reporterRejectionRate !== null) {
    parts.push(`Reporter rejection rate: ${Math.round(signals.reporterRejectionRate * 100)}%`);
  }
  return parts.join(" • ");
}

// Staff-facing indicator of how trustworthy a report looks, derived from
// objective signals (evidence completeness, corroboration, reporter track
// record) - see credibilityModel.ts on the backend. Citizens never see this;
// it's only for admin/technician triage.
export function CredibilityBadge({
  level,
  score,
  signals,
}: {
  level: "high" | "medium" | "low";
  score?: number;
  signals?: CredibilitySignals;
}) {
  const config = LEVEL_CONFIG[level];
  const Icon = config.icon;
  const title = [describeSignals(signals), score !== undefined ? `Score: ${score}/100` : null]
    .filter(Boolean)
    .join(" — ");

  return (
    <Badge variant={config.variant} title={title || undefined}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}

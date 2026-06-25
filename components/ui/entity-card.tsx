import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "./card";
import { Button } from "./button";
import { Badge } from "./badge";
import { cn } from "./utils";

export interface EntityCardMetadataItem {
  icon: LucideIcon;
  label: ReactNode;
}

export interface EntityCardNote {
  icon: LucideIcon;
  label: string;
  content: ReactNode;
}

export interface EntityCardAction {
  icon?: LucideIcon;
  label: string;
  onClick: () => void;
  variant?: "default" | "outline" | "destructive" | "secondary" | "ghost";
  disabled?: boolean;
}

const MAX_VISIBLE_BADGES = 4;

// Composable "entity with status, metadata, and actions" card - the one
// shape that AdminPanel's issue cards, TechnicianPanel's assignment cards,
// Inventory's item cards, and the citizen-side issue cards in Dashboard /
// MyIssues / Community were each independently hand-building. Centralizing
// it here is what actually fixes AdminPanel's badge-overflow problem (the
// `badges` prop caps visible badges instead of letting them wrap forever)
// and gives every screen the same density/photo/notes/actions layout.
export function EntityCard({
  title,
  subtitle,
  badges = [],
  metadata = [],
  photoUrl,
  notes = [],
  actions = [],
  density = "comfortable",
  className,
  children,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  badges?: ReactNode[];
  metadata?: EntityCardMetadataItem[];
  photoUrl?: string | null;
  notes?: EntityCardNote[];
  actions?: EntityCardAction[];
  density?: "comfortable" | "compact";
  className?: string;
  children?: ReactNode;
}) {
  const compact = density === "compact";
  const visibleBadges = badges.slice(0, MAX_VISIBLE_BADGES);
  const overflowCount = badges.length - visibleBadges.length;

  return (
    <Card className={cn("transition-shadow duration-300 hover:shadow-md", className)}>
      <CardContent className={compact ? "p-4" : "p-6"}>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <h3 className={cn("font-display font-semibold text-foreground", compact ? "text-sm" : "text-base")}>
                {title}
              </h3>
              {visibleBadges}
              {overflowCount > 0 && (
                <Badge variant="outline" size="sm" title={`${overflowCount} more`}>
                  +{overflowCount}
                </Badge>
              )}
            </div>

            {subtitle && (
              <p className={cn("text-muted-foreground mb-2", compact ? "text-xs" : "text-sm")}>{subtitle}</p>
            )}

            {metadata.length > 0 && (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mb-2">
                {metadata.map((item, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <item.icon className="h-3.5 w-3.5" />
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            )}

            {photoUrl && (
              <img
                src={photoUrl}
                alt=""
                className="w-full max-w-sm h-32 object-cover rounded-xl mb-3 border border-border"
              />
            )}

            {children}

            {notes.map((note, i) => (
              <div key={i} className="mt-3 rounded-xl border border-border/50 bg-muted/30 p-3 space-y-2">
                <div className="flex items-center gap-1.5">
                  <note.icon className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">{note.label}</span>
                </div>
                <div className="text-sm text-muted-foreground">{note.content}</div>
              </div>
            ))}
          </div>

          {actions.length > 0 && (
            <div className="flex flex-row flex-wrap sm:flex-col items-stretch gap-2 sm:shrink-0">
              {actions.map((action, i) => (
                <Button key={i} size="sm" variant={action.variant ?? "outline"} onClick={action.onClick} disabled={action.disabled}>
                  {action.icon && <action.icon className="h-4 w-4" />}
                  <span>{action.label}</span>
                </Button>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

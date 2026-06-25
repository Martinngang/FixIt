import * as React from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "./utils";

export interface InputProps extends React.ComponentProps<"input"> {
  icon?: LucideIcon;
  error?: string;
}

function Input({ className, type, icon: Icon, error, ...props }: InputProps) {
  const input = (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-xl border px-3 py-1 text-base bg-input-background transition-all duration-200 outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-primary/50 focus-visible:ring-ring/20 focus-visible:ring-[3px] focus-visible:shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)]",
        "hover:border-border/80",
        Icon && "pl-9",
        error ? "border-destructive/60 focus-visible:border-destructive focus-visible:ring-destructive/20" : undefined,
        className,
      )}
      aria-invalid={!!error || props["aria-invalid"]}
      {...props}
    />
  );

  if (!Icon && !error) return input;

  return (
    <div className="w-full">
      <div className="relative">
        {Icon && (
          <Icon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        )}
        {input}
      </div>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}

export { Input };

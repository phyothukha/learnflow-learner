import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface PageHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  badge?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  badge,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        // Actions sit beside the title when they fit and wrap below it when they don't.
        "flex shrink-0 flex-wrap items-center justify-between gap-x-4 gap-y-3 sm:items-end",
        className,
      )}
    >
      <div className="min-w-0 flex-1 basis-44 space-y-1">
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="min-w-0 truncate text-lg font-semibold tracking-tight sm:text-xl">
            {title}
          </h1>
          {badge}
        </div>
        {description && (
          <p className="hidden text-sm text-muted-foreground sm:block">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex max-w-full flex-wrap items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}

"use client";

import { cn } from "@/lib/utils";
import type { Goal } from "../interface";
import { goalProgress } from "../utils";

export interface GoalSwitcherProps {
  goals: Goal[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function GoalSwitcher({
  goals,
  selectedId,
  onSelect,
}: GoalSwitcherProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {goals.map((goal) => {
        const { percent } = goalProgress(goal);
        const selected = goal.Id === selectedId;
        return (
          <button
            key={goal.Id}
            type="button"
            aria-pressed={selected}
            onClick={() => onSelect(goal.Id)}
            className={cn(
              "min-w-0 space-y-3 rounded-2xl border bg-card p-4 text-left shadow-xs transition-colors hover:bg-muted/40",
              selected && "border-primary ring-2 ring-primary/30",
            )}
          >
            <span className="flex items-center gap-2 text-sm font-medium">
              <span
                className="size-2 shrink-0 rounded-full"
                style={{ backgroundColor: goal.Color }}
              />
              <span className="truncate">{goal.Name}</span>
            </span>
            <span className="block h-1.5 overflow-hidden rounded-full bg-muted">
              <span
                className="block h-full rounded-full"
                style={{ width: `${percent}%`, backgroundColor: goal.Color }}
              />
            </span>
            <span className="block text-xs text-muted-foreground">
              1 {goal.Plan} plan · {percent}%
            </span>
          </button>
        );
      })}
    </div>
  );
}

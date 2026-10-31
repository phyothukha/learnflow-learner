"use client";

import Link from "next/link";
import dayjs from "dayjs";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { MilestoneState, type Goal } from "../interface";
import { goalProgress, milestoneState } from "../utils";

export function GoalCard({ goal }: { goal: Goal }) {
  const { done, total, percent } = goalProgress(goal);
  const current = goal.Milestones.find(
    (milestone) =>
      milestoneState(goal, milestone) === MilestoneState.InProgress,
  );

  return (
    <Link
      href={`/goals/${goal.Id}`}
      prefetch
      className="group flex min-w-0 flex-col gap-3 rounded-2xl border bg-card p-4 shadow-xs transition-colors hover:bg-muted/40"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="flex min-w-0 items-center gap-2 text-sm font-medium">
          <span
            className="size-2 shrink-0 rounded-full"
            style={{ backgroundColor: goal.Color }}
          />
          <span className="truncate">{goal.Name}</span>
        </span>
        <Badge variant="secondary" className="font-normal">
          1 {goal.Plan}
        </Badge>
      </div>
      <p className="line-clamp-2 min-h-10 text-sm text-muted-foreground">
        {goal.Description}
      </p>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {done}/{total} tasks
          </span>
          <span className="text-sm font-semibold text-foreground tabular-nums">
            {percent}%
          </span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full"
            style={{ width: `${percent}%`, backgroundColor: goal.Color }}
          />
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span className="truncate">
          {current ? `Now: ${current.Title}` : "No active milestone"} · due{" "}
          {dayjs(goal.EndAt).format("MMM D")}
        </span>
        <ArrowRight className="size-3.5 shrink-0 transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}

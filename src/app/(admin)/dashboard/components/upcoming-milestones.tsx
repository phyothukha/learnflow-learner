"use client";

import Link from "next/link";
import dayjs from "dayjs";
import { ArrowRight, Flag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { DashboardMilestone } from "../data/fake-goals";

function milestoneBadge(milestone: DashboardMilestone) {
  const today = dayjs().startOf("day");
  if (dayjs(milestone.StartAt).isAfter(today)) {
    return {
      label: `Starts ${dayjs(milestone.StartAt).format("MMM D")}`,
      variant: "secondary" as const,
    };
  }
  const left = dayjs(milestone.EndAt).diff(today, "day");
  return {
    label:
      left <= 0 ? "Due today" : `${left} ${left === 1 ? "day" : "days"} left`,
    variant: "status-blue" as const,
  };
}

export function UpcomingMilestones({
  milestones,
}: {
  milestones: DashboardMilestone[];
}) {
  return (
    <div className="border-t pt-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-medium">Upcoming milestones</h3>
        <Link
          href="/goals"
          prefetch
          className="inline-flex h-7 items-center gap-1 rounded-md px-2 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
        >
          All goals
          <ArrowRight className="size-3" />
        </Link>
      </div>
      <ul className="space-y-3">
        {milestones.map((milestone) => {
          const badge = milestoneBadge(milestone);
          return (
            <li key={milestone.Id} className="flex items-center gap-3">
              <span
                className="flex size-9 shrink-0 items-center justify-center rounded-lg"
                style={{
                  backgroundColor: `${milestone.Color}1f`,
                  color: milestone.Color,
                }}
              >
                <Flag className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {milestone.Title}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {milestone.GoalName} ·{" "}
                  {dayjs(milestone.StartAt).format("MMM D")} –{" "}
                  {dayjs(milestone.EndAt).format("MMM D")}
                </p>
              </div>
              <Badge variant={badge.variant} className="shrink-0 font-normal">
                {badge.label}
              </Badge>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

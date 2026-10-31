"use client";

import Link from "next/link";
import dayjs from "dayjs";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { DashboardGoal } from "../data/fake-goals";
import { WidgetHeader } from "./widget-header";

export function GoalProgressCard({ goals }: { goals: DashboardGoal[] }) {
  return (
    <Card className="shadow-xs">
      <WidgetHeader title="Goal progress" href="/goals" linkLabel="View all" />
      <CardContent>
        <ul className="divide-y">
          {goals.map((goal) => {
            const percent = goal.TotalTasks
              ? Math.round((goal.DoneTasks / goal.TotalTasks) * 100)
              : 0;
            return (
              <li key={goal.Id} className="py-3 first:pt-0 last:pb-0">
                <Link
                  href={`/goals/${goal.Id}`}
                  prefetch
                  className="block space-y-1.5 rounded-md transition-opacity hover:opacity-80"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex min-w-0 items-center gap-2 text-sm font-medium">
                      <span
                        className="size-2 shrink-0 rounded-full"
                        style={{ backgroundColor: goal.Color }}
                      />
                      <span className="truncate">{goal.Name}</span>
                    </span>
                    <span className="text-xs tabular-nums text-muted-foreground">
                      {percent}%
                    </span>
                  </div>
                  <div
                    role="progressbar"
                    aria-valuenow={percent}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    className="h-1.5 overflow-hidden rounded-full bg-muted"
                  >
                    <div
                      className={cn("h-full rounded-full transition-all")}
                      style={{
                        width: `${percent}%`,
                        backgroundColor: goal.Color,
                      }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {goal.Plan} · {goal.DoneTasks}/{goal.TotalTasks} tasks · due{" "}
                    {dayjs(goal.DueAt).format("MMM D")}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}

"use client";

import dayjs from "dayjs";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MilestoneState, type Goal } from "../interface";
import { milestoneState, milestoneTasks, todayOffsetPercent } from "../utils";
import { GoalTaskStatus } from "../interface";

const STATE_META = new Map<
  MilestoneState,
  { label: string; variant: BadgeVariant; fill: string }
>([
  [
    MilestoneState.Achieved,
    { label: "Achieved", variant: "status-green", fill: "40" },
  ],
  [
    MilestoneState.InProgress,
    { label: "In progress", variant: "status-blue", fill: "26" },
  ],
  [
    MilestoneState.Upcoming,
    { label: "Upcoming", variant: "status-slate", fill: "14" },
  ],
]);

const formatDay = (value: string) => dayjs(value).format("MMM D");

export function PlanMilestones({ goal }: { goal: Goal }) {
  const todayOffset = todayOffsetPercent(goal);

  return (
    <Card className="shadow-xs">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium">Plan & milestones</CardTitle>
        <p className="text-xs text-muted-foreground">
          1-{goal.Plan.toLowerCase()} plan · {formatDay(goal.StartAt)} –{" "}
          {formatDay(goal.EndAt)}
        </p>
      </CardHeader>
      <CardContent>
        <div className="relative pt-5">
          {todayOffset !== null && (
            <div
              className="absolute inset-y-0 z-10 w-px bg-destructive"
              style={{ left: `${todayOffset}%` }}
            >
              <span className="absolute top-0 left-1/2 -translate-x-1/2 text-xs font-medium text-destructive">
                Today
              </span>
            </div>
          )}
          <div className="flex h-11 gap-0.5 overflow-hidden rounded-lg">
            {goal.Milestones.map((milestone) => {
              const meta = STATE_META.get(milestoneState(goal, milestone))!;
              const days = Math.max(
                1,
                dayjs(milestone.EndAt).diff(milestone.StartAt, "day") + 1,
              );
              return (
                <div
                  key={milestone.Id}
                  className="flex min-w-0 items-center px-3 text-xs font-medium"
                  style={{
                    flex: `${days} 1 0`,
                    backgroundColor: `${goal.Color}${meta.fill}`,
                  }}
                  title={milestone.Title}
                >
                  <span className="truncate">{milestone.Title}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="mt-1.5 flex justify-between text-xs text-muted-foreground">
          <span>{formatDay(goal.StartAt)}</span>
          <span>{formatDay(goal.EndAt)}</span>
        </div>

        <ol className="mt-4 divide-y border-t">
          {goal.Milestones.map((milestone, index) => {
            const items = milestoneTasks(goal, milestone);
            const done = items.filter(
              (task) => task.Status === GoalTaskStatus.Done,
            ).length;
            const meta = STATE_META.get(milestoneState(goal, milestone))!;
            return (
              <li
                key={milestone.Id}
                className="flex items-center gap-3 py-3 first:pt-3"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full border text-xs text-muted-foreground">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {milestone.Title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDay(milestone.StartAt)} –{" "}
                    {formatDay(milestone.EndAt)} · {done}/{items.length} tasks
                    done
                  </p>
                </div>
                <Badge variant={meta.variant} className="font-normal">
                  {meta.label}
                </Badge>
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}

"use client";

import Link from "next/link";
import dayjs from "dayjs";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  GoalTaskStatus,
  MilestoneState,
  type Goal,
  type GoalTask,
} from "../interface";
import { isTaskOverdue, milestoneState, milestoneTasks } from "../utils";

function TaskRow({ task, color }: { task: GoalTask; color: string }) {
  const done = task.Status === GoalTaskStatus.Done;
  const overdue = isTaskOverdue(task);

  return (
    <li
      className={cn(
        "flex items-center gap-3 rounded-lg border px-3 py-2.5",
        task.ScheduledAt === null && "border-dashed",
      )}
    >
      {task.ScheduledAt !== null && (
        <span
          className="h-9 w-1 shrink-0 rounded-full"
          style={{ backgroundColor: overdue ? "var(--destructive)" : color }}
        />
      )}
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "truncate text-sm font-medium",
            done && "text-muted-foreground line-through",
          )}
        >
          {task.Title}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {task.ScheduledAt
            ? dayjs(task.ScheduledAt).format("ddd, MMM D · HH:mm")
            : "Drag onto a calendar day to schedule"}
        </p>
      </div>
      {done ? (
        <Badge variant="status-green" className="font-normal">
          Done
        </Badge>
      ) : overdue ? (
        <Badge variant="danger" className="font-normal">
          Overdue
        </Badge>
      ) : (
        <Badge variant="status-slate" className="font-normal">
          To Do
        </Badge>
      )}
    </li>
  );
}

export function TasksByMilestone({ goal }: { goal: Goal }) {
  const withState = goal.Milestones.map((milestone) => ({
    milestone,
    state: milestoneState(goal, milestone),
  }));
  const current = withState.filter(
    ({ state }) => state === MilestoneState.InProgress,
  );
  const next = withState.find(({ state }) => state === MilestoneState.Upcoming);
  const groups = [
    ...current.map((group) => ({ ...group, tag: "now" })),
    ...(next ? [{ ...next, tag: "next" }] : []),
  ];
  const unscheduled = goal.Tasks.filter((task) => task.MilestoneId === null);

  return (
    <Card className="shadow-xs">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium">
          Tasks by milestone
        </CardTitle>
        <Link
          href="/tasks"
          prefetch
          className="inline-flex h-7 items-center gap-1 rounded-md px-2 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
        >
          Open in Tasks
          <ArrowRight className="size-3" />
        </Link>
      </CardHeader>
      <CardContent className="space-y-5">
        {groups.map(({ milestone, tag }) => (
          <section key={milestone.Id} className="space-y-2">
            <h3 className="text-xs font-medium text-muted-foreground">
              {milestone.Title} · {tag}
            </h3>
            <ul className="space-y-2">
              {milestoneTasks(goal, milestone).map((task) => (
                <TaskRow key={task.Id} task={task} color={goal.Color} />
              ))}
            </ul>
          </section>
        ))}
        {unscheduled.length > 0 && (
          <section className="space-y-2">
            <h3 className="text-xs font-medium text-muted-foreground">
              Unscheduled
            </h3>
            <ul className="space-y-2">
              {unscheduled.map((task) => (
                <TaskRow key={task.Id} task={task} color={goal.Color} />
              ))}
            </ul>
          </section>
        )}
        {groups.length === 0 && unscheduled.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No open tasks. Add one to get started.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

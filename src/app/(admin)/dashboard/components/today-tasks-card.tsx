"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import dayjs from "dayjs";
import { CalendarClock, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TASK_CATEGORIES, TASK_STATUS } from "@/lib/task-meta";
import { cn } from "@/lib/utils";
import { TaskStatus, type Task } from "@/store/server/tasks/interface";
import { WidgetHeader } from "./widget-header";

export function TodayTasksCard({
  tasks,
  footer,
}: {
  tasks: Task[];
  footer?: ReactNode;
}) {
  const sorted = [...tasks].sort(
    (a, b) => dayjs(a.StartAt).valueOf() - dayjs(b.StartAt).valueOf(),
  );

  return (
    <Card className="shadow-xs">
      <WidgetHeader
        title={`Today · ${dayjs().format("dddd, MMM D")}`}
        href="/tasks"
        linkLabel="Open tasks"
      />
      <CardContent>
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-muted-foreground">
            <CalendarClock className="size-6" />
            <p className="text-sm">Nothing scheduled today.</p>
            <Button size="sm" variant="outline" asChild>
              <Link href="/tasks">Plan your day</Link>
            </Button>
          </div>
        ) : (
          <ul className="space-y-2">
            {sorted.slice(0, 6).map((task) => {
              const category = TASK_CATEGORIES.get(task.Category);
              const status = TASK_STATUS.get(task.Status);
              const active =
                dayjs().isAfter(task.StartAt) && dayjs().isBefore(task.EndAt);
              return (
                <li
                  key={task.Id}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border px-3 py-2.5",
                    active && "border-primary/50 bg-primary/5",
                  )}
                >
                  <span
                    className="h-9 w-1 shrink-0 rounded-full"
                    style={{ backgroundColor: category?.color }}
                  />
                  <span className="w-[4.5rem] shrink-0 text-xs tabular-nums text-muted-foreground">
                    {dayjs(task.StartAt).format("HH:mm")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "truncate text-sm font-medium",
                        task.Status === TaskStatus.Done &&
                          "text-muted-foreground line-through",
                      )}
                    >
                      {task.Title}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {category?.label}
                      {task.Location ? ` · ${task.Location}` : ""}
                    </p>
                  </div>
                  {status && (
                    <Badge variant={status.variant} className="shrink-0">
                      {status.label}
                    </Badge>
                  )}
                  <span
                    aria-hidden
                    className={cn(
                      "flex size-6 shrink-0 items-center justify-center rounded-full border",
                      task.Status === TaskStatus.Done &&
                        "border-emerald-500 bg-emerald-500 text-white",
                    )}
                  >
                    {task.Status === TaskStatus.Done && (
                      <Check className="size-3.5" strokeWidth={3} />
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
        {footer && <div className="mt-5">{footer}</div>}
      </CardContent>
    </Card>
  );
}

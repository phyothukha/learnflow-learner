"use client";

import Link from "next/link";
import dayjs from "dayjs";
import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Task } from "@/store/server/tasks/interface";

export function MissedTasksBanner({ tasks }: { tasks: Task[] }) {
  if (tasks.length === 0) return null;

  const shown = tasks.slice(0, 2);

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm">
      <TriangleAlert className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
      <p className="min-w-0 flex-1">
        <span className="font-semibold">
          {tasks.length} {tasks.length === 1 ? "task" : "tasks"} missed
        </span>
        {" — "}
        {shown
          .map(
            (task) =>
              `${task.Title} (${dayjs(task.StartAt).format("ddd, MMM D")})`,
          )
          .join(" and ")}
        {tasks.length > shown.length
          ? ` and ${tasks.length - shown.length} more`
          : ""}
        . You can reschedule, mark overdue, check in or skip.
      </p>
      <Button variant="outline" size="sm" asChild>
        <Link href="/tasks">Resolve now</Link>
      </Button>
    </div>
  );
}

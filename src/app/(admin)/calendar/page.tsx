"use client";

import { useSession } from "next-auth/react";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PERMISSIONS } from "@/lib/permissions";
import { useRequirePermission } from "@/hooks/use-require-permission";
import { TaskCalendarView } from "../tasks/components/task-calendar-view";
import { TasksDialogs } from "../tasks/components/tasks-dialogs";
import { TaskFilters } from "../tasks/components/tasks-toolbar";
import TasksProvider, { useTasks } from "../tasks/context/tasks-context";
import { useTaskFilters } from "../tasks/hooks/use-task-filters";

export default function CalendarPage() {
  const { status: sessionStatus } = useSession();
  const canView = useRequirePermission(PERMISSIONS.SCHEDULE_VIEW);

  if (sessionStatus === "loading") {
    return <Skeleton className="h-full min-h-64 w-full rounded-xl" />;
  }

  if (!canView) return null;

  return (
    <TasksProvider>
      <CalendarContent />
      <TasksDialogs />
    </TasksProvider>
  );
}

function CalendarContent() {
  const { tasks, openCreate } = useTasks();
  const { filtered, filterProps } = useTaskFilters(tasks);

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 sm:gap-4">
      <PageHeader
        title="Calendar"
        description="See and reschedule your tasks by day, week or month"
        actions={
          <Button onClick={() => openCreate()} aria-label="New task">
            <Plus />
            New task
          </Button>
        }
      />
      <div className="schedule-card">
        <TaskFilters {...filterProps} />
        <TaskCalendarView tasks={filtered} />
      </div>
    </div>
  );
}

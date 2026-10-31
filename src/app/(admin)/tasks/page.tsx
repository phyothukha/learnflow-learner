"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { PERMISSIONS } from "@/lib/permissions";
import { useRequirePermission } from "@/hooks/use-require-permission";
import { TaskView } from "@/lib/task-meta";
import { TaskKanbanView } from "./components/task-kanban-view";
import { TaskListView } from "./components/task-list-view";
import { TasksDialogs } from "./components/tasks-dialogs";
import { TaskFilters, TaskViewTabs } from "./components/tasks-toolbar";
import TasksProvider, { useTasks } from "./context/tasks-context";
import { useTaskFilters } from "./hooks/use-task-filters";
import { Button } from "@/components/ui/button";

export default function TasksPage() {
  const { status: sessionStatus } = useSession();
  const canView = useRequirePermission(PERMISSIONS.SCHEDULE_VIEW);

  // Avoid a blank flash that looks like navigation failed.
  if (sessionStatus === "loading") {
    return <Skeleton className="h-full min-h-64 w-full rounded-xl" />;
  }

  if (!canView) return null;

  return (
    <TasksProvider>
      <TasksContent />
      <TasksDialogs />
    </TasksProvider>
  );
}

function TasksContent() {
  const { tasks, openCreate } = useTasks();
  const [view, setView] = useState(TaskView.Kanban);
  const { filtered, filterProps } = useTaskFilters(tasks);

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 sm:gap-4">
      <PageHeader
        title="Tasks"
        description="Plan, track and schedule your tasks by board or list"
        actions={
          <>
            <TaskViewTabs view={view} onViewChange={setView} />
            <Button onClick={() => openCreate()} aria-label="New task">
              <Plus />
              New task
            </Button>
          </>
        }
      />
      <div className="schedule-card">
        <TaskFilters {...filterProps} />
        {view === TaskView.Kanban && <TaskKanbanView tasks={filtered} />}
        {view === TaskView.List && <TaskListView tasks={filtered} />}
      </div>
    </div>
  );
}

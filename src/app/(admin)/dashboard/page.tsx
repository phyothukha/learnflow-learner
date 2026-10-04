"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import dayjs from "dayjs";
import {
  CalendarDays,
  CheckCircle2,
  NotebookPen,
  UsersRound,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { useWorkspaceNotesHydration } from "@/hooks/use-workspace-notes-hydration";
import { privateNotes, useNotesStore } from "@/store/client/notes-store";
import {
  canAccessTeamNotes,
  isTeamMember,
  useTeamsStore,
} from "@/store/client/teams-store";
import { TaskStatus } from "@/store/server/tasks/interface";
import { createFakeTasks } from "@/app/(admin)/tasks/data/fake-tasks";
import { RecentNotesCard } from "./components/recent-notes-card";
import { TeamsOverviewCard } from "./components/teams-overview-card";
import { TodayTasksCard } from "./components/today-tasks-card";

function greetingForHour(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const ready = useWorkspaceNotesHydration();
  const teams = useTeamsStore((state) => state.teams);
  const notes = useNotesStore((state) => state.notes);

  const tasks = useMemo(() => createFakeTasks(), []);
  const today = dayjs().startOf("day");

  const todayTasks = useMemo(
    () => tasks.filter((task) => dayjs(task.StartAt).isSame(today, "day")),
    [tasks, today],
  );

  const myTeams = useMemo(
    () => teams.filter((team) => isTeamMember(team)),
    [teams],
  );

  const mineNotes = useMemo(() => privateNotes(notes), [notes]);

  const doneToday = todayTasks.filter(
    (task) => task.Status === TaskStatus.Done,
  ).length;
  const openToday = todayTasks.length - doneToday;
  const notesAccessTeams = myTeams.filter((team) => canAccessTeamNotes(team));

  const firstName = session?.user?.name?.trim().split(/\s+/)[0] || "there";

  if (!ready) return null;

  return (
    <div className="flex h-full min-h-0 flex-col gap-6 pb-6">
      <PageHeader
        title={`${greetingForHour(dayjs().hour())}, ${firstName}`}
        description={dayjs().format(
          "dddd, MMMM D · Here’s your day at a glance.",
        )}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/tasks" prefetch>
                <CalendarDays />
                Tasks
              </Link>
            </Button>
            <Button asChild>
              <Link href="/notes" prefetch>
                <NotebookPen />
                Notes
              </Link>
            </Button>
          </div>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          icon={CalendarDays}
          label="Today’s tasks"
          value={todayTasks.length}
          hint={openToday === 0 ? "All clear" : `${openToday} still open`}
        />
        <StatTile
          icon={CheckCircle2}
          label="Done today"
          value={doneToday}
          hint={
            todayTasks.length
              ? `${Math.round((doneToday / todayTasks.length) * 100)}% complete`
              : "No tasks yet"
          }
        />
        <StatTile
          icon={UsersRound}
          label="Your teams"
          value={myTeams.length}
          hint={
            notesAccessTeams.length
              ? `${notesAccessTeams.length} with notes access`
              : "No notes access yet"
          }
        />
        <StatTile
          icon={NotebookPen}
          label="Private notes"
          value={mineNotes.length}
          hint="In your Notes tab"
        />
      </div>

      <div className="grid min-h-0 flex-1 gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <TodayTasksCard tasks={todayTasks} />
        <div className="grid gap-4">
          <TeamsOverviewCard teams={myTeams} />
          <RecentNotesCard notes={mineNotes} />
        </div>
      </div>
    </div>
  );
}

function StatTile({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof CalendarDays;
  label: string;
  value: number;
  hint: string;
}) {
  return (
    <div className="rounded-2xl border bg-card p-4 shadow-xs">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="size-4" />
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums">
        {value}
      </p>
      <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

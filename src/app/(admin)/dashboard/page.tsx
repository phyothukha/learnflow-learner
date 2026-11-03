"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import dayjs from "dayjs";
import {
  CalendarDays,
  CheckCircle2,
  Flame,
  Plus,
  TriangleAlert,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { useWorkspaceNotesHydration } from "@/hooks/use-workspace-notes-hydration";
import { privateNotes, useNotesStore } from "@/store/client/notes-store";
import { isTeamMember, useTeamsStore } from "@/store/client/teams-store";
import { TaskStatus } from "@/store/server/tasks/interface";
import { createFakeTasks } from "@/app/(admin)/tasks/data/fake-tasks";
import { useGoalsStore } from "@/store/client/goals-store";
import { toDashboardGoals, toDashboardMilestones } from "./data/fake-goals";
import { GoalProgressCard } from "./components/goal-progress-card";
import { MissedTasksBanner } from "./components/missed-tasks-banner";
import { UpcomingMilestones } from "./components/upcoming-milestones";
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
  const storeGoals = useGoalsStore((state) => state.goals);
  const goals = useMemo(() => toDashboardGoals(storeGoals), [storeGoals]);
  const milestones = useMemo(
    () => toDashboardMilestones(storeGoals),
    [storeGoals],
  );

  const missedTasks = useMemo(
    () =>
      tasks
        .filter(
          (task) =>
            task.Status !== TaskStatus.Done &&
            dayjs(task.EndAt).isBefore(today) &&
            dayjs(task.EndAt).isAfter(today.subtract(7, "day")),
        )
        .sort(
          (a, b) => dayjs(b.StartAt).valueOf() - dayjs(a.StartAt).valueOf(),
        ),
    [tasks, today],
  );

  const streak = useMemo(() => {
    const doneDays = new Set(
      tasks
        .filter((task) => task.Status === TaskStatus.Done)
        .map((task) => dayjs(task.StartAt).format("YYYY-MM-DD")),
    );
    let count = 0;
    let day = today;
    if (!doneDays.has(day.format("YYYY-MM-DD"))) day = day.subtract(1, "day");
    while (doneDays.has(day.format("YYYY-MM-DD"))) {
      count += 1;
      day = day.subtract(1, "day");
    }
    return count;
  }, [tasks, today]);

  const doneToday = todayTasks.filter(
    (task) => task.Status === TaskStatus.Done,
  ).length;
  const openToday = todayTasks.length - doneToday;

  const firstName = session?.user?.name?.trim().split(/\s+/)[0] || "there";

  if (!ready) return null;

  return (
    <div className="flex flex-col gap-4 pb-6">
      <PageHeader
        title={`${greetingForHour(dayjs().hour())}, ${firstName}`}
        description={`${dayjs().format("dddd, MMMM D")} · Here’s your day at a glance.`}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" asChild>
              <Link href="/calendar" prefetch>
                <CalendarDays />
                Calendar
              </Link>
            </Button>
            <Button asChild>
              <Link href="/goals" prefetch>
                <Plus />
                New goal
              </Link>
            </Button>
          </div>
        }
      />

      <MissedTasksBanner tasks={missedTasks} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          icon={CalendarDays}
          label="Today’s tasks"
          value={String(todayTasks.length)}
          hint={openToday === 0 ? "All clear" : `${openToday} still open`}
        />
        <StatTile
          icon={CheckCircle2}
          label="Done today"
          value={String(doneToday)}
          hint={
            todayTasks.length
              ? `${Math.round((doneToday / todayTasks.length) * 100)}% complete`
              : "No tasks yet"
          }
        />
        <StatTile
          icon={Flame}
          label="Streak"
          value={`${streak} ${streak === 1 ? "day" : "days"}`}
          hint="Finish half of today’s tasks to keep it"
        />
        <StatTile
          icon={TriangleAlert}
          label="Needs attention"
          value={String(missedTasks.length)}
          hint="Missed tasks waiting for a decision"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="min-w-0 [&>*]:h-full">
          <TodayTasksCard
            tasks={todayTasks}
            footer={<UpcomingMilestones milestones={milestones} />}
          />
        </div>
        <div className="grid min-w-0 auto-rows-fr gap-4">
          <GoalProgressCard goals={goals} />
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
  value: string;
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

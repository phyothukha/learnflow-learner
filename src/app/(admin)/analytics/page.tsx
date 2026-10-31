"use client";

import { useMemo, useState } from "react";
import dayjs from "dayjs";
import { PageHeader } from "@/components/page-header";
import {
  AnimatedTabs,
  AnimatedTabsVariant,
  type AnimatedTab,
} from "@/components/animated-tabs";
import { useGoalsStore } from "@/store/client/goals-store";
import { createFakeTasks } from "../tasks/data/fake-tasks";
import { createFakeActivity } from "./data/fake-activity";
import { AnalyticsKpis } from "./components/analytics-kpis";
import { ByGoalCard } from "./components/by-goal-card";
import { PlannedVsDoneCard } from "./components/planned-vs-done-card";
import { RecentWeeksCard } from "./components/recent-weeks-card";
import {
  AnalyticsPeriod,
  PERIOD_NOUN,
  buildBuckets,
  buildHourlyHeatmap,
  collectItems,
  currentStreak,
  itemsInRange,
  missedCount,
  periodRange,
} from "./utils";

const PERIOD_TABS: AnimatedTab<AnalyticsPeriod>[] = [
  { value: AnalyticsPeriod.Weekly, label: "Weekly" },
  { value: AnalyticsPeriod.Monthly, label: "Monthly" },
  { value: AnalyticsPeriod.Yearly, label: "Yearly" },
];

export default function AnalyticsPage() {
  const goals = useGoalsStore((state) => state.goals);
  const tasks = useMemo(() => createFakeTasks(), []);
  const [period, setPeriod] = useState(AnalyticsPeriod.Weekly);

  const all = useMemo(() => {
    const current = collectItems(tasks, goals);
    const earliest = current.reduce(
      (min, item) => (item.At.isBefore(min) ? item.At : min),
      dayjs(),
    );
    return [...createFakeActivity(earliest), ...current];
  }, [tasks, goals]);
  const range = useMemo(() => periodRange(period), [period]);
  const items = useMemo(() => itemsInRange(all, range), [all, range]);
  const buckets = useMemo(
    () => buildBuckets(items, period, range),
    [items, period, range],
  );
  const heatmap = useMemo(() => buildHourlyHeatmap(all), [all]);

  const planned = items.length;
  const done = items.filter((item) => item.Done).length;
  const missed = missedCount(items);
  const streak = currentStreak(all);
  const noun = PERIOD_NOUN.get(period);

  return (
    <div className="flex min-h-full flex-col gap-4 pb-6">
      <PageHeader
        title="Analytics"
        description="Updated automatically from your calendar and task list."
        actions={
          <AnimatedTabs
            tabs={PERIOD_TABS}
            value={period}
            onValueChange={setPeriod}
            variant={AnimatedTabsVariant.Pill}
            tabClassName="px-3 py-1"
          />
        }
      />

      <AnalyticsKpis
        kpis={[
          {
            label: `Completion this ${noun}`,
            value: `${planned ? Math.round((done / planned) * 100) : 0}%`,
            hint: `${done} of ${planned} planned so far`,
          },
          {
            label: "Tasks done",
            value: String(done),
            hint:
              period === AnalyticsPeriod.Weekly
                ? "Monday to today"
                : `Since the start of the ${noun}`,
          },
          {
            label: "Current streak",
            value: `${streak} ${streak === 1 ? "day" : "days"}`,
            hint: "Days with half or more done",
          },
          {
            label: `Missed this ${noun}`,
            value: String(missed),
            hint: "Including overdue and skipped",
          },
        ]}
      />

      <div className="grid flex-1 grid-cols-1 gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <PlannedVsDoneCard buckets={buckets} range={range} period={period} />
        <div className="min-w-0 [&>*]:h-full">
          <ByGoalCard goals={goals} items={items} period={period} />
        </div>
      </div>
      <RecentWeeksCard cells={heatmap} />
    </div>
  );
}

import dayjs, { type Dayjs } from "dayjs";
import { GoalTaskStatus, type Goal } from "@/app/(admin)/goals/interface";
import { TaskStatus, type Task } from "@/store/server/tasks/interface";
import { startOfWeek } from "@/utils/calendar";

export enum AnalyticsPeriod {
  Weekly = "weekly",
  Monthly = "monthly",
  Yearly = "yearly",
}

/** A scheduled piece of work from either the task list or a goal. */
export interface PlannedItem {
  At: Dayjs;
  Done: boolean;
  GoalId: string | null;
}

export interface PeriodRange {
  start: Dayjs;
  end: Dayjs;
}

export interface PeriodBucket {
  label: string;
  planned: number;
  done: number;
}

export interface HeatmapCell {
  /** 0 = Monday … 6 = Sunday. */
  weekday: number;
  hour: number;
  done: number;
  planned: number;
}

export const PERIOD_NOUN = new Map<AnalyticsPeriod, string>([
  [AnalyticsPeriod.Weekly, "week"],
  [AnalyticsPeriod.Monthly, "month"],
  [AnalyticsPeriod.Yearly, "year"],
]);

const HEATMAP_WEEKS = 4;

export function collectItems(tasks: Task[], goals: Goal[]): PlannedItem[] {
  return [
    ...tasks.map((task) => ({
      At: dayjs(task.StartAt),
      Done: task.Status === TaskStatus.Done,
      GoalId: null,
    })),
    ...goals.flatMap((goal) =>
      goal.Tasks.filter((task) => task.ScheduledAt !== null).map((task) => ({
        At: dayjs(task.ScheduledAt),
        Done: task.Status === GoalTaskStatus.Done,
        GoalId: goal.Id,
      })),
    ),
  ];
}

export function periodRange(period: AnalyticsPeriod): PeriodRange {
  const today = dayjs().startOf("day");
  switch (period) {
    case AnalyticsPeriod.Weekly: {
      const start = startOfWeek(today);
      return { start, end: start.add(6, "day") };
    }
    case AnalyticsPeriod.Monthly:
      return { start: today.startOf("month"), end: today.endOf("month") };
    case AnalyticsPeriod.Yearly:
      return { start: today.startOf("year"), end: today.endOf("year") };
  }
}

export function itemsInRange(items: PlannedItem[], range: PeriodRange) {
  return items.filter(
    (item) =>
      !item.At.isBefore(range.start) &&
      !item.At.isAfter(range.end.endOf("day")),
  );
}

export function buildBuckets(
  items: PlannedItem[],
  period: AnalyticsPeriod,
  range: PeriodRange,
): PeriodBucket[] {
  const unit = period === AnalyticsPeriod.Yearly ? "month" : "day";
  const count = range.end.diff(range.start, unit) + 1;

  return Array.from({ length: count }, (_, index) => {
    const from = range.start.add(index, unit);
    const inBucket = items.filter((item) => item.At.isSame(from, unit));
    return {
      label:
        period === AnalyticsPeriod.Weekly
          ? from.format("ddd D")
          : period === AnalyticsPeriod.Monthly
            ? from.format("D")
            : from.format("MMM"),
      planned: inBucket.length,
      done: inBucket.filter((item) => item.Done).length,
    };
  });
}

export function missedCount(items: PlannedItem[]) {
  return items.filter((item) => !item.Done && item.At.isBefore(dayjs())).length;
}

/** Consecutive days, ending today or yesterday, with half or more done. */
export function currentStreak(items: PlannedItem[]) {
  const qualifies = (day: Dayjs) => {
    const planned = items.filter((item) => item.At.isSame(day, "day"));
    return (
      planned.length > 0 &&
      planned.filter((item) => item.Done).length / planned.length >= 0.5
    );
  };
  let day = dayjs().startOf("day");
  if (!qualifies(day)) day = day.subtract(1, "day");
  let streak = 0;
  while (qualifies(day)) {
    streak += 1;
    day = day.subtract(1, "day");
  }
  return streak;
}

/** Done and planned work by weekday and hour over the last four weeks. */
export function buildHourlyHeatmap(items: PlannedItem[]): HeatmapCell[] {
  const end = dayjs().endOf("day");
  const start = end.startOf("day").subtract(HEATMAP_WEEKS * 7 - 1, "day");
  const cells = Array.from({ length: 7 * 24 }, (_, index) => ({
    weekday: Math.floor(index / 24),
    hour: index % 24,
    done: 0,
    planned: 0,
  }));

  for (const item of items) {
    if (item.At.isBefore(start) || item.At.isAfter(end)) continue;
    const cell = cells[((item.At.day() + 6) % 7) * 24 + item.At.hour()];
    cell.planned += 1;
    if (item.Done) cell.done += 1;
  }

  return cells;
}

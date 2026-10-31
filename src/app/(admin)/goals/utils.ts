import dayjs from "dayjs";
import {
  GoalPlan,
  GoalTaskStatus,
  MilestoneState,
  type Goal,
  type GoalMilestone,
  type GoalTask,
} from "./interface";

export function goalProgress(goal: Goal) {
  const total = goal.Tasks.length;
  const done = goal.Tasks.filter(
    (task) => task.Status === GoalTaskStatus.Done,
  ).length;
  return { done, total, percent: total ? Math.round((done / total) * 100) : 0 };
}

export function milestoneTasks(goal: Goal, milestone: GoalMilestone) {
  return goal.Tasks.filter((task) => task.MilestoneId === milestone.Id);
}

export function milestoneState(
  goal: Goal,
  milestone: GoalMilestone,
): MilestoneState {
  const items = milestoneTasks(goal, milestone);
  const today = dayjs().startOf("day");
  if (
    items.length > 0 &&
    items.every((task) => task.Status === GoalTaskStatus.Done)
  ) {
    return MilestoneState.Achieved;
  }
  if (dayjs(milestone.StartAt).isAfter(today)) return MilestoneState.Upcoming;
  return MilestoneState.InProgress;
}

export function isTaskOverdue(task: GoalTask) {
  return (
    task.Status !== GoalTaskStatus.Done &&
    task.ScheduledAt !== null &&
    dayjs(task.ScheduledAt).isBefore(dayjs().startOf("day"))
  );
}

/** Position of today inside the plan as a 0–100 percentage. */
export function todayOffsetPercent(goal: Goal) {
  const start = dayjs(goal.StartAt);
  const span = dayjs(goal.EndAt).endOf("day").diff(start);
  const offset = dayjs().diff(start);
  if (span <= 0 || offset < 0 || offset > span) return null;
  return (offset / span) * 100;
}

const MILESTONE_COUNT = 4;

/**
 * Default milestones for a new goal: four weeks for a 1-month plan, four
 * quarters for a 1-year plan. The last one always closes on the goal's end.
 */
export function buildMilestones(
  plan: GoalPlan,
  startAt: string,
  endAt: string,
): GoalMilestone[] {
  const start = dayjs(startAt).startOf("day");
  const yearly = plan === GoalPlan.Year;

  return Array.from({ length: MILESTONE_COUNT }, (_, index) => {
    const from = yearly
      ? start.add(index * 3, "month")
      : start.add(index * 7, "day");
    const to =
      index === MILESTONE_COUNT - 1
        ? dayjs(endAt)
        : yearly
          ? start.add((index + 1) * 3, "month").subtract(1, "day")
          : from.add(6, "day");
    return {
      Id: `milestone-${crypto.randomUUID()}`,
      Title: `${yearly ? "Quarter" : "Week"} ${index + 1}`,
      StartAt: from.toISOString(),
      EndAt: to.toISOString(),
    };
  });
}

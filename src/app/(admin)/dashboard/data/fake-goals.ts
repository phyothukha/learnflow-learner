import dayjs from "dayjs";
import { createFakeGoals as createGoals } from "@/app/(admin)/goals/data/fake-goals";
import {
  GoalPlan,
  MilestoneState,
  type Goal,
} from "@/app/(admin)/goals/interface";
import { goalProgress, milestoneState } from "@/app/(admin)/goals/utils";

export interface DashboardGoal {
  Id: string;
  Name: string;
  Color: string;
  Plan: string;
  DoneTasks: number;
  TotalTasks: number;
  DueAt: string;
}

export interface DashboardMilestone {
  Id: string;
  Title: string;
  GoalName: string;
  Color: string;
  StartAt: string;
  EndAt: string;
}

export function createFakeGoals(): DashboardGoal[] {
  return createGoals().map((goal) => {
    const { done, total } = goalProgress(goal);
    return {
      Id: goal.Id,
      Name: goal.Name,
      Color: goal.Color,
      Plan: `1 ${goal.Plan === GoalPlan.Year ? "Year" : "Month"} plan`,
      DoneTasks: done,
      TotalTasks: total,
      DueAt: goal.EndAt,
    };
  });
}

/** Current and next milestone of every goal, soonest first. */
export function createFakeMilestones(): DashboardMilestone[] {
  const today = dayjs().startOf("day");
  return createGoals()
    .flatMap((goal: Goal) =>
      goal.Milestones.filter(
        (milestone) =>
          milestoneState(goal, milestone) !== MilestoneState.Achieved &&
          !dayjs(milestone.EndAt).isBefore(today),
      ).map((milestone) => ({
        Id: milestone.Id,
        Title: milestone.Title,
        GoalName: goal.Name,
        Color: goal.Color,
        StartAt: milestone.StartAt,
        EndAt: milestone.EndAt,
      })),
    )
    .sort((a, b) => dayjs(a.EndAt).valueOf() - dayjs(b.EndAt).valueOf())
    .slice(0, 3);
}

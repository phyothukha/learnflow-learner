import { create } from "zustand";
import { createFakeGoals } from "@/app/(admin)/goals/data/fake-goals";
import {
  GoalTaskStatus,
  type Goal,
  type GoalMilestone,
  type GoalResource,
  type GoalTask,
} from "@/app/(admin)/goals/interface";

export interface GoalsData {
  goals: Goal[];
}

export interface GoalsActions {
  createGoal: (goal: Goal) => void;
  deleteGoal: (id: string) => void;
  addTask: (goalId: string, input: Omit<GoalTask, "Id" | "Status">) => void;
  addResource: (goalId: string, input: Omit<GoalResource, "Id">) => void;
  addMilestone: (goalId: string, input: Omit<GoalMilestone, "Id">) => void;
  updateMilestone: (
    goalId: string,
    id: string,
    patch: Partial<Omit<GoalMilestone, "Id">>,
  ) => void;
  /** Its tasks are kept and become unscheduled-by-milestone. */
  deleteMilestone: (goalId: string, id: string) => void;
}

export type GoalsState = GoalsData & GoalsActions;

function sortMilestones(milestones: GoalMilestone[]) {
  return [...milestones].sort(
    (a, b) => new Date(a.StartAt).getTime() - new Date(b.StartAt).getTime(),
  );
}

function createId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

export const useGoalsStore = create<GoalsState>()((set) => {
  const updateGoal = (id: string, update: (goal: Goal) => Goal) =>
    set((state) => ({
      goals: state.goals.map((goal) => (goal.Id === id ? update(goal) : goal)),
    }));

  return {
    goals: createFakeGoals(),
    createGoal: (goal) => set((state) => ({ goals: [...state.goals, goal] })),
    deleteGoal: (id) =>
      set((state) => ({ goals: state.goals.filter((goal) => goal.Id !== id) })),
    addTask: (goalId, input) =>
      updateGoal(goalId, (goal) => ({
        ...goal,
        Tasks: [
          ...goal.Tasks,
          { ...input, Id: createId("task"), Status: GoalTaskStatus.Todo },
        ],
      })),
    addResource: (goalId, input) =>
      updateGoal(goalId, (goal) => ({
        ...goal,
        Resources: [...goal.Resources, { ...input, Id: createId("resource") }],
      })),
    addMilestone: (goalId, input) =>
      updateGoal(goalId, (goal) => ({
        ...goal,
        Milestones: sortMilestones([
          ...goal.Milestones,
          { ...input, Id: createId("milestone") },
        ]),
      })),
    updateMilestone: (goalId, id, patch) =>
      updateGoal(goalId, (goal) => ({
        ...goal,
        Milestones: sortMilestones(
          goal.Milestones.map((milestone) =>
            milestone.Id === id ? { ...milestone, ...patch } : milestone,
          ),
        ),
      })),
    deleteMilestone: (goalId, id) =>
      updateGoal(goalId, (goal) => ({
        ...goal,
        Milestones: goal.Milestones.filter((milestone) => milestone.Id !== id),
        Tasks: goal.Tasks.map((task) =>
          task.MilestoneId === id ? { ...task, MilestoneId: null } : task,
        ),
      })),
  };
});

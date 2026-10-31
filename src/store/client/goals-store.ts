import { create } from "zustand";
import { createFakeGoals } from "@/app/(admin)/goals/data/fake-goals";
import {
  GoalTaskStatus,
  type Goal,
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
}

export type GoalsState = GoalsData & GoalsActions;

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
  };
});

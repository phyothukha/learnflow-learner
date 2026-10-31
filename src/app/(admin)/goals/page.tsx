"use client";

import { useState } from "react";
import dayjs from "dayjs";
import { Plus, Target } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { PRIMARY_COLORS } from "@/lib/primary-colors";
import {
  AddResourceDialog,
  AddTaskDialog,
  NewGoalDialog,
  type AddResourceInput,
  type AddTaskInput,
  type NewGoalInput,
} from "./components/goal-dialogs";
import { GoalHeader } from "./components/goal-header";
import { GoalSwitcher } from "./components/goal-switcher";
import { PlanMilestones } from "./components/plan-milestones";
import { ResourcesCard } from "./components/resources-card";
import { TasksByMilestone } from "./components/tasks-by-milestone";
import { createFakeGoals } from "./data/fake-goals";
import { GoalPlan, GoalTaskStatus, type Goal } from "./interface";

enum GoalDialog {
  New = "new",
  Task = "task",
  Resource = "resource",
}

const GOAL_COLORS = Array.from(PRIMARY_COLORS.values(), (color) => color.value);

export default function GoalsPage() {
  const [goals, setGoals] = useState(createFakeGoals);
  const [selectedId, setSelectedId] = useState<string | null>(
    () => goals[1]?.Id ?? goals[0]?.Id ?? null,
  );
  const [dialog, setDialog] = useState<GoalDialog | null>(null);
  const { confirmDelete, dialogProps } = useConfirmDialog();

  const goal = goals.find((item) => item.Id === selectedId) ?? goals[0] ?? null;

  const updateGoal = (id: string, update: (goal: Goal) => Goal) =>
    setGoals((current) =>
      current.map((item) => (item.Id === id ? update(item) : item)),
    );

  const createGoal = (input: NewGoalInput) => {
    const start = dayjs().startOf("day");
    const created: Goal = {
      Id: `goal-${crypto.randomUUID()}`,
      ...input,
      Color: GOAL_COLORS[goals.length % GOAL_COLORS.length],
      Tags: [],
      StartAt: start.toISOString(),
      EndAt: start
        .add(1, input.Plan === GoalPlan.Year ? "year" : "month")
        .toISOString(),
      Milestones: [],
      Tasks: [],
      Resources: [],
    };
    setGoals((current) => [...current, created]);
    setSelectedId(created.Id);
    toast.success("Goal created.");
  };

  const addTask = (input: AddTaskInput) => {
    if (!goal) return;
    updateGoal(goal.Id, (current) => ({
      ...current,
      Tasks: [
        ...current.Tasks,
        {
          Id: `task-${crypto.randomUUID()}`,
          ...input,
          Status: GoalTaskStatus.Todo,
        },
      ],
    }));
    toast.success("Task added.");
  };

  const addResource = (input: AddResourceInput) => {
    if (!goal) return;
    updateGoal(goal.Id, (current) => ({
      ...current,
      Resources: [
        ...current.Resources,
        { Id: `resource-${crypto.randomUUID()}`, ...input },
      ],
    }));
    toast.success("Resource added.");
  };

  const deleteGoal = async () => {
    if (!goal) return;
    await confirmDelete({
      itemName: goal.Name,
      description: "The goal, its milestones, tasks and resources are removed.",
      successMessage: "Goal deleted.",
      onConfirm: () => {
        const remaining = goals.filter((item) => item.Id !== goal.Id);
        setGoals(remaining);
        setSelectedId(remaining[0]?.Id ?? null);
      },
    });
  };

  return (
    <div className="flex flex-col gap-4 pb-6">
      <PageHeader
        title="Goals"
        description="Set a target, choose a 1-month or 1-year plan, and it’s broken into milestones you can schedule."
        actions={
          <Button onClick={() => setDialog(GoalDialog.New)}>
            <Plus />
            New goal
          </Button>
        }
      />

      {goal ? (
        <>
          <GoalSwitcher
            goals={goals}
            selectedId={goal.Id}
            onSelect={setSelectedId}
          />
          <GoalHeader
            goal={goal}
            onAddTask={() => setDialog(GoalDialog.Task)}
            onAddResource={() => setDialog(GoalDialog.Resource)}
            onSaveAsModule={() =>
              toast.success(`“${goal.Name}” saved as a module.`)
            }
            onDelete={deleteGoal}
          />
          <PlanMilestones goal={goal} />
          <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
            <TasksByMilestone goal={goal} />
            <ResourcesCard
              resources={goal.Resources}
              onAdd={() => setDialog(GoalDialog.Resource)}
            />
          </div>
          <AddTaskDialog
            goal={goal}
            open={dialog === GoalDialog.Task}
            onOpenChange={(open) => !open && setDialog(null)}
            onAdd={addTask}
          />
          <AddResourceDialog
            open={dialog === GoalDialog.Resource}
            onOpenChange={(open) => !open && setDialog(null)}
            onAdd={addResource}
          />
        </>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed py-16 text-muted-foreground">
          <Target className="size-8" />
          <p className="text-sm">No goals yet. Create your first one.</p>
        </div>
      )}

      <NewGoalDialog
        open={dialog === GoalDialog.New}
        onOpenChange={(open) => !open && setDialog(null)}
        onCreate={createGoal}
      />
      <ConfirmDialog {...dialogProps} />
    </div>
  );
}

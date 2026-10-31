"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Target } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { useGoalsStore } from "@/store/client/goals-store";
import { AddResourceDialog, AddTaskDialog } from "../components/goal-dialogs";
import { GoalHeader } from "../components/goal-header";
import { PlanMilestones } from "../components/plan-milestones";
import { ResourcesCard } from "../components/resources-card";
import { TasksByMilestone } from "../components/tasks-by-milestone";

enum GoalDialog {
  Task = "task",
  Resource = "resource",
}

export default function GoalDetailPage({
  params,
}: {
  params: Promise<{ goalId: string }>;
}) {
  const { goalId } = use(params);
  const router = useRouter();
  const goal = useGoalsStore((state) =>
    state.goals.find((item) => item.Id === goalId),
  );
  const { addTask, addResource, deleteGoal } = useGoalsStore.getState();
  const [dialog, setDialog] = useState<GoalDialog | null>(null);
  const { confirmDelete, dialogProps } = useConfirmDialog();

  if (!goal) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed py-16 text-muted-foreground">
        <Target className="size-8" />
        <p className="text-sm">This goal doesn’t exist or was deleted.</p>
        <Button variant="outline" size="sm" asChild>
          <Link href="/goals">Back to goals</Link>
        </Button>
      </div>
    );
  }

  const handleDelete = () =>
    confirmDelete({
      itemName: goal.Name,
      description: "The goal, its milestones, tasks and resources are removed.",
      successMessage: "Goal deleted.",
      onConfirm: () => {
        router.replace("/goals");
        deleteGoal(goal.Id);
      },
    });

  return (
    <div className="flex flex-col gap-4 pb-6">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 w-fit text-muted-foreground"
        asChild
      >
        <Link href="/goals" prefetch>
          <ArrowLeft />
          All goals
        </Link>
      </Button>

      <GoalHeader
        goal={goal}
        onAddTask={() => setDialog(GoalDialog.Task)}
        onAddResource={() => setDialog(GoalDialog.Resource)}
        onSaveAsModule={() =>
          toast.success(`“${goal.Name}” saved as a module.`)
        }
        onDelete={handleDelete}
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
        onAdd={(input) => {
          addTask(goal.Id, input);
          toast.success("Task added.");
        }}
      />
      <AddResourceDialog
        open={dialog === GoalDialog.Resource}
        onOpenChange={(open) => !open && setDialog(null)}
        onAdd={(input) => {
          addResource(goal.Id, input);
          toast.success("Resource added.");
        }}
      />
      <ConfirmDialog {...dialogProps} />
    </div>
  );
}

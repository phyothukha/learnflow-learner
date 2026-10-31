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
import {
  AddResourceDialog,
  AddTaskDialog,
  MilestoneDialog,
} from "../components/goal-dialogs";
import { GoalHeader } from "../components/goal-header";
import { PlanMilestones } from "../components/plan-milestones";
import { ResourcesCard } from "../components/resources-card";
import { TasksByMilestone } from "../components/tasks-by-milestone";
import type { GoalMilestone } from "../interface";

enum GoalDialog {
  Task = "task",
  Resource = "resource",
  Milestone = "milestone",
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
  const {
    addTask,
    addResource,
    deleteGoal,
    addMilestone,
    updateMilestone,
    deleteMilestone,
  } = useGoalsStore.getState();
  const [dialog, setDialog] = useState<GoalDialog | null>(null);
  const [editing, setEditing] = useState<GoalMilestone | null>(null);
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
      <PlanMilestones
        goal={goal}
        onAdd={() => {
          setEditing(null);
          setDialog(GoalDialog.Milestone);
        }}
        onEdit={(milestone) => {
          setEditing(milestone);
          setDialog(GoalDialog.Milestone);
        }}
        onDelete={(milestone) =>
          confirmDelete({
            itemName: milestone.Title,
            description:
              "Its tasks are kept but no longer belong to a milestone.",
            successMessage: "Milestone deleted.",
            onConfirm: () => deleteMilestone(goal.Id, milestone.Id),
          })
        }
      />
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
      <MilestoneDialog
        goal={goal}
        milestone={editing}
        open={dialog === GoalDialog.Milestone}
        onOpenChange={(open) => !open && setDialog(null)}
        onSubmit={(input) => {
          if (editing) {
            updateMilestone(goal.Id, editing.Id, input);
            toast.success("Milestone updated.");
          } else {
            addMilestone(goal.Id, input);
            toast.success("Milestone added.");
          }
        }}
      />
      <ConfirmDialog {...dialogProps} />
    </div>
  );
}

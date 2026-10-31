"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import { Plus, Target } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { PRIMARY_COLORS } from "@/lib/primary-colors";
import { useGoalsStore } from "@/store/client/goals-store";
import { GoalCard } from "./components/goal-card";
import { NewGoalDialog, type NewGoalInput } from "./components/goal-dialogs";
import { GoalPlan, type Goal } from "./interface";
import { buildMilestones } from "./utils";

const GOAL_COLORS = Array.from(PRIMARY_COLORS.values(), (color) => color.value);

export default function GoalsPage() {
  const router = useRouter();
  const goals = useGoalsStore((state) => state.goals);
  const createGoal = useGoalsStore((state) => state.createGoal);
  const [creating, setCreating] = useState(false);

  const handleCreate = (input: NewGoalInput) => {
    const start = dayjs().startOf("day");
    const endAt = start
      .add(1, input.Plan === GoalPlan.Year ? "year" : "month")
      .toISOString();
    const goal: Goal = {
      Id: `goal-${crypto.randomUUID()}`,
      ...input,
      Color: GOAL_COLORS[goals.length % GOAL_COLORS.length],
      Tags: [],
      StartAt: start.toISOString(),
      EndAt: endAt,
      Milestones: buildMilestones(input.Plan, start.toISOString(), endAt),
      Tasks: [],
      Resources: [],
    };
    createGoal(goal);
    toast.success("Goal created.");
    router.push(`/goals/${goal.Id}`);
  };

  return (
    <div className="flex flex-col gap-4 pb-6">
      <PageHeader
        title="Goals"
        description="Set a target, choose a 1-month or 1-year plan, and it’s broken into milestones you can schedule."
        actions={
          <Button onClick={() => setCreating(true)}>
            <Plus />
            New goal
          </Button>
        }
      />

      {goals.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed py-16 text-muted-foreground">
          <Target className="size-8" />
          <p className="text-sm">No goals yet. Create your first one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {goals.map((goal) => (
            <GoalCard key={goal.Id} goal={goal} />
          ))}
        </div>
      )}

      <NewGoalDialog
        open={creating}
        onOpenChange={setCreating}
        onCreate={handleCreate}
      />
    </div>
  );
}

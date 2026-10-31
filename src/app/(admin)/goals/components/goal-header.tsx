"use client";

import dayjs from "dayjs";
import { Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Goal } from "../interface";
import { goalProgress } from "../utils";

const RING_RADIUS = 28;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;

export interface GoalHeaderProps {
  goal: Goal;
  onAddTask: () => void;
  onAddResource: () => void;
  onSaveAsModule: () => void;
  onDelete: () => void;
}

export function GoalHeader({
  goal,
  onAddTask,
  onAddResource,
  onSaveAsModule,
  onDelete,
}: GoalHeaderProps) {
  const { done, total, percent } = goalProgress(goal);

  return (
    <Card className="shadow-xs">
      <CardContent className="flex flex-wrap items-start justify-between gap-x-6 gap-y-4">
        <div className="flex min-w-0 flex-1 items-start gap-4">
          <span
            className="flex size-14 shrink-0 items-center justify-center rounded-2xl text-lg font-semibold"
            style={{ backgroundColor: `${goal.Color}26`, color: goal.Color }}
          >
            {goal.Name.slice(0, 1).toUpperCase()}
          </span>
          <div className="min-w-0 space-y-2">
            <h2 className="truncate text-xl font-semibold tracking-tight">
              {goal.Name}
            </h2>
            <p className="text-sm text-muted-foreground">{goal.Description}</p>
            <div className="flex flex-wrap gap-1.5">
              <Badge variant="outline" className="font-normal">
                {goal.Category}
              </Badge>
              <Badge variant="secondary" className="font-normal">
                1 {goal.Plan} plan
              </Badge>
              {goal.Tags.map((tag) => (
                <Badge key={tag} variant="outline" className="font-normal">
                  #{tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="flex w-full flex-col items-start gap-3 sm:w-auto sm:items-end">
          <div className="flex items-center gap-3">
            <div className="relative size-16">
              <svg viewBox="0 0 64 64" className="size-full -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r={RING_RADIUS}
                  fill="none"
                  strokeWidth="6"
                  className="stroke-muted"
                />
                <circle
                  cx="32"
                  cy="32"
                  r={RING_RADIUS}
                  fill="none"
                  strokeWidth="6"
                  strokeLinecap="round"
                  stroke={goal.Color}
                  strokeDasharray={RING_LENGTH}
                  strokeDashoffset={RING_LENGTH * (1 - percent / 100)}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold tabular-nums">
                {percent}%
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {done}/{total} tasks
              <br />
              due {dayjs(goal.EndAt).format("MMM D")}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={onAddTask}>
              <Plus />
              Add task
            </Button>
            <Button variant="outline" onClick={onAddResource}>
              Add resource
            </Button>
            <Button variant="outline" onClick={onSaveAsModule}>
              Save as module
            </Button>
            <Button
              variant="outline"
              size="icon"
              aria-label="Delete goal"
              className="text-destructive hover:text-destructive"
              onClick={onDelete}
            >
              <Trash2 />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

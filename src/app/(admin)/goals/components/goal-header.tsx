"use client";

import { useId } from "react";
import dayjs from "dayjs";
import { CalendarClock, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Goal } from "../interface";
import { goalProgress } from "../utils";

const RING_SIZE = 148;
const RING_STROKE = 14;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;

function ProgressRing({ goal }: { goal: Goal }) {
  const gradientId = useId();
  const { done, total, percent } = goalProgress(goal);

  return (
    <div
      className="flex items-center gap-5 rounded-2xl border p-4"
      style={{
        backgroundColor: `${goal.Color}12`,
        borderColor: `${goal.Color}40`,
      }}
    >
      <div
        className="relative shrink-0"
        style={{ width: RING_SIZE, height: RING_SIZE }}
      >
        <svg
          viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
          className="size-full -rotate-90"
          style={{ filter: `drop-shadow(0 4px 10px ${goal.Color}55)` }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={goal.Color} stopOpacity={0.55} />
              <stop offset="100%" stopColor={goal.Color} />
            </linearGradient>
          </defs>
          <circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_RADIUS}
            fill="none"
            strokeWidth={RING_STROKE}
            stroke={goal.Color}
            strokeOpacity={0.18}
          />
          <circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_RADIUS}
            fill="none"
            strokeWidth={RING_STROKE}
            strokeLinecap="round"
            stroke={`url(#${gradientId})`}
            strokeDasharray={RING_LENGTH}
            strokeDashoffset={RING_LENGTH * (1 - percent / 100)}
            className="transition-[stroke-dashoffset] duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl leading-none font-bold tracking-tight tabular-nums">
            {percent}
            <span className="text-xl font-semibold">%</span>
          </span>
          <span className="mt-1 text-xs font-medium text-muted-foreground">
            complete
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-2xl leading-none font-bold tabular-nums">
          {done}
          <span className="text-base font-medium text-muted-foreground">
            {" "}
            / {total} tasks
          </span>
        </p>
        <p
          className="flex items-center gap-1.5 text-sm font-medium"
          style={{ color: goal.Color }}
        >
          <CalendarClock className="size-4" />
          Due {dayjs(goal.EndAt).format("MMM D")}
        </p>
        <p className="text-xs text-muted-foreground">
          {Math.max(0, dayjs(goal.EndAt).diff(dayjs().startOf("day"), "day"))}{" "}
          days left
        </p>
      </div>
    </div>
  );
}

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
  return (
    <Card className="shadow-xs">
      <CardContent className="flex flex-wrap items-stretch justify-between gap-x-6 gap-y-5">
        <div className="flex min-w-0 flex-1 basis-80 flex-col justify-between gap-5">
          <div className="flex items-start gap-4">
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
              <p className="text-sm text-muted-foreground">
                {goal.Description}
              </p>
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

        <ProgressRing goal={goal} />
      </CardContent>
    </Card>
  );
}

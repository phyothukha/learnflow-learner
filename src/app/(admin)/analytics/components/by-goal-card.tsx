"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Goal } from "@/app/(admin)/goals/interface";
import { PERIOD_NOUN, type AnalyticsPeriod, type PlannedItem } from "../utils";

export interface ByGoalCardProps {
  goals: Goal[];
  items: PlannedItem[];
  period: AnalyticsPeriod;
}

export function ByGoalCard({ goals, items, period }: ByGoalCardProps) {
  const rows = goals
    .map((goal) => {
      const own = items.filter((item) => item.GoalId === goal.Id);
      return {
        goal,
        planned: own.length,
        done: own.filter((item) => item.Done).length,
      };
    })
    .filter((row) => row.planned > 0)
    .sort((a, b) => b.done / b.planned - a.done / a.planned);

  return (
    <Card className="shadow-xs">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">
          By goal this {PERIOD_NOUN.get(period)}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No goal tasks scheduled in this period.
          </p>
        ) : (
          <ul className="space-y-3">
            {rows.map(({ goal, planned, done }) => (
              <li key={goal.Id}>
                <Link
                  href={`/goals/${goal.Id}`}
                  prefetch
                  className="flex items-center gap-3 text-sm transition-opacity hover:opacity-80"
                >
                  <span
                    className="size-2 shrink-0 rounded-full"
                    style={{ backgroundColor: goal.Color }}
                  />
                  <span className="min-w-0 flex-1 truncate">{goal.Name}</span>
                  <span className="h-1.5 w-28 shrink-0 overflow-hidden rounded-full bg-muted">
                    <span
                      className="block h-full rounded-full"
                      style={{
                        width: `${(done / planned) * 100}%`,
                        backgroundColor: goal.Color,
                      }}
                    />
                  </span>
                  <span className="w-9 shrink-0 text-right text-xs font-medium tabular-nums">
                    {done}/{planned}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

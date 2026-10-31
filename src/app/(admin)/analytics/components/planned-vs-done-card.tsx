"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalyticsPeriod, type PeriodBucket, type PeriodRange } from "../utils";

export interface PlannedVsDoneCardProps {
  buckets: PeriodBucket[];
  range: PeriodRange;
  period: AnalyticsPeriod;
}

function ChartTooltip({ active, payload, label }: TooltipContentProps) {
  if (!active || !payload?.length) return null;
  const { planned, done } = payload[0].payload as PeriodBucket;
  const rate = planned ? Math.round((done / planned) * 100) : 0;

  return (
    <div className="min-w-36 space-y-1.5 rounded-lg border bg-popover p-3 text-xs text-popover-foreground shadow-md">
      <p className="font-semibold">{label}</p>
      <p className="flex items-center justify-between gap-4">
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-[3px] bg-muted-foreground/50" />
          Planned
        </span>
        <span className="font-semibold tabular-nums">{planned}</span>
      </p>
      <p className="flex items-center justify-between gap-4">
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-[3px] bg-primary" />
          Done
        </span>
        <span className="font-semibold tabular-nums">{done}</span>
      </p>
      <p className="flex items-center justify-between gap-4 border-t pt-1.5">
        <span>Completion</span>
        <span className="font-semibold text-primary tabular-nums">{rate}%</span>
      </p>
    </div>
  );
}

export function PlannedVsDoneCard({
  buckets,
  range,
  period,
}: PlannedVsDoneCardProps) {
  const rangeLabel =
    period === AnalyticsPeriod.Weekly
      ? `${range.start.format("MMM D")} – ${range.end.format("MMM D")}`
      : period === AnalyticsPeriod.Monthly
        ? range.start.format("MMMM YYYY")
        : range.start.format("YYYY");
  const showValues = buckets.length <= 12;

  return (
    <Card className="h-full shadow-xs">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium">Planned vs done</CardTitle>
        <p className="text-xs text-muted-foreground">{rangeLabel}</p>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col">
        <div className="min-h-80 flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={buckets}
              margin={{ top: 20, right: 8, left: -20 }}
              barGap={3}
            >
              <CartesianGrid
                vertical={false}
                stroke="var(--border)"
                strokeDasharray="3 3"
              />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                interval={period === AnalyticsPeriod.Monthly ? 1 : 0}
                tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
              />
              <Tooltip
                cursor={{ fill: "var(--primary)", fillOpacity: 0.08 }}
                content={ChartTooltip}
              />
              <Bar
                dataKey="planned"
                name="Planned"
                fill="var(--muted-foreground)"
                fillOpacity={0.45}
                radius={[4, 4, 0, 0]}
                maxBarSize={32}
              >
                {showValues && (
                  <LabelList
                    dataKey="planned"
                    position="top"
                    className="fill-muted-foreground text-[11px]"
                    formatter={(value) =>
                      Number(value) > 0 ? String(value) : ""
                    }
                  />
                )}
              </Bar>
              <Bar
                dataKey="done"
                name="Done"
                fill="var(--primary)"
                radius={[4, 4, 0, 0]}
                maxBarSize={32}
              >
                {showValues && (
                  <LabelList
                    dataKey="done"
                    position="top"
                    className="fill-foreground text-[11px] font-semibold"
                    formatter={(value) =>
                      Number(value) > 0 ? String(value) : ""
                    }
                  />
                )}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="size-3 rounded-[3px] bg-muted-foreground/45" />
            Planned
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-3 rounded-[3px] bg-primary" />
            Done
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

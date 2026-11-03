"use client";

import { useId } from "react";
import dayjs from "dayjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { HeatmapCell } from "../utils";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = Array.from({ length: 24 }, (_, hour) => hour);
const HOUR_LABEL_STEP = 3;

/** Share of `primary` mixed into a cell, from palest to strongest. */
const LEVEL_MIX = [35, 55, 78, 100];

function levelOf(done: number, max: number) {
  return Math.min(
    LEVEL_MIX.length - 1,
    Math.ceil((done / Math.max(max, 1)) * LEVEL_MIX.length) - 1,
  );
}

const levelColor = (mix: number) =>
  `color-mix(in oklab, var(--primary) ${mix}%, var(--card))`;

function cellColor(done: number, max: number) {
  if (done <= 0) return "var(--muted)";
  return levelColor(LEVEL_MIX[levelOf(done, max)]);
}

const hourLabel = (hour: number) => dayjs().hour(hour).format("h A");

const RING_SIZE = 160;
const RING_STROKE = 14;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;

function CompletionRing({ percent }: { percent: number }) {
  const gradientId = useId();

  return (
    <div
      className="relative shrink-0"
      style={{ width: RING_SIZE, height: RING_SIZE }}
    >
      {/* Soft primary halo so the ring reads as the card's focal point. */}
      <div className="absolute inset-3 rounded-full bg-primary/10 blur-xl" />
      <svg
        viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
        className="relative size-full -rotate-90 drop-shadow-[0_4px_12px_color-mix(in_oklab,var(--primary)_35%,transparent)]"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.55} />
            <stop offset="100%" stopColor="var(--primary)" />
          </linearGradient>
        </defs>
        <circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RING_RADIUS}
          fill="none"
          strokeWidth={RING_STROKE}
          className="stroke-primary/15"
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
        <span className="text-4xl leading-none font-bold tracking-tight text-primary tabular-nums">
          {percent}
          <span className="text-xl font-semibold">%</span>
        </span>
        <span className="mt-1.5 text-xs font-medium text-muted-foreground">
          completed
        </span>
      </div>
    </div>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="truncate text-sm font-semibold tabular-nums">{value}</p>
    </div>
  );
}

function busiestCell(cells: HeatmapCell[]) {
  return cells.reduce<HeatmapCell | null>(
    (top, cell) => (cell.done > (top?.done ?? 0) ? cell : top),
    null,
  );
}

interface HeatmapCardProps {
  cells: HeatmapCell[];
  className?: string;
}

export function ActivityHeatmapCard({ cells, className }: HeatmapCardProps) {
  const max = Math.max(...cells.map((cell) => cell.done), 0);

  return (
    <Card className={cn("min-w-0 shadow-xs", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">
          Activity by hour · last 4 weeks
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-center">
        <HourlyHeatmap cells={cells} max={max} busiest={busiestCell(cells)} />
      </CardContent>
    </Card>
  );
}

export function ActivitySummaryCard({ cells, className }: HeatmapCardProps) {
  const busiest = busiestCell(cells);
  const done = cells.reduce((sum, cell) => sum + cell.done, 0);
  const planned = cells.reduce((sum, cell) => sum + cell.planned, 0);
  const percent = planned
    ? Math.min(100, Math.round((done / planned) * 100))
    : 0;
  const activeHours = cells.filter((cell) => cell.done > 0).length;

  return (
    <Card className={cn("min-w-0 shadow-xs", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">
          Progress · last 4 weeks
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col items-center justify-center gap-5 sm:flex-row sm:gap-8 lg:flex-col lg:gap-6">
        <CompletionRing percent={percent} />
        <div className="grid w-full grid-cols-3 gap-3 text-center sm:w-auto sm:grid-cols-1 sm:text-left lg:w-full lg:grid-cols-3 lg:text-center">
          <SummaryStat label="Tasks done" value={`${done} / ${planned}`} />
          <SummaryStat label="Active hours" value={String(activeHours)} />
          <SummaryStat
            label="Peak time"
            value={
              busiest
                ? `${WEEKDAYS[busiest.weekday]} ${hourLabel(busiest.hour)}`
                : "—"
            }
          />
        </div>
      </CardContent>
    </Card>
  );
}

interface HourlyHeatmapProps {
  cells: HeatmapCell[];
  max: number;
  busiest: HeatmapCell | null;
}

function HourlyHeatmap({ cells, max, busiest }: HourlyHeatmapProps) {
  return (
    <div>
      <TooltipProvider delayDuration={0}>
        {/* 24 square columns don't fit a phone — scroll instead of squashing the cells. */}
        <div className="-mx-1 overflow-x-auto px-1 pt-1 pb-2">
          <div className="grid min-w-[30rem] grid-cols-[2.25rem_repeat(24,minmax(0,1fr))] items-center gap-1">
            <span />
            {HOURS.map((hour) => (
              <span
                key={hour}
                className="text-center text-xs text-muted-foreground"
              >
                {hour % HOUR_LABEL_STEP === 0 ? hour : ""}
              </span>
            ))}
            {WEEKDAYS.map((weekday, row) => (
              <div key={weekday} className="contents">
                <span className="text-xs font-medium text-muted-foreground">
                  {weekday}
                </span>
                {HOURS.map((hour) => {
                  const cell = cells[row * 24 + hour];
                  return (
                    <Tooltip key={hour}>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          aria-label={`${weekday} ${hourLabel(hour)}: ${cell.done} of ${cell.planned} done`}
                          className={cn(
                            "aspect-square w-full rounded-[4px] outline-none sm:rounded-[5px]",
                            cell.done === 0 && "ring-1 ring-border ring-inset",
                            cell === busiest &&
                              "ring-2 ring-foreground/70 ring-offset-1 ring-offset-card",
                            "focus-visible:ring-2 focus-visible:ring-primary",
                          )}
                          style={{
                            backgroundColor: cellColor(cell.done, max),
                          }}
                        />
                      </TooltipTrigger>
                      <TooltipContent side="top" sideOffset={6}>
                        <p className="font-semibold">
                          {weekday} · {hourLabel(hour)}
                        </p>
                        <p className="opacity-80">
                          {cell.planned === 0
                            ? "Nothing planned"
                            : `${cell.done} of ${cell.planned} done`}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </TooltipProvider>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>12 AM → 11 PM</span>
        <span className="flex items-center gap-1.5">
          Less
          <span className="size-4 rounded-[5px] bg-muted ring-1 ring-border ring-inset" />
          {LEVEL_MIX.map((mix) => (
            <span
              key={mix}
              className="size-4 rounded-[5px]"
              style={{ backgroundColor: levelColor(mix) }}
            />
          ))}
          More
        </span>
      </div>
    </div>
  );
}

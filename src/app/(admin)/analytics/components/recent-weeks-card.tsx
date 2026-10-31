"use client";

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

export function RecentWeeksCard({ cells }: { cells: HeatmapCell[] }) {
  const max = Math.max(...cells.map((cell) => cell.done), 0);
  const busiest = cells.reduce<HeatmapCell | null>(
    (top, cell) => (cell.done > (top?.done ?? 0) ? cell : top),
    null,
  );

  return (
    <Card className="shadow-xs">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium">
          Activity by hour · last 4 weeks
        </CardTitle>
        {busiest && (
          <p className="text-xs text-muted-foreground">
            Most productive:{" "}
            <span className="font-medium text-foreground">
              {WEEKDAYS[busiest.weekday]} {hourLabel(busiest.hour)}
            </span>
          </p>
        )}
      </CardHeader>
      <CardContent>
        <TooltipProvider delayDuration={0}>
          <div className="grid grid-cols-[2.5rem_repeat(24,minmax(0,1fr))] items-center gap-1.5">
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
                            "h-7 w-full rounded-md outline-none",
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
        </TooltipProvider>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
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
      </CardContent>
    </Card>
  );
}

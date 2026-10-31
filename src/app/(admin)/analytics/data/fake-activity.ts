import dayjs from "dayjs";
import type { PlannedItem } from "../utils";

const HISTORY_DAYS = 400;

/** Stable 0–1 value for a day, so the sample history never flickers. */
function unit(day: dayjs.Dayjs, salt: number) {
  let hash = salt;
  for (const char of day.format("YYYY-MM-DD")) {
    hash = (hash * 31 + char.charCodeAt(0)) % 9973;
  }
  return (hash % 1000) / 1000;
}

/**
 * Sample past activity so charts have something to show before a backend
 * exists. Only days before `before` are generated; real items cover the rest.
 */
export function createFakeActivity(before: dayjs.Dayjs): PlannedItem[] {
  const items: PlannedItem[] = [];

  for (let offset = 1; offset <= HISTORY_DAYS; offset += 1) {
    const day = before.startOf("day").subtract(offset, "day");
    const weekend = day.day() === 0 || day.day() === 6;
    const planned = weekend
      ? 1 + Math.floor(unit(day, 7) * 3)
      : 2 + Math.floor(unit(day, 7) * 5);
    const skipped = unit(day, 13) < 0.08;
    const done = skipped
      ? 0
      : Math.round(planned * (0.5 + unit(day, 29) * 0.5));

    for (let index = 0; index < planned; index += 1) {
      items.push({
        At: day.hour(7 + Math.floor(unit(day, 101 + index) * 15)),
        Done: index < done,
        GoalId: null,
      });
    }
  }

  return items;
}

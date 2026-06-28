import dayjs, { type Dayjs } from "dayjs";

import type { CalendarView, DateInput, WeekStart } from "./types";

/** Start of the week containing `date`, honoring `weekStartsOn`. */
export function startOfWeek(date: DateInput, weekStartsOn: WeekStart = 1): Dayjs {
  const d = dayjs(date).startOf("day");
  const diff = (d.day() - weekStartsOn + 7) % 7;
  return d.subtract(diff, "day");
}

/** The 7 days of the week containing `date`. */
export function weekDays(date: DateInput, weekStartsOn: WeekStart = 1): Dayjs[] {
  const start = startOfWeek(date, weekStartsOn);
  return Array.from({ length: 7 }, (_, i) => start.add(i, "day"));
}

/**
 * The month matrix containing `date`: an array of weeks, each a 7-day row.
 * Leading/trailing days from adjacent months are included so every row is full.
 */
export function monthMatrix(date: DateInput, weekStartsOn: WeekStart = 1): Dayjs[][] {
  const monthStart = dayjs(date).startOf("month");
  const monthEnd = dayjs(date).endOf("month");
  const gridStart = startOfWeek(monthStart, weekStartsOn);

  const weeks: Dayjs[][] = [];
  let cursor = gridStart;
  // Build full weeks until we've covered the last day of the month.
  while (cursor.isBefore(monthEnd) || cursor.isSame(monthEnd, "day") || weeks.length === 0) {
    const row = Array.from({ length: 7 }, (_, i) => cursor.add(i, "day"));
    weeks.push(row);
    cursor = cursor.add(7, "day");
    if (cursor.isAfter(monthEnd, "day") && cursor.day() === weekStartsOn) break;
  }
  return weeks;
}

/** Days to render for a view: day -> [[d]], week -> [[7]], month -> weeks. */
export function viewDays(
  view: CalendarView,
  anchor: DateInput,
  weekStartsOn: WeekStart = 1,
): Dayjs[][] {
  if (view === "day") return [[dayjs(anchor).startOf("day")]];
  if (view === "week") return [weekDays(anchor, weekStartsOn)];
  return monthMatrix(anchor, weekStartsOn);
}

/** The visible date span [start, end] for a view (used to query events). */
export function viewRange(
  view: CalendarView,
  anchor: DateInput,
  weekStartsOn: WeekStart = 1,
): { start: Dayjs; end: Dayjs } {
  const days = viewDays(view, anchor, weekStartsOn);
  const first = days[0][0];
  const lastRow = days[days.length - 1];
  const last = lastRow[lastRow.length - 1];
  return { start: first.startOf("day"), end: last.endOf("day") };
}

/** Step the anchor date forward/back by one view unit. */
export function stepAnchor(
  view: CalendarView,
  anchor: DateInput,
  direction: -1 | 1,
): Dayjs {
  const unit = view === "day" ? "day" : view === "week" ? "week" : "month";
  return dayjs(anchor).add(direction, unit);
}

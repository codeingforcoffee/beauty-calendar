import dayjs, { type Dayjs } from "dayjs";

import type { CalendarEvent, DateInput } from "./types";

/** A horizontal event bar within a single month week-row. */
export interface MonthBar {
  event: CalendarEvent;
  /** Column the bar starts at within the week (0-6). */
  startCol: number;
  /** Number of columns the bar spans (1-7). */
  span: number;
  /** Vertical lane (row) the bar occupies within the cells. */
  lane: number;
  /** True when the event's real start is on/after this week's first day. */
  isStart: boolean;
  /** True when the event's real end is on/before this week's last day. */
  isEnd: boolean;
}

const isCrossDay = (ev: CalendarEvent) => !dayjs(ev.startTime).isSame(dayjs(ev.endTime), "day");

/**
 * Sort for month bars (matches seagull): multi-day events first so they take the
 * top lanes and span cleanly, then by start time, then longer-first.
 */
export function monthBarSort(a: CalendarEvent, b: CalendarEvent): number {
  const ac = isCrossDay(a);
  const bc = isCrossDay(b);
  if (ac !== bc) return ac ? -1 : 1;
  if (a.startTime !== b.startTime) return a.startTime - b.startTime;
  return b.endTime - b.startTime - (a.endTime - a.startTime);
}

/** Column index (0-6) of a timestamp within a week, clamped to the week. */
function columnOf(time: DateInput, weekStart: Dayjs, isEnd: boolean): number {
  let day = dayjs(time).startOf("day");
  // An end exactly at midnight belongs to the previous day, not the next column.
  if (isEnd && dayjs(time).isSame(dayjs(time).startOf("day"))) {
    day = day.subtract(1, "day");
  }
  const diff = day.diff(weekStart, "day");
  return Math.min(6, Math.max(0, diff));
}

/**
 * Lay out the events intersecting a single week as horizontal spanning bars,
 * packing overlapping bars into stacked lanes.
 */
export function layoutMonthWeek(
  week: Dayjs[],
  events: CalendarEvent[],
): { bars: MonthBar[]; laneCount: number } {
  const weekStart = week[0].startOf("day");
  const weekStartMs = weekStart.valueOf();
  const weekEndMs = week[6].endOf("day").valueOf();

  const inWeek = events
    .filter((ev) => ev.startTime <= weekEndMs && ev.endTime >= weekStartMs)
    .slice()
    .sort(monthBarSort);

  const lanes: Array<Array<[number, number]>> = [];
  const bars: MonthBar[] = [];

  for (const ev of inWeek) {
    const startCol = columnOf(ev.startTime, weekStart, false);
    const endCol = columnOf(ev.endTime, weekStart, true);

    let lane = 0;
    for (;;) {
      const occupied = lanes[lane] ?? (lanes[lane] = []);
      const overlaps = occupied.some(([s, e]) => !(endCol < s || startCol > e));
      if (!overlaps) {
        occupied.push([startCol, endCol]);
        break;
      }
      lane++;
    }

    bars.push({
      event: ev,
      startCol,
      span: endCol - startCol + 1,
      lane,
      isStart: ev.startTime >= weekStartMs,
      isEnd: ev.endTime <= weekEndMs,
    });
  }

  return { bars, laneCount: lanes.length };
}

import dayjs from "dayjs";

import { MIN_EVENT_MINUTES, MINUTES_PER_HOUR } from "./constants";
import type { TimeGeometry } from "./time";
import type { CalendarEvent, DateInput, PositionedEvent } from "./types";

/**
 * Sort comparator (Google-Calendar style):
 * earlier start first; on a tie, the longer event first so it takes the left lane.
 */
export function compareEvents(a: CalendarEvent, b: CalendarEvent): number {
  if (a.startTime !== b.startTime) return a.startTime - b.startTime;
  return b.endTime - a.endTime;
}

interface Interval {
  start: number;
  end: number;
}

/**
 * Greedy interval-partitioning into lanes.
 * Returns, for every input interval, its lane index and the total lane count of
 * the overlap cluster it belongs to (used to compute width).
 */
function packLanes(intervals: Interval[]): { lane: number; lanes: number }[] {
  const result: { lane: number; lanes: number }[] = intervals.map(() => ({ lane: 0, lanes: 1 }));

  let group: number[] = [];
  let columnEnds: number[] = [];
  let groupMaxEnd = -Infinity;

  const flush = () => {
    const lanes = columnEnds.length || 1;
    group.forEach((idx) => {
      result[idx].lanes = lanes;
    });
    group = [];
    columnEnds = [];
    groupMaxEnd = -Infinity;
  };

  intervals.forEach((interval, idx) => {
    // No overlap with anything in the current cluster -> close it out.
    if (interval.start >= groupMaxEnd) flush();

    let lane = columnEnds.findIndex((end) => end <= interval.start);
    if (lane === -1) {
      lane = columnEnds.length;
      columnEnds.push(interval.end);
    } else {
      columnEnds[lane] = interval.end;
    }

    result[idx].lane = lane;
    group.push(idx);
    groupMaxEnd = Math.max(groupMaxEnd, interval.end);
  });

  flush();
  return result;
}

/**
 * Lay out the events that touch `day` into pixel-positioned blocks.
 * Multi-day events are clipped to the day's [00:00, 24:00] window and flagged
 * with `continuesBefore` / `continuesAfter`.
 */
export function layoutDay(
  day: DateInput,
  events: CalendarEvent[],
  geometry: TimeGeometry,
): PositionedEvent[] {
  const dayStart = dayjs(day).startOf("day");
  const dayEnd = dayStart.add(1, "day");
  const minHeight = (MIN_EVENT_MINUTES / MINUTES_PER_HOUR) * geometry.hourHeight;

  const touching = events
    .filter((ev) => ev.startTime < dayEnd.valueOf() && ev.endTime > dayStart.valueOf())
    .slice()
    .sort(compareEvents);

  const intervals: Interval[] = touching.map((ev) => {
    const top = Math.max(0, geometry.dateToY(Math.max(ev.startTime, dayStart.valueOf())));
    const rawBottom = ev.endTime >= dayEnd.valueOf() ? geometry.dayHeight : geometry.dateToY(ev.endTime);
    const bottom = Math.max(rawBottom, top + minHeight);
    return { start: top, end: bottom };
  });

  const packed = packLanes(intervals);

  return touching.map((ev, i) => ({
    event: ev,
    top: intervals[i].start,
    height: intervals[i].end - intervals[i].start,
    lane: packed[i].lane,
    lanes: packed[i].lanes,
    continuesBefore: ev.startTime < dayStart.valueOf(),
    continuesAfter: ev.endTime > dayEnd.valueOf(),
  }));
}

/** Events that intersect a given day (used by month cells & day columns). */
export function eventsOnDay(day: DateInput, events: CalendarEvent[]): CalendarEvent[] {
  const start = dayjs(day).startOf("day").valueOf();
  const end = dayjs(day).endOf("day").valueOf();
  return events
    .filter((ev) => ev.startTime <= end && ev.endTime >= start)
    .slice()
    .sort(compareEvents);
}

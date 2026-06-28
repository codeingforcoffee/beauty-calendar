import dayjs from "dayjs";

import {
  DEFAULT_HOUR_HEIGHT,
  DEFAULT_SNAP_MINUTES,
  MINUTES_PER_DAY,
  MINUTES_PER_HOUR,
} from "./constants";
import type { DateInput } from "./types";

export interface HourMinute {
  hour: number;
  minute: number;
}

/**
 * A small, pure geometry helper that converts between time and vertical pixels.
 * Created once per calendar instance so `hourHeight` / `snapMinutes` stay configurable
 * without any module-level global state.
 */
export interface TimeGeometry {
  readonly hourHeight: number;
  readonly snapMinutes: number;
  /** Full height of a 24h day column. */
  readonly dayHeight: number;
  /** minutes-from-midnight -> pixels */
  minutesToY(minutes: number): number;
  /** pixels -> minutes-from-midnight (unsnapped) */
  yToMinutes(y: number): number;
  /** pixels -> minutes-from-midnight, snapped to the grid */
  yToSnappedMinutes(y: number): number;
  /** a date's wall-clock time -> pixels from the top of its day column */
  dateToY(date: DateInput): number;
  /** snap a pixel offset to the nearest grid line */
  snapY(y: number): number;
  /** minutes-from-midnight -> { hour, minute } */
  minutesToHourMinute(minutes: number): HourMinute;
}

function clampMinutes(minutes: number): number {
  return Math.max(0, Math.min(MINUTES_PER_DAY, minutes));
}

export function createGeometry(
  hourHeight: number = DEFAULT_HOUR_HEIGHT,
  snapMinutes: number = DEFAULT_SNAP_MINUTES,
): TimeGeometry {
  const dayHeight = hourHeight * 24;
  const pxPerMinute = hourHeight / MINUTES_PER_HOUR;

  const minutesToY = (minutes: number) => clampMinutes(minutes) * pxPerMinute;
  const yToMinutes = (y: number) => clampMinutes(y / pxPerMinute);

  const snapMinute = (minutes: number) =>
    clampMinutes(Math.round(minutes / snapMinutes) * snapMinutes);

  return {
    hourHeight,
    snapMinutes,
    dayHeight,
    minutesToY,
    yToMinutes,
    yToSnappedMinutes: (y: number) => snapMinute(yToMinutes(y)),
    snapY: (y: number) => minutesToY(snapMinute(yToMinutes(y))),
    dateToY: (date: DateInput) => {
      const d = dayjs(date);
      return minutesToY(d.hour() * MINUTES_PER_HOUR + d.minute());
    },
    minutesToHourMinute: (minutes: number) => {
      const m = clampMinutes(minutes);
      return { hour: Math.floor(m / MINUTES_PER_HOUR), minute: Math.round(m % MINUTES_PER_HOUR) };
    },
  };
}

/** Apply `{ hour, minute }` to a given day, returning epoch ms. */
export function applyTimeToDay(day: DateInput, hm: HourMinute): number {
  return dayjs(day).startOf("day").hour(hm.hour).minute(hm.minute).second(0).millisecond(0).valueOf();
}

/** Snap an epoch timestamp to the nearest `snapMinutes` boundary. */
export function snapTime(time: DateInput, snapMinutes = DEFAULT_SNAP_MINUTES): number {
  const d = dayjs(time);
  const minutes = d.hour() * MINUTES_PER_HOUR + d.minute();
  const snapped = Math.round(minutes / snapMinutes) * snapMinutes;
  return d.startOf("day").add(snapped, "minute").valueOf();
}

export function isSameDay(a: DateInput, b: DateInput): boolean {
  return dayjs(a).isSame(dayjs(b), "day");
}

/**
 * Minutes-from-midnight of the next `step`-aligned boundary at/after `date`.
 * Mirrors seagull's `getNearestStepMinTime` — the default start time used when
 * creating an event in month view (current time rounded up to the grid step).
 */
export function nearestStepMinutes(date: DateInput, step = DEFAULT_SNAP_MINUTES): number {
  const d = dayjs(date);
  const remainder = d.minute() % step;
  const add = remainder === 0 ? 0 : step - remainder;
  const t = d.add(add, "minute");
  return t.hour() * MINUTES_PER_HOUR + t.minute();
}

/** True when `day` falls within `[start, end]` at day granularity (inclusive). */
export function dayWithin(day: DateInput, start: DateInput, end: DateInput): boolean {
  const d = dayjs(day).startOf("day");
  return !d.isBefore(dayjs(start).startOf("day")) && !d.isAfter(dayjs(end).startOf("day"));
}

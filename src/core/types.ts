import type { Dayjs } from "dayjs";

/** Anything dayjs can parse. */
export type DateInput = number | string | Date | Dayjs;

/**
 * The minimal schedule shape this library renders.
 * Intentionally tiny and business-agnostic — extend it freely via the index signature.
 */
export interface CalendarEvent {
  /** Stable unique id, used for keying and update/move callbacks. */
  id: string;
  /** Display title. */
  title: string;
  /** Start time, epoch milliseconds. */
  startTime: number;
  /** End time, epoch milliseconds. */
  endTime: number;
  /** Optional creator label (name / id). Shown as meta in the event block. */
  creator?: string;
  /** Optional explicit accent color (CSS color). Falls back to the theme accent. */
  color?: string;
  /** Escape hatch for consumer-specific fields. */
  [key: string]: unknown;
}

/** A freshly-dragged, not-yet-persisted event (id optional). */
export interface DraftEvent {
  id?: string;
  title: string;
  startTime: number;
  endTime: number;
  creator?: string;
  color?: string;
  [key: string]: unknown;
}

export type CalendarView = "day" | "week" | "month";

/** Which weekday a week starts on. 0 = Sunday, 1 = Monday. */
export type WeekStart = 0 | 1;

/** An event placed on the time grid, with computed geometry. */
export interface PositionedEvent {
  event: CalendarEvent;
  /** Pixel offset from the top of the day column. */
  top: number;
  /** Pixel height of the block. */
  height: number;
  /** Column index inside its overlap cluster. */
  lane: number;
  /** Total columns in its overlap cluster (for width). */
  lanes: number;
  /** True when the event starts on a previous day (clipped at top). */
  continuesBefore: boolean;
  /** True when the event ends on a later day (clipped at bottom). */
  continuesAfter: boolean;
}

/** One day-column rectangle of a (possibly multi-day) drag-create gesture. */
export interface CreateSegment {
  dayIndex: number;
  top: number;
  height: number;
}

/** The live drag-create preview: one or more day segments + the resolved range. */
export interface CreateDraft {
  /** Pixel rectangles per spanned day column, ordered start → end. */
  segments: CreateSegment[];
  startTime: number;
  endTime: number;
}

export interface TimeRange {
  startTime: number;
  endTime: number;
}

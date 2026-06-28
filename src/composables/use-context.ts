import { inject, type ComputedRef, type InjectionKey, type Ref } from "vue";
import type { Dayjs } from "dayjs";

import type { TimeGeometry } from "@/core/time";
import type {
  CalendarEvent,
  CalendarView,
  DateInput,
  DraftEvent,
  TimeRange,
  WeekStart,
} from "@/core/types";
import type { LocaleMessages } from "@/i18n";

export interface CalendarConfig {
  hourHeight: number;
  snapMinutes: number;
  minEventMinutes: number;
  defaultCreateMinutes: number;
  /** Allow moving / resizing existing events. */
  editable: boolean;
  /** Allow drag-to-create on empty grid space. */
  creatable: boolean;
  /** Allow deleting events via the right-click menu. */
  deletable: boolean;
}

/** Shared state + actions handed down from <BeautyCalendar> to every child. */
export interface CalendarContext {
  view: Ref<CalendarView>;
  anchor: Ref<Dayjs>;
  weekStart: Ref<WeekStart>;
  now: Ref<Dayjs>;
  geometry: ComputedRef<TimeGeometry>;
  days: ComputedRef<Dayjs[][]>;
  events: ComputedRef<CalendarEvent[]>;
  messages: ComputedRef<LocaleMessages>;
  config: ComputedRef<CalendarConfig>;

  setView(view: CalendarView): void;
  setAnchor(date: DateInput): void;
  goToday(): void;
  go(direction: -1 | 1): void;

  /**
   * A drag-create gesture finished. Opens the confirm dialog (anchored near the
   * release point) unless confirmation is disabled, in which case it commits.
   */
  requestCreate(range: TimeRange, anchor?: { x: number; y: number }): void;
  /** A move / resize gesture finished — ask the host to persist new times. */
  requestUpdate(id: string, range: TimeRange): void;
  /** Remove an event (from the context menu). */
  requestDelete(id: string): void;
  /** Open the right-click event menu at a screen position. */
  openEventMenu(event: CalendarEvent, anchor: { x: number; y: number }): void;
  /** An event block was clicked (no drag). */
  emitEventClick(event: CalendarEvent): void;
  /** A day header / month cell date was clicked. */
  emitDateClick(date: Dayjs): void;

  /** Resolve the accent color used to paint an event. */
  eventColor(event: CalendarEvent | DraftEvent): string;
  /** Format a timestamp as a clock label, honoring the locale's hour12 flag. */
  formatTime(date: DateInput): string;
}

export const CALENDAR_CONTEXT: InjectionKey<CalendarContext> = Symbol("beauty-calendar");

export function useCalendar(): CalendarContext {
  const ctx = inject(CALENDAR_CONTEXT);
  if (!ctx) {
    throw new Error("[beauty-calendar] component must be used inside <BeautyCalendar>.");
  }
  return ctx;
}

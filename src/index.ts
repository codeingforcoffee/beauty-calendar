import type { App } from "vue";

import BeautyCalendar from "./components/BeautyCalendar.vue";

// Component
export { BeautyCalendar };
export default BeautyCalendar;

/** Vue plugin: `app.use(BeautyCalendarPlugin)` registers <BeautyCalendar> globally. */
export const BeautyCalendarPlugin = {
  install(app: App) {
    app.component("BeautyCalendar", BeautyCalendar);
  },
};

// Types
export type {
  CalendarEvent,
  DraftEvent,
  CalendarView,
  WeekStart,
  DateInput,
  PositionedEvent,
  CreateDraft,
  TimeRange,
} from "./core/types";

// Core helpers (advanced / headless usage)
export { createGeometry, isSameDay, snapTime, applyTimeToDay, nearestStepMinutes } from "./core/time";
export type { TimeGeometry } from "./core/time";
export { layoutDay, eventsOnDay, compareEvents } from "./core/layout";
export { layoutMonthWeek, monthBarSort } from "./core/month-layout";
export type { MonthBar } from "./core/month-layout";
export { viewDays, weekDays, monthMatrix, viewRange, stepAnchor } from "./core/grid";
export { formatDate, formatClock } from "./core/format";

// Theme
export { themePresets, themeVars, findTheme, DEFAULT_THEME } from "./theme/themes";
export type { ThemePreset, ColorScheme } from "./theme/themes";
export { eventPalette, colorFor } from "./theme/palette";

// i18n
export {
  builtinLocales,
  resolveMessages,
  interpolate,
  DEFAULT_LOCALE,
  zhCN,
  zhTW,
  en,
  ja,
} from "./i18n";
export type { LocaleMessages, LocaleKey } from "./i18n";

// Context (for building custom sub-components)
export { useCalendar } from "./composables/use-context";
export type { CalendarContext, CalendarConfig } from "./composables/use-context";

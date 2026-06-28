<template>
  <div class="beauty-calendar" :data-scheme="scheme" :style="rootStyle">
    <CalendarHeader />
    <div class="bc-body">
      <MonthView v-if="view === 'month'" />
      <DayWeekView v-else />
    </div>

    <CreateConfirmDialog
      v-if="pendingCreate"
      :range="pendingCreate.range"
      :anchor="pendingCreate.anchor"
      :creator="currentUser"
      @confirm="commitCreate"
      @cancel="pendingCreate = null"
    />

    <EventContextMenu
      v-if="contextMenu"
      :event="contextMenu.event"
      :anchor="contextMenu.anchor"
      @delete="onMenuDelete"
      @close="contextMenu = null"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, provide, ref, type CSSProperties } from "vue";
import dayjs, { type Dayjs } from "dayjs";
import { useNow } from "@vueuse/core";

import CalendarHeader from "./CalendarHeader.vue";
import DayWeekView from "./views/DayWeekView.vue";
import MonthView from "./views/MonthView.vue";
import CreateConfirmDialog from "./event/CreateConfirmDialog.vue";
import EventContextMenu from "./event/EventContextMenu.vue";

import { createGeometry } from "@/core/time";
import { viewDays, stepAnchor } from "@/core/grid";
import { genId } from "@/core/id";
import { formatClock } from "@/core/format";
import {
  DEFAULT_HOUR_HEIGHT,
  DEFAULT_SNAP_MINUTES,
  DEFAULT_CREATE_MINUTES,
  MIN_EVENT_MINUTES,
} from "@/core/constants";
import type {
  CalendarEvent,
  CalendarView,
  DateInput,
  DraftEvent,
  TimeRange,
  WeekStart,
} from "@/core/types";
import { DEFAULT_LOCALE, resolveMessages, type LocaleMessages } from "@/i18n";
import { themeVars, type ColorScheme } from "@/theme/themes";
import { colorFor } from "@/theme/palette";
import { CALENDAR_CONTEXT, type CalendarConfig, type CalendarContext } from "@/composables/use-context";
import "@/styles/index.scss";

const props = withDefaults(
  defineProps<{
    /** Accent theme: a preset key (e.g. "aurora") or an explicit color pair. */
    theme?: string | { accent: string; accent2: string };
    /** Color scheme. */
    scheme?: ColorScheme;
    /** 0 = week starts Sunday, 1 = Monday. */
    weekStart?: WeekStart;
    /** Pixel height of one hour row. */
    hourHeight?: number;
    /** Grid snapping granularity in minutes. */
    snapMinutes?: number;
    /** Minimum rendered event duration in minutes. */
    minEventMinutes?: number;
    /** Default duration for a click-create with no drag. */
    defaultCreateMinutes?: number;
    /** Allow moving / resizing events. */
    editable?: boolean;
    /** Allow drag-to-create. */
    creatable?: boolean;
    /** Allow deleting events via the right-click menu. */
    deletable?: boolean;
    /** Show a confirm dialog after a drag-create instead of committing instantly. */
    confirmCreate?: boolean;
    /** Creator label stamped on newly created events. */
    currentUser?: string;
    /** Per-locale message overrides. */
    messages?: Partial<Record<string, Partial<LocaleMessages>>>;
    /** How often (ms) the "now" indicator ticks. */
    nowInterval?: number;
  }>(),
  {
    theme: "aurora",
    scheme: "dark",
    weekStart: 1,
    hourHeight: DEFAULT_HOUR_HEIGHT,
    snapMinutes: DEFAULT_SNAP_MINUTES,
    minEventMinutes: MIN_EVENT_MINUTES,
    defaultCreateMinutes: DEFAULT_CREATE_MINUTES,
    editable: true,
    creatable: true,
    deletable: true,
    confirmCreate: true,
    currentUser: undefined,
    messages: undefined,
    nowInterval: 30000,
  },
);

const emit = defineEmits<{
  (e: "event-create", event: CalendarEvent): void;
  (e: "event-update", payload: { id: string } & TimeRange): void;
  (e: "event-delete", event: CalendarEvent): void;
  (e: "event-click", event: CalendarEvent): void;
  (e: "date-click", date: Dayjs): void;
}>();

const events = defineModel<CalendarEvent[]>("events", { default: () => [] });
const view = defineModel<CalendarView>("view", { default: "week" });
const date = defineModel<DateInput>("date", { default: () => Date.now() });
const locale = defineModel<string>("locale", { default: DEFAULT_LOCALE });

const anchor = computed(() => dayjs(date.value));
const nowDate = useNow({ interval: props.nowInterval });
const now = computed(() => dayjs(nowDate.value));

const geometry = computed(() => createGeometry(props.hourHeight, props.snapMinutes));
const messages = computed(() => resolveMessages(locale.value, props.messages));
const weekStart = computed(() => props.weekStart);
const days = computed(() => viewDays(view.value, anchor.value, props.weekStart));

const config = computed<CalendarConfig>(() => ({
  hourHeight: props.hourHeight,
  snapMinutes: props.snapMinutes,
  minEventMinutes: props.minEventMinutes,
  defaultCreateMinutes: props.defaultCreateMinutes,
  editable: props.editable,
  creatable: props.creatable,
  deletable: props.deletable,
}));

function eventColor(event: CalendarEvent | DraftEvent): string {
  if (event.color) return event.color;
  const seed = String(event.creator ?? event.id ?? event.title ?? "");
  return seed ? colorFor(seed) : "var(--bc-accent)";
}

// Pending drag-create awaiting confirmation in the dialog.
const pendingCreate = ref<{ range: TimeRange; anchor: { x: number; y: number } } | null>(null);
// Right-click event menu state.
const contextMenu = ref<{ event: CalendarEvent; anchor: { x: number; y: number } } | null>(null);

function deleteEvent(id: string) {
  const removed = events.value.find((e) => e.id === id);
  events.value = events.value.filter((e) => e.id !== id);
  if (removed) emit("event-delete", removed);
}

function onMenuDelete() {
  if (contextMenu.value) deleteEvent(contextMenu.value.event.id);
  contextMenu.value = null;
}

function commit(range: TimeRange, title: string) {
  const created: CalendarEvent = {
    id: genId(),
    title,
    startTime: range.startTime,
    endTime: range.endTime,
    creator: props.currentUser,
  };
  events.value = [...events.value, created];
  emit("event-create", created);
}

function commitCreate(title: string) {
  if (!pendingCreate.value) return;
  commit(pendingCreate.value.range, title);
  pendingCreate.value = null;
}

const context: CalendarContext = {
  view,
  anchor,
  weekStart,
  now,
  geometry,
  days,
  events: computed(() => events.value),
  messages,
  config,
  setView: (v) => (view.value = v),
  setAnchor: (d) => (date.value = dayjs(d).valueOf()),
  goToday: () => (date.value = Date.now()),
  go: (dir) => (date.value = stepAnchor(view.value, anchor.value, dir).valueOf()),
  requestCreate: (range, anchorPos) => {
    if (props.confirmCreate) {
      pendingCreate.value = {
        range,
        anchor: anchorPos ?? { x: window.innerWidth / 2, y: window.innerHeight / 2 },
      };
    } else {
      commit(range, messages.value.untitled);
    }
  },
  requestUpdate: (id, range) => {
    events.value = events.value.map((e) =>
      e.id === id ? { ...e, startTime: range.startTime, endTime: range.endTime } : e,
    );
    emit("event-update", { id, ...range });
  },
  requestDelete: (id) => deleteEvent(id),
  openEventMenu: (event, anchorPos) => {
    if (props.deletable) contextMenu.value = { event, anchor: anchorPos };
  },
  emitEventClick: (e) => emit("event-click", e),
  emitDateClick: (d) => emit("date-click", d),
  eventColor,
  formatTime: (d) => formatClock(d, messages.value),
};

provide(CALENDAR_CONTEXT, context);

const rootStyle = computed<CSSProperties>(() => ({
  ...themeVars(props.theme),
  "--bc-hour-height": `${props.hourHeight}px`,
}));
</script>

<style scoped lang="scss">
.bc-body {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
</style>

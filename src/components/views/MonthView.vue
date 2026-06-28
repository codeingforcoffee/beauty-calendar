<template>
  <div class="bc-month">
    <div class="bc-month__weekdays">
      <div v-for="(label, i) in weekdayLabels" :key="i" class="bc-month__wd">{{ label }}</div>
    </div>

    <div ref="bodyEl" class="bc-month__body">
      <div v-for="(wk, wi) in renderWeeks" :key="wi" class="bc-month__row">
        <!-- day cells: backgrounds, numbers, drag-create handlers, overflow -->
        <div class="bc-month__cells">
          <div
            v-for="(day, ci) in wk.week"
            :key="day.valueOf()"
            class="bc-cell"
            :class="{
              today: isToday(day),
              'other-month': !isCurrentMonth(day),
              weekend: isWeekend(day),
              selecting: isSelecting(day),
            }"
            @pointerdown="onCellDown(day)"
            @pointerenter="onCellEnter(day)"
          >
            <div class="bc-cell__head">
              <button
                class="bc-cell__num"
                type="button"
                @pointerdown.stop
                @click.stop="onDayNumberClick(day)"
              >
                {{ day.date() }}
              </button>
            </div>
            <button
              v-if="wk.overflowByCol[ci] > 0"
              class="bc-cell__more"
              type="button"
              @pointerdown.stop
              @click.stop="onDayNumberClick(day)"
            >
              {{ moreLabel(wk.overflowByCol[ci]) }}
            </button>
          </div>
        </div>

        <!-- spanning event bars + drag ghost -->
        <div class="bc-month__bars">
          <button
            v-for="(bar, bi) in wk.visibleBars"
            :key="bar.event.id + '-' + bi"
            class="bc-bar"
            :class="{ 'no-head': !bar.isStart, 'no-tail': !bar.isEnd }"
            :style="barStyle(bar)"
            type="button"
            @pointerdown.stop
            @click.stop="ctx.emitEventClick(bar.event)"
            @contextmenu.prevent.stop="ctx.openEventMenu(bar.event, { x: $event.clientX, y: $event.clientY })"
          >
            <span v-if="bar.isStart" class="bc-bar__time">{{ ctx.formatTime(bar.event.startTime) }}</span>
            <span class="bc-bar__title">{{ bar.event.title || m.untitled }}</span>
          </button>

          <div
            v-for="(g, gi) in ghostBars(wi)"
            :key="'ghost-' + gi"
            class="bc-bar bc-bar--ghost"
            :class="{ 'no-head': !g.isStart }"
            :style="ghostStyle(g)"
          >
            <span v-if="g.isStart" class="bc-bar__title">{{ m.createNew }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, type CSSProperties } from "vue";
import type { Dayjs } from "dayjs";
import { useElementBounding, useEventListener } from "@vueuse/core";

import { useCalendar } from "@/composables/use-context";
import { layoutMonthWeek, type MonthBar } from "@/core/month-layout";
import { nearestStepMinutes } from "@/core/time";
import { MINUTES_PER_DAY } from "@/core/constants";
import { interpolate } from "@/i18n";

const ctx = useCalendar();
const m = computed(() => ctx.messages.value);

const weeks = computed(() => ctx.days.value);

const weekdayLabels = computed(() =>
  Array.from({ length: 7 }, (_, i) => m.value.weekdaysShort[(ctx.weekStart.value + i) % 7]),
);

// --- bar geometry ---
const HEADER = 30; // px reserved for the day-number row
const STRIDE = 22; // px per bar lane (bar + gap)
const BAR_HEIGHT = 20;
const PAD = 6;

const bodyEl = ref<HTMLElement>();
const { height: bodyHeight } = useElementBounding(bodyEl);
const capacity = computed(() => {
  const rows = Math.max(1, weeks.value.length);
  const rowHeight = bodyHeight.value / rows;
  return Math.max(1, Math.floor((rowHeight - HEADER - PAD) / STRIDE));
});

const weekLayouts = computed(() =>
  weeks.value.map((week) => ({ week, ...layoutMonthWeek(week, ctx.events.value) })),
);

const renderWeeks = computed(() => {
  const cap = capacity.value;
  return weekLayouts.value.map(({ week, bars }) => {
    const totalByCol = new Array(7).fill(0);
    bars.forEach((b) => {
      for (let c = b.startCol; c < b.startCol + b.span; c++) totalByCol[c]++;
    });
    const anyOverflow = totalByCol.some((t) => t > cap);
    const visibleLanes = anyOverflow ? Math.max(1, cap - 1) : cap;
    const visibleBars = bars.filter((b) => b.lane < visibleLanes);

    const visByCol = new Array(7).fill(0);
    visibleBars.forEach((b) => {
      for (let c = b.startCol; c < b.startCol + b.span; c++) visByCol[c]++;
    });
    const overflowByCol = totalByCol.map((t, c) => Math.max(0, t - visByCol[c]));
    return { week, visibleBars, overflowByCol };
  });
});

function barStyle(bar: MonthBar): CSSProperties {
  return {
    left: `calc(${(bar.startCol / 7) * 100}% + 4px)`,
    width: `calc(${(bar.span / 7) * 100}% - 8px)`,
    top: `${HEADER + bar.lane * STRIDE}px`,
    height: `${BAR_HEIGHT}px`,
    "--bc-event-accent": ctx.eventColor(bar.event),
  } as CSSProperties;
}

function moreLabel(n: number): string {
  return interpolate(m.value.more, { n });
}

function isToday(day: Dayjs): boolean {
  return day.isSame(ctx.now.value, "day");
}
function isCurrentMonth(day: Dayjs): boolean {
  return day.isSame(ctx.anchor.value, "month");
}
function isWeekend(day: Dayjs): boolean {
  const d = day.day();
  return d === 0 || d === 6;
}

function onDayNumberClick(day: Dayjs) {
  ctx.setAnchor(day);
  ctx.setView("day");
  ctx.emitDateClick(day);
}

// --- drag-to-create across day cells ---
const selection = ref<{ start: Dayjs; end: Dayjs } | null>(null);

const range = computed(() => {
  if (!selection.value) return null;
  const { start, end } = selection.value;
  return start.isBefore(end) ? { a: start, b: end } : { a: end, b: start };
});
function isSelecting(day: Dayjs): boolean {
  if (!range.value) return false;
  return !day.isBefore(range.value.a, "day") && !day.isAfter(range.value.b, "day");
}

function onCellDown(day: Dayjs) {
  if (!ctx.config.value.creatable) return;
  selection.value = { start: day, end: day };
}
function onCellEnter(day: Dayjs) {
  if (selection.value) selection.value = { ...selection.value, end: day };
}

interface GhostBar {
  startCol: number;
  span: number;
  isStart: boolean;
}
function ghostBars(wi: number): GhostBar[] {
  if (!range.value) return [];
  const week = weeks.value[wi];
  const ws = week[0].startOf("day");
  const we = week[6].startOf("day");
  const a = range.value.a.startOf("day");
  const b = range.value.b.startOf("day");
  if (b.isBefore(ws) || a.isAfter(we)) return [];
  const segStart = a.isAfter(ws) ? a : ws;
  const segEnd = b.isBefore(we) ? b : we;
  const startCol = segStart.diff(ws, "day");
  const endCol = segEnd.diff(ws, "day");
  return [{ startCol, span: endCol - startCol + 1, isStart: a.isSame(segStart, "day") }];
}
function ghostStyle(g: GhostBar): CSSProperties {
  return {
    left: `calc(${(g.startCol / 7) * 100}% + 4px)`,
    width: `calc(${(g.span / 7) * 100}% - 8px)`,
    top: `${HEADER}px`,
    height: `${BAR_HEIGHT}px`,
  };
}

useEventListener("pointerup", (e: PointerEvent) => {
  if (!range.value) return;
  const { a, b } = range.value;
  // Seagull behavior: start at the next grid-aligned "now", end + default duration.
  const startMin = nearestStepMinutes(ctx.now.value, ctx.config.value.snapMinutes);
  const endMin = Math.min(MINUTES_PER_DAY, startMin + ctx.config.value.defaultCreateMinutes);
  const startTime = a.startOf("day").add(startMin, "minute").valueOf();
  const endTime = b.startOf("day").add(endMin, "minute").valueOf();
  const finalRange =
    startTime <= endTime ? { startTime, endTime } : { startTime: endTime, endTime: startTime };
  ctx.requestCreate(finalRange, { x: e.clientX, y: e.clientY });
  selection.value = null;
});
</script>

<style scoped lang="scss">
.bc-month {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;

  &__weekdays {
    flex: 0 0 auto;
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    border-bottom: 1px solid var(--bc-border);
    background: var(--bc-bg-panel);
  }
  &__wd {
    padding: 9px 0;
    text-align: center;
    font-size: var(--bc-fs-xs);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    color: var(--bc-text-dim);
  }

  &__body {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }
  &__row {
    position: relative;
    flex: 1;
    min-height: 0;
  }

  &__cells {
    position: absolute;
    inset: 0;
    display: grid;
    grid-template-columns: repeat(7, 1fr);
  }
  &__bars {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }
}

.bc-cell {
  position: relative;
  min-width: 0;
  border-left: 1px solid var(--bc-grid-line);
  border-top: 1px solid var(--bc-grid-line);
  cursor: pointer;
  transition: background 0.15s;

  &:first-child {
    border-left: none;
  }
  &.other-month {
    background: color-mix(in srgb, var(--bc-text-faint) 5%, transparent);
  }
  &.other-month .bc-cell__num {
    color: var(--bc-text-faint);
  }
  &.weekend:not(.other-month) {
    background: color-mix(in srgb, var(--bc-text-faint) 3%, transparent);
  }
  &.selecting {
    background: var(--bc-accent-soft);
  }
  &:hover {
    background: var(--bc-bg-hover);
  }

  &__head {
    display: flex;
    justify-content: flex-end;
    padding: 4px 4px 0;
  }
  &__num {
    display: grid;
    place-items: center;
    min-width: 24px;
    height: 24px;
    padding: 0 5px;
    font-size: var(--bc-fs-sm);
    font-weight: 600;
    color: var(--bc-text);
    background: transparent;
    border: none;
    border-radius: 999px;
    cursor: pointer;
    font-variant-numeric: tabular-nums;

    &:hover {
      background: var(--bc-bg-elev);
    }
  }
  &.today &__num {
    color: var(--bc-event-text);
    background: var(--bc-accent-grad);
    box-shadow: 0 2px 10px var(--bc-glow);
  }

  &__more {
    position: absolute;
    left: 6px;
    bottom: 4px;
    padding: 0;
    font-size: var(--bc-fs-xs);
    color: var(--bc-text-dim);
    background: transparent;
    border: none;
    cursor: pointer;

    &:hover {
      color: var(--bc-accent);
    }
  }
}

.bc-bar {
  position: absolute;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 0 8px;
  font-size: var(--bc-fs-xs);
  text-align: left;
  color: var(--bc-text);
  background: color-mix(in srgb, var(--bc-event-accent) 20%, transparent);
  border: none;
  border-left: 3px solid var(--bc-event-accent);
  border-radius: 5px;
  cursor: pointer;
  overflow: hidden;
  pointer-events: auto;
  transition: background 0.15s, filter 0.15s;

  &:hover {
    background: color-mix(in srgb, var(--bc-event-accent) 32%, transparent);
    filter: brightness(1.05);
  }
  // Continuation segments butt against the day boundary on the clipped side.
  &.no-head {
    border-left: none;
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }
  &.no-tail {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }

  &__time {
    color: var(--bc-text-dim);
    font-variant-numeric: tabular-nums;
    flex: 0 0 auto;
  }
  &__title {
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &--ghost {
    z-index: 20;
    color: var(--bc-accent);
    background: var(--bc-accent-soft);
    border: 1.5px dashed var(--bc-accent);
    box-shadow: 0 4px 14px var(--bc-glow);

    .bc-bar__title {
      color: var(--bc-accent);
    }
  }
}
</style>

<template>
  <div class="bc-dayweek" :class="`is-${ctx.view.value}`">
    <!-- column headers -->
    <div class="bc-dayweek__head">
      <div class="bc-dayweek__head-gutter" />
      <div class="bc-dayweek__head-cols">
        <button
          v-for="day in rowDays"
          :key="day.valueOf()"
          class="bc-colhead"
          :class="{ today: isToday(day), weekend: isWeekend(day) }"
          type="button"
          @click="onHeadClick(day)"
        >
          <span class="bc-colhead__wd">{{ weekdayShort(day) }}</span>
          <span class="bc-colhead__num">{{ day.date() }}</span>
        </button>
      </div>
    </div>

    <!-- scrollable time grid -->
    <div ref="scrollEl" class="bc-dayweek__scroll">
      <div v-if="todayVisible" class="bc-now-label" :style="{ top: `${nowTop}px` }">
        {{ ctx.formatTime(ctx.now.value) }}
      </div>
      <div class="bc-dayweek__grid-wrap">
        <TimeAxis />
        <div
          ref="gridEl"
          class="bc-grid"
          :style="{ height: `${geometry.dayHeight}px` }"
          @pointerdown="onPointerDown"
        >
          <div
            v-for="h in 23"
            :key="h"
            class="bc-hourline"
            :style="{ top: `${h * geometry.hourHeight}px` }"
          />
          <div class="bc-cols">
            <div
              v-for="col in columns"
              :key="col.day.valueOf()"
              class="bc-daycol"
              :class="{ today: isToday(col.day), weekend: isWeekend(col.day) }"
            >
              <NowIndicator v-if="isToday(col.day)" />
              <EventBlock
                v-for="pe in col.events"
                :key="pe.event.id"
                :positioned="pe"
                :day="col.day"
                :column-width="columnWidth"
              />
            </div>
          </div>
          <CreateGhost v-if="draft" :draft="draft" :column-width="columnWidth" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from "vue";
import type { Dayjs } from "dayjs";
import { useElementBounding } from "@vueuse/core";

import TimeAxis from "../TimeAxis.vue";
import NowIndicator from "../NowIndicator.vue";
import EventBlock from "../event/EventBlock.vue";
import CreateGhost from "../event/CreateGhost.vue";

import { useCalendar } from "@/composables/use-context";
import { useDragCreate } from "@/composables/use-drag-create";
import { layoutDay } from "@/core/layout";

const ctx = useCalendar();
const geometry = computed(() => ctx.geometry.value);

const rowDays = computed<Dayjs[]>(() => ctx.days.value[0]);
const columns = computed(() =>
  rowDays.value.map((day) => ({
    day,
    events: layoutDay(day, ctx.events.value, geometry.value),
  })),
);

const gridEl = ref<HTMLElement>();
const { width: gridWidth } = useElementBounding(gridEl);
const columnWidth = computed(() => gridWidth.value / Math.max(1, rowDays.value.length));

const { draft, onPointerDown } = useDragCreate({
  container: gridEl,
  days: rowDays,
  geometry,
  enabled: computed(() => ctx.config.value.creatable),
  defaultCreateMinutes: computed(() => ctx.config.value.defaultCreateMinutes),
  onCreate: (range, anchor) => ctx.requestCreate(range, anchor),
});

function isToday(day: Dayjs): boolean {
  return day.isSame(ctx.now.value, "day");
}
function isWeekend(day: Dayjs): boolean {
  const d = day.day();
  return d === 0 || d === 6;
}
function weekdayShort(day: Dayjs): string {
  return ctx.messages.value.weekdaysShort[day.day()];
}
function onHeadClick(day: Dayjs) {
  if (ctx.view.value === "week") {
    ctx.setAnchor(day);
    ctx.setView("day");
  }
  ctx.emitDateClick(day);
}

const todayVisible = computed(() => rowDays.value.some((d) => isToday(d)));
const nowTop = computed(() => geometry.value.dateToY(ctx.now.value));

// Auto-scroll near working hours on mount / view change.
const scrollEl = ref<HTMLElement>();
function scrollToWorkingHours() {
  nextTick(() => {
    if (scrollEl.value) scrollEl.value.scrollTop = geometry.value.hourHeight * 7.5;
  });
}
onMounted(scrollToWorkingHours);
watch(() => ctx.view.value, scrollToWorkingHours);
</script>

<style scoped lang="scss">
.bc-dayweek {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;

  &__head {
    flex: 0 0 auto;
    display: flex;
    border-bottom: 1px solid var(--bc-border);
    background: var(--bc-bg-panel);
  }
  &__head-gutter {
    flex: 0 0 var(--bc-gutter-width);
    width: var(--bc-gutter-width);
  }
  &__head-cols {
    flex: 1;
    display: flex;
  }

  &__scroll {
    position: relative;
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    overflow-x: hidden;
  }
  &__grid-wrap {
    display: flex;
    align-items: stretch;
  }
}

.bc-colhead {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 9px 4px;
  background: transparent;
  border: none;
  border-left: 1px solid var(--bc-grid-line);
  cursor: pointer;
  transition: background 0.18s;

  &:first-child {
    border-left: none;
  }
  &__wd {
    font-size: var(--bc-fs-xs);
    color: var(--bc-text-dim);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  &__num {
    display: grid;
    place-items: center;
    min-width: 30px;
    height: 30px;
    padding: 0 6px;
    font-size: var(--bc-fs-lg);
    font-weight: 600;
    border-radius: 999px;
    font-variant-numeric: tabular-nums;
  }
  &.weekend &__wd {
    color: var(--bc-text-faint);
  }
  &:hover {
    background: var(--bc-bg-hover);
  }
  &.today &__num {
    color: var(--bc-event-text);
    background: var(--bc-accent-grad);
    box-shadow: 0 3px 12px var(--bc-glow);
  }
  &.today &__wd {
    color: var(--bc-accent);
  }
}

.bc-grid {
  position: relative;
  flex: 1;
  min-width: 0;
}
.bc-hourline {
  position: absolute;
  left: 0;
  right: 0;
  height: 0;
  border-top: 1px solid var(--bc-grid-line);
}
.bc-cols {
  position: absolute;
  inset: 0;
  display: flex;
}
.bc-daycol {
  position: relative;
  flex: 1;
  min-width: 0;
  border-left: 1px solid var(--bc-grid-line);

  &:first-child {
    border-left: none;
  }
  &.today {
    background: var(--bc-today-bg);
  }
  &.weekend:not(.today) {
    background: color-mix(in srgb, var(--bc-text-faint) 4%, transparent);
  }
}

.bc-now-label {
  position: absolute;
  left: 0;
  width: var(--bc-gutter-width);
  transform: translateY(-50%);
  text-align: center;
  font-size: var(--bc-fs-xs);
  font-weight: 600;
  color: var(--bc-now);
  z-index: 7;
  pointer-events: none;
  font-variant-numeric: tabular-nums;
}
</style>

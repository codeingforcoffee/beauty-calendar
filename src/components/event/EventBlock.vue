<template>
  <div
    class="bc-event"
    :class="{
      'is-dragging': dragging,
      'is-static': !editable,
      'continues-before': positioned.continuesBefore,
      'continues-after': positioned.continuesAfter,
    }"
    :style="style"
    @pointerdown.stop="onBodyPointerDown"
    @contextmenu.prevent.stop="onContextMenu"
  >
    <span class="bc-event__accent" />

    <span
      v-if="editable"
      class="bc-event__handle top"
      @pointerdown.stop="onResizeTopPointerDown"
    />

    <div class="bc-event__body">
      <span class="bc-event__title">{{ displayTitle }}</span>
      <span v-if="showMeta" class="bc-event__time">{{ timeLabel }}</span>
      <span v-if="showMeta && positioned.event.creator" class="bc-event__creator">
        {{ m.by }} · {{ positioned.event.creator }}
      </span>
    </div>

    <span
      v-if="editable"
      class="bc-event__handle bottom"
      @pointerdown.stop="onResizeBottomPointerDown"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, toRef, type CSSProperties } from "vue";
import dayjs, { type Dayjs } from "dayjs";

import { useCalendar } from "@/composables/use-context";
import { useDragMove } from "@/composables/use-drag-move";
import { isSameDay } from "@/core/time";
import { MINUTES_PER_HOUR } from "@/core/constants";
import type { PositionedEvent } from "@/core/types";

const props = defineProps<{
  positioned: PositionedEvent;
  /** The column's day (== event's day for editable single-day events). */
  day: Dayjs;
  /** Pixel width of one day column. */
  columnWidth: number;
}>();

const ctx = useCalendar();
const m = computed(() => ctx.messages.value);

const event = toRef(() => props.positioned.event);
const sameDay = computed(() => isSameDay(event.value.startTime, event.value.endTime));
const editable = computed(() => ctx.config.value.editable && sameDay.value);

const { dragging, ghost, onBodyPointerDown, onResizeTopPointerDown, onResizeBottomPointerDown } =
  useDragMove({
    event,
    geometry: ctx.geometry,
    editable,
    minEventMinutes: computed(() => ctx.config.value.minEventMinutes),
    columnWidth: toRef(() => props.columnWidth),
    allowDayShift: computed(() => ctx.view.value === "week"),
    onUpdate: (range) => ctx.requestUpdate(event.value.id, range),
    onClick: () => ctx.emitEventClick(event.value),
  });

const accent = computed(() => ctx.eventColor(event.value));

const minHeight = computed(
  () => (ctx.config.value.minEventMinutes / MINUTES_PER_HOUR) * ctx.geometry.value.hourHeight,
);

/** Live geometry while dragging, derived from the snapped ghost times. */
const live = computed(() => {
  if (!dragging.value || !ghost.value) return null;
  const g = ghost.value;
  const top = ctx.geometry.value.dateToY(g.startTime);
  const bottom = isSameDay(g.startTime, g.endTime)
    ? ctx.geometry.value.dateToY(g.endTime)
    : ctx.geometry.value.dayHeight;
  const dayDelta = dayjs(g.startTime).startOf("day").diff(props.day.startOf("day"), "day");
  return {
    top,
    height: Math.max(minHeight.value, bottom - top),
    translateX: dayDelta * props.columnWidth,
  };
});

const style = computed<CSSProperties>(() => {
  const lanes = Math.max(1, props.positioned.lanes);
  const laneWidth = 100 / lanes;
  const base: CSSProperties = {
    left: `calc(${props.positioned.lane * laneWidth}% + 2px)`,
    width: `calc(${laneWidth}% - 4px)`,
    "--bc-event-accent": accent.value,
  } as CSSProperties;

  if (live.value) {
    return {
      ...base,
      top: `${live.value.top}px`,
      height: `${live.value.height}px`,
      transform: `translateX(${live.value.translateX}px)`,
      zIndex: 50,
    };
  }
  return {
    ...base,
    top: `${props.positioned.top}px`,
    height: `${props.positioned.height}px`,
    zIndex: 2 + props.positioned.lane,
  };
});

const showMeta = computed(() => props.positioned.height >= 46);

const displayTitle = computed(() => event.value.title || m.value.untitled);

const timeLabel = computed(
  () => `${ctx.formatTime(event.value.startTime)} – ${ctx.formatTime(event.value.endTime)}`,
);

function onContextMenu(e: MouseEvent) {
  ctx.openEventMenu(event.value, { x: e.clientX, y: e.clientY });
}
</script>

<style scoped lang="scss">
.bc-event {
  position: absolute;
  overflow: hidden;
  border-radius: var(--bc-radius-sm);
  padding: 4px 8px 4px 11px;
  color: var(--bc-text);
  background:
    linear-gradient(
      180deg,
      color-mix(in srgb, var(--bc-event-accent) 26%, var(--bc-bg-panel)),
      color-mix(in srgb, var(--bc-event-accent) 16%, var(--bc-bg-panel))
    );
  border: 1px solid color-mix(in srgb, var(--bc-event-accent) 45%, transparent);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.25);
  cursor: pointer;
  user-select: none;
  transition: box-shadow 0.18s, filter 0.18s;

  &__accent {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background: var(--bc-event-accent);
    box-shadow: 0 0 10px color-mix(in srgb, var(--bc-event-accent) 70%, transparent);
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: 1px;
    height: 100%;
    min-width: 0;
  }
  &__title {
    font-size: var(--bc-fs-sm);
    font-weight: 600;
    line-height: 1.3;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  &__time {
    font-size: var(--bc-fs-xs);
    color: var(--bc-text-dim);
    font-variant-numeric: tabular-nums;
  }
  &__creator {
    font-size: var(--bc-fs-xs);
    color: var(--bc-text-faint);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__handle {
    position: absolute;
    left: 0;
    right: 0;
    height: 7px;
    cursor: ns-resize;
    z-index: 3;
    &.top {
      top: 0;
    }
    &.bottom {
      bottom: 0;
    }
  }

  &:hover {
    box-shadow:
      0 4px 16px rgba(0, 0, 0, 0.32),
      0 0 0 1px color-mix(in srgb, var(--bc-event-accent) 60%, transparent);
  }
  &.is-dragging {
    filter: brightness(1.08);
    box-shadow: 0 10px 28px rgba(0, 0, 0, 0.5);
    cursor: grabbing;
  }
  &.is-static {
    cursor: default;
  }
  &.continues-before {
    border-top-left-radius: 0;
    border-top-right-radius: 0;
    border-top-style: dashed;
  }
  &.continues-after {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    border-bottom-style: dashed;
  }
}
</style>

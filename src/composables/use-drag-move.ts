import { computed, ref, type Ref } from "vue";
import dayjs from "dayjs";

import type { TimeGeometry } from "@/core/time";
import { isSameDay } from "@/core/time";
import { DRAG_THRESHOLD_PX, MINUTES_PER_HOUR } from "@/core/constants";
import type { CalendarEvent, TimeRange } from "@/core/types";

type DragMode = "move" | "resize-top" | "resize-bottom";

interface DragMoveOptions {
  event: Ref<CalendarEvent>;
  geometry: Ref<TimeGeometry>;
  editable: Ref<boolean>;
  minEventMinutes: Ref<number>;
  /** Pixel width of one day column — enables horizontal day-shift in week view. */
  columnWidth: Ref<number>;
  /** Whether horizontal movement should re-day the event (week view only). */
  allowDayShift: Ref<boolean>;
  onUpdate: (range: TimeRange) => void;
  onClick: () => void;
}

/**
 * Move / resize an existing event with grid snapping.
 *
 * - Dragging the body shifts time (and, in week view, the day).
 * - Dragging the top / bottom handles resizes within the same day.
 * - A press that never crosses the drag threshold is treated as a click.
 */
export function useDragMove(options: DragMoveOptions) {
  const {
    event,
    geometry,
    editable,
    minEventMinutes,
    columnWidth,
    allowDayShift,
    onUpdate,
    onClick,
  } = options;

  const dragging = ref(false);
  const ghost = ref<TimeRange | null>(null);

  /** Same-day events can be freely resized; multi-day ones can only be moved. */
  const sameDay = computed(() => isSameDay(event.value.startTime, event.value.endTime));

  let mode: DragMode = "move";
  let startX = 0;
  let startY = 0;
  let origStart = 0;
  let origEnd = 0;
  let moved = false;

  function deltaMinutes(clientY: number): number {
    const pxPerMinute = geometry.value.hourHeight / MINUTES_PER_HOUR;
    const raw = (clientY - startY) / pxPerMinute;
    return Math.round(raw / geometry.value.snapMinutes) * geometry.value.snapMinutes;
  }

  function dayShift(clientX: number): number {
    if (!allowDayShift.value || columnWidth.value <= 0) return 0;
    return Math.round((clientX - startX) / columnWidth.value);
  }

  function compute(e: PointerEvent): TimeRange {
    const dMin = deltaMinutes(e.clientY);
    const start = dayjs(origStart);
    const end = dayjs(origEnd);
    const minDur = minEventMinutes.value;

    if (mode === "resize-top") {
      const dayStart = start.startOf("day").valueOf();
      const maxStart = end.subtract(minDur, "minute").valueOf();
      const next = Math.min(maxStart, Math.max(dayStart, start.add(dMin, "minute").valueOf()));
      return { startTime: next, endTime: origEnd };
    }

    if (mode === "resize-bottom") {
      const dayEnd = end.endOf("day").valueOf();
      const minEnd = start.add(minDur, "minute").valueOf();
      const next = Math.max(minEnd, Math.min(dayEnd, end.add(dMin, "minute").valueOf()));
      return { startTime: origStart, endTime: next };
    }

    // move — shift both ends by the same time + day delta, preserving duration.
    const shift = dayShift(e.clientX);
    const nextStart = start.add(dMin, "minute").add(shift, "day").valueOf();
    const nextEnd = end.add(dMin, "minute").add(shift, "day").valueOf();
    return { startTime: nextStart, endTime: nextEnd };
  }

  function onMove(e: PointerEvent) {
    if (!moved) {
      const dist = Math.hypot(e.clientX - startX, e.clientY - startY);
      if (dist <= DRAG_THRESHOLD_PX) return;
      moved = true;
      dragging.value = true;
    }
    ghost.value = compute(e);
  }

  function onUp(e: PointerEvent) {
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onUp);
    const result = moved ? compute(e) : null;
    dragging.value = false;
    ghost.value = null;
    if (result) {
      onUpdate(result);
    } else {
      onClick();
    }
  }

  function begin(e: PointerEvent, nextMode: DragMode) {
    if (e.button !== 0) return;
    // Resizing requires an editable, single-day event.
    if ((nextMode === "resize-top" || nextMode === "resize-bottom") && !sameDay.value) return;
    if (!editable.value) {
      // Not editable: still allow click-through for selection.
      if (nextMode === "move") onClick();
      return;
    }
    e.stopPropagation();
    mode = nextMode;
    startX = e.clientX;
    startY = e.clientY;
    origStart = event.value.startTime;
    origEnd = event.value.endTime;
    moved = false;
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  return {
    dragging,
    ghost,
    sameDay,
    onBodyPointerDown: (e: PointerEvent) => begin(e, "move"),
    onResizeTopPointerDown: (e: PointerEvent) => begin(e, "resize-top"),
    onResizeBottomPointerDown: (e: PointerEvent) => begin(e, "resize-bottom"),
  };
}

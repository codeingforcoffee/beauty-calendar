import { ref, type Ref } from "vue";
import type { Dayjs } from "dayjs";

import { applyTimeToDay, type TimeGeometry } from "@/core/time";
import { DRAG_THRESHOLD_PX, MINUTES_PER_DAY } from "@/core/constants";
import type { CreateDraft, CreateSegment, TimeRange } from "@/core/types";

export interface CreateAnchor {
  x: number;
  y: number;
}

interface DragCreateOptions {
  /** The full-height grid element (24h tall). */
  container: Ref<HTMLElement | undefined>;
  /** The day(s) shown in this grid row — length 1 (day view) or 7 (week view). */
  days: Ref<Dayjs[]>;
  geometry: Ref<TimeGeometry>;
  enabled: Ref<boolean>;
  defaultCreateMinutes: Ref<number>;
  onCreate: (range: TimeRange, anchor: CreateAnchor) => void;
}

/**
 * Drag-to-create on a day/week time grid — supports both same-day and
 * **cross-day** gestures.
 *
 * Press anchors a start point; dragging grows a snapped "ghost". Within a single
 * column the ghost is a vertical band; dragging across columns spans multiple days
 * (start-day tail + full intermediate days + end-day head). Pointer-up reports the
 * resolved range plus the release coordinates (used to anchor a confirm dialog).
 */
export function useDragCreate(options: DragCreateOptions) {
  const { container, days, geometry, enabled, defaultCreateMinutes, onCreate } = options;

  const draft = ref<CreateDraft | null>(null);

  let startClientX = 0;
  let startClientY = 0;
  let lastClientX = 0;
  let lastClientY = 0;
  let moved = false;

  const columnCount = () => Math.max(1, days.value.length);

  function rect(): DOMRect {
    return container.value!.getBoundingClientRect();
  }

  function resolveDayIndex(clientX: number): number {
    const r = rect();
    const colWidth = r.width / columnCount();
    const idx = Math.floor((clientX - r.left) / colWidth);
    return Math.min(columnCount() - 1, Math.max(0, idx));
  }

  function snappedYWithin(clientY: number): number {
    const r = rect();
    const y = Math.min(geometry.value.dayHeight, Math.max(0, clientY - r.top));
    return geometry.value.snapY(y);
  }

  function buildDraft(): CreateDraft | null {
    if (!container.value) return null;
    const geo = geometry.value;

    const pressDay = resolveDayIndex(startClientX);
    const pressY = snappedYWithin(startClientY);
    const cursorDay = resolveDayIndex(lastClientX);
    const cursorY = snappedYWithin(lastClientY);

    // Order the two points so `start` is never after `end`.
    let start: { day: number; y: number };
    let end: { day: number; y: number };
    if (cursorDay > pressDay) {
      start = { day: pressDay, y: pressY };
      end = { day: cursorDay, y: cursorY };
    } else if (cursorDay < pressDay) {
      start = { day: cursorDay, y: cursorY };
      end = { day: pressDay, y: pressY };
    } else {
      start = { day: pressDay, y: Math.min(pressY, cursorY) };
      end = { day: pressDay, y: Math.max(pressY, cursorY) };
    }

    let startMin = geo.yToSnappedMinutes(start.y);
    let endMin = geo.yToSnappedMinutes(end.y);

    const sameDay = start.day === end.day;
    const segments: CreateSegment[] = [];

    if (sameDay) {
      // Pure click (or too small) → default-length block anchored at the press.
      if (!moved || endMin - startMin < geo.snapMinutes) {
        startMin = geo.yToSnappedMinutes(pressY);
        endMin = Math.min(MINUTES_PER_DAY, startMin + defaultCreateMinutes.value);
      }
      const top = geo.minutesToY(startMin);
      segments.push({ dayIndex: start.day, top, height: geo.minutesToY(endMin) - top });
    } else {
      const startTop = geo.minutesToY(startMin);
      segments.push({ dayIndex: start.day, top: startTop, height: geo.dayHeight - startTop });
      for (let d = start.day + 1; d < end.day; d++) {
        segments.push({ dayIndex: d, top: 0, height: geo.dayHeight });
      }
      segments.push({ dayIndex: end.day, top: 0, height: geo.minutesToY(endMin) });
    }

    const startTime = applyTimeToDay(days.value[start.day], geo.minutesToHourMinute(startMin));
    const endTime = applyTimeToDay(days.value[end.day], geo.minutesToHourMinute(endMin));

    return { segments, startTime, endTime };
  }

  function onMove(e: PointerEvent) {
    lastClientX = e.clientX;
    lastClientY = e.clientY;
    if (!moved) {
      const dist = Math.hypot(e.clientX - startClientX, e.clientY - startClientY);
      if (dist > DRAG_THRESHOLD_PX) moved = true;
    }
    draft.value = buildDraft();
  }

  function onUp(e: PointerEvent) {
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onUp);
    const result = draft.value;
    draft.value = null;
    if (result) {
      onCreate(
        { startTime: result.startTime, endTime: result.endTime },
        { x: e.clientX, y: e.clientY },
      );
    }
  }

  function onPointerDown(e: PointerEvent) {
    if (!enabled.value || e.button !== 0 || !container.value) return;
    startClientX = e.clientX;
    startClientY = e.clientY;
    lastClientX = e.clientX;
    lastClientY = e.clientY;
    moved = false;
    draft.value = buildDraft();
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  return { draft, onPointerDown };
}

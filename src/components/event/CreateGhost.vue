<template>
  <div
    v-for="(seg, i) in draft.segments"
    :key="i"
    class="bc-ghost"
    :class="{ 'is-head': i === 0, 'is-tail': i === draft.segments.length - 1 }"
    :style="segStyle(seg)"
  >
    <template v-if="i === 0">
      <span class="bc-ghost__label">{{ m.createNew }}</span>
      <span class="bc-ghost__time">{{ timeLabel }}</span>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, type CSSProperties } from "vue";

import { useCalendar } from "@/composables/use-context";
import type { CreateDraft, CreateSegment } from "@/core/types";

const props = defineProps<{
  draft: CreateDraft;
  columnWidth: number;
}>();

const ctx = useCalendar();
const m = computed(() => ctx.messages.value);

function segStyle(seg: CreateSegment): CSSProperties {
  return {
    left: `calc(${seg.dayIndex * props.columnWidth}px + 2px)`,
    width: `calc(${props.columnWidth}px - 4px)`,
    top: `${seg.top}px`,
    height: `${seg.height}px`,
  };
}

const timeLabel = computed(
  () => `${ctx.formatTime(props.draft.startTime)} – ${ctx.formatTime(props.draft.endTime)}`,
);
</script>

<style scoped lang="scss">
.bc-ghost {
  position: absolute;
  z-index: 40;
  border-radius: var(--bc-radius-sm);
  padding: 5px 9px;
  background: var(--bc-accent-soft);
  border: 1.5px dashed var(--bc-accent);
  box-shadow: 0 0 0 3px var(--bc-accent-faint), 0 6px 18px var(--bc-glow);
  color: var(--bc-accent);
  pointer-events: none;
  overflow: hidden;
  backdrop-filter: blur(2px);

  // Multi-day segments join seamlessly at the day boundaries.
  &:not(.is-head) {
    border-top-left-radius: 0;
    border-top-right-radius: 0;
    border-top-style: solid;
  }
  &:not(.is-tail) {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    border-bottom-style: solid;
  }

  &__label {
    display: block;
    font-size: var(--bc-fs-sm);
    font-weight: 600;
    white-space: nowrap;
  }
  &__time {
    display: block;
    font-size: var(--bc-fs-xs);
    color: var(--bc-text);
    opacity: 0.85;
    font-variant-numeric: tabular-nums;
  }
}
</style>

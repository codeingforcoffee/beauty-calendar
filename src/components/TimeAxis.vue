<template>
  <div class="bc-axis" :style="{ height: `${geometry.dayHeight}px` }">
    <div
      v-for="hour in hours"
      :key="hour"
      class="bc-axis__label"
      :style="{ top: `${hour * geometry.hourHeight}px` }"
    >
      {{ label(hour) }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

import { useCalendar } from "@/composables/use-context";

const ctx = useCalendar();
const geometry = computed(() => ctx.geometry.value);

// Skip 0:00 so the first label isn't clipped at the top edge.
const hours = Array.from({ length: 23 }, (_, i) => i + 1);

function label(hour: number): string {
  const m = ctx.messages.value;
  if (m.hour12) {
    const h = hour % 12 || 12;
    return `${h} ${hour < 12 ? "AM" : "PM"}`;
  }
  return `${String(hour).padStart(2, "0")}:00`;
}
</script>

<style scoped lang="scss">
.bc-axis {
  position: relative;
  flex: 0 0 var(--bc-gutter-width);
  width: var(--bc-gutter-width);

  &__label {
    position: absolute;
    right: 10px;
    transform: translateY(-50%);
    font-size: var(--bc-fs-xs);
    font-variant-numeric: tabular-nums;
    color: var(--bc-text-faint);
    white-space: nowrap;
    user-select: none;
  }
}
</style>

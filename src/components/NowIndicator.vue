<template>
  <div class="bc-now" :style="{ top: `${top}px` }">
    <span class="bc-now__dot" />
    <span class="bc-now__line" />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

import { useCalendar } from "@/composables/use-context";

const ctx = useCalendar();
const top = computed(() => ctx.geometry.value.dateToY(ctx.now.value));
</script>

<style scoped lang="scss">
.bc-now {
  position: absolute;
  left: 0;
  right: 0;
  height: 0;
  z-index: 6;
  pointer-events: none;

  &__line {
    display: block;
    height: 2px;
    background: var(--bc-now);
    box-shadow: 0 0 8px color-mix(in srgb, var(--bc-now) 70%, transparent);
  }
  &__dot {
    position: absolute;
    left: -4px;
    top: -3px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--bc-now);
    box-shadow: 0 0 8px color-mix(in srgb, var(--bc-now) 80%, transparent);
  }
}
</style>

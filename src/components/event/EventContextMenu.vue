<template>
  <div
    class="bc-menu-mask"
    @pointerdown.self="emit('close')"
    @contextmenu.prevent="emit('close')"
  >
    <div ref="menu" class="bc-menu" :style="menuStyle">
      <div class="bc-menu__title">
        <span class="bc-menu__dot" :style="{ background: accent }" />
        <span class="bc-menu__name">{{ event.title || m.untitled }}</span>
      </div>
      <button class="bc-menu__item danger" type="button" @click="emit('delete')">
        <svg viewBox="0 0 24 24" width="15" height="15">
          <path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13" />
        </svg>
        {{ m.delete }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, type CSSProperties } from "vue";

import { useCalendar } from "@/composables/use-context";
import type { CalendarEvent } from "@/core/types";

const props = defineProps<{
  event: CalendarEvent;
  anchor: { x: number; y: number };
}>();

const emit = defineEmits<{
  (e: "delete"): void;
  (e: "close"): void;
}>();

const ctx = useCalendar();
const m = computed(() => ctx.messages.value);
const accent = computed(() => ctx.eventColor(props.event));

const menu = ref<HTMLElement>();
const menuStyle = ref<CSSProperties>({ left: "0px", top: "0px", opacity: 0 });

onMounted(async () => {
  await nextTick();
  const el = menu.value;
  const w = el?.offsetWidth ?? 200;
  const h = el?.offsetHeight ?? 90;
  const pad = 8;
  const left = Math.min(Math.max(pad, props.anchor.x), window.innerWidth - w - pad);
  const top = Math.min(Math.max(pad, props.anchor.y), window.innerHeight - h - pad);
  menuStyle.value = { left: `${left}px`, top: `${top}px`, opacity: 1 };
});
</script>

<style scoped lang="scss">
.bc-menu-mask {
  position: fixed;
  inset: 0;
  z-index: 1100;
}
.bc-menu {
  position: fixed;
  min-width: 180px;
  padding: 6px;
  background: var(--bc-bg-elev);
  border: 1px solid var(--bc-border-strong);
  border-radius: var(--bc-radius-md);
  box-shadow: var(--bc-shadow);
  transition: opacity 0.1s ease;

  &__title {
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 6px 8px 8px;
    border-bottom: 1px solid var(--bc-border);
    margin-bottom: 4px;
  }
  &__dot {
    flex: 0 0 auto;
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }
  &__name {
    font-size: var(--bc-fs-sm);
    font-weight: 600;
    color: var(--bc-text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  &__item {
    display: flex;
    align-items: center;
    gap: 9px;
    width: 100%;
    padding: 8px 10px;
    font-size: var(--bc-fs-md);
    font-weight: 500;
    color: var(--bc-text);
    background: transparent;
    border: none;
    border-radius: var(--bc-radius-sm);
    cursor: pointer;
    text-align: left;
    transition: background 0.14s, color 0.14s;

    svg {
      fill: none;
      stroke: currentColor;
      stroke-width: 1.6;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
    &.danger {
      color: #f87171;
      &:hover {
        background: color-mix(in srgb, #f87171 14%, transparent);
      }
    }
  }
}
</style>

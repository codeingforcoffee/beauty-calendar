<template>
  <div class="bc-confirm-mask" @pointerdown.self="emit('cancel')">
    <div ref="card" class="bc-confirm" :style="cardStyle" @pointerdown.stop>
      <div class="bc-confirm__bar" :style="{ background: accent }" />
      <header class="bc-confirm__head">{{ m.createNew }}</header>

      <input
        ref="input"
        v-model="title"
        class="bc-confirm__input"
        :placeholder="m.titlePlaceholder"
        @keydown.enter.prevent="onConfirm"
        @keydown.esc.prevent="emit('cancel')"
      />

      <div class="bc-confirm__meta">
        <svg viewBox="0 0 24 24" width="14" height="14" class="bc-confirm__icon">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
        <span>{{ timeText }}</span>
      </div>
      <div v-if="creator" class="bc-confirm__meta">
        <svg viewBox="0 0 24 24" width="14" height="14" class="bc-confirm__icon">
          <circle cx="12" cy="8" r="3.5" />
          <path d="M5 20a7 7 0 0114 0" />
        </svg>
        <span>{{ m.by }} · {{ creator }}</span>
      </div>

      <footer class="bc-confirm__actions">
        <button class="bc-confirm__btn ghost" type="button" @click="emit('cancel')">
          {{ m.cancel }}
        </button>
        <button class="bc-confirm__btn primary" type="button" @click="onConfirm">
          {{ m.confirm }}
        </button>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, type CSSProperties } from "vue";

import { useCalendar } from "@/composables/use-context";
import { formatDate } from "@/core/format";
import { isSameDay } from "@/core/time";
import type { TimeRange } from "@/core/types";

const props = defineProps<{
  range: TimeRange;
  anchor: { x: number; y: number };
  creator?: string;
}>();

const emit = defineEmits<{
  (e: "confirm", title: string): void;
  (e: "cancel"): void;
}>();

const ctx = useCalendar();
const m = computed(() => ctx.messages.value);
const accent = computed(() => "var(--bc-accent-grad)");

const title = ref("");

const timeText = computed(() => {
  const { startTime, endTime } = props.range;
  const startDate = formatDate(startTime, "M/D", m.value);
  if (isSameDay(startTime, endTime)) {
    return `${startDate}  ${ctx.formatTime(startTime)} – ${ctx.formatTime(endTime)}`;
  }
  const endDate = formatDate(endTime, "M/D", m.value);
  return `${startDate} ${ctx.formatTime(startTime)} → ${endDate} ${ctx.formatTime(endTime)}`;
});

function onConfirm() {
  emit("confirm", title.value.trim() || m.value.untitled);
}

// Position the card near the release point, clamped to the viewport.
const card = ref<HTMLElement>();
const input = ref<HTMLInputElement>();
const cardStyle = ref<CSSProperties>({ left: "0px", top: "0px", opacity: 0 });

onMounted(async () => {
  await nextTick();
  const el = card.value;
  const w = el?.offsetWidth ?? 280;
  const h = el?.offsetHeight ?? 200;
  const pad = 10;
  const left = Math.min(Math.max(pad, props.anchor.x + 8), window.innerWidth - w - pad);
  const top = Math.min(Math.max(pad, props.anchor.y + 8), window.innerHeight - h - pad);
  cardStyle.value = { left: `${left}px`, top: `${top}px`, opacity: 1 };
  input.value?.focus();
});
</script>

<style scoped lang="scss">
.bc-confirm-mask {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(3, 6, 14, 0.35);
  backdrop-filter: blur(1px);
}

.bc-confirm {
  position: fixed;
  width: 280px;
  padding: 16px 16px 14px;
  background: var(--bc-bg-elev);
  border: 1px solid var(--bc-border-strong);
  border-radius: var(--bc-radius-md);
  box-shadow: var(--bc-shadow), 0 0 0 1px var(--bc-accent-faint);
  overflow: hidden;
  transition: opacity 0.12s ease;

  &__bar {
    position: absolute;
    inset: 0 0 auto 0;
    height: 3px;
  }
  &__head {
    font-size: var(--bc-fs-sm);
    font-weight: 600;
    color: var(--bc-text-dim);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 10px;
  }
  &__input {
    width: 100%;
    height: 38px;
    padding: 0 12px;
    font-size: var(--bc-fs-lg);
    font-weight: 600;
    color: var(--bc-text);
    background: var(--bc-bg-panel);
    border: 1px solid var(--bc-border);
    border-radius: var(--bc-radius-sm);
    outline: none;
    transition: border-color 0.18s, box-shadow 0.18s;

    &::placeholder {
      color: var(--bc-text-faint);
      font-weight: 400;
    }
    &:focus {
      border-color: var(--bc-accent);
      box-shadow: 0 0 0 3px var(--bc-accent-soft);
    }
  }
  &__meta {
    display: flex;
    align-items: center;
    gap: 7px;
    margin-top: 10px;
    font-size: var(--bc-fs-md);
    color: var(--bc-text-dim);
    font-variant-numeric: tabular-nums;
  }
  &__icon {
    flex: 0 0 auto;
    fill: none;
    stroke: var(--bc-accent);
    stroke-width: 1.6;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  &__actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 16px;
  }
  &__btn {
    height: 32px;
    padding: 0 16px;
    font-size: var(--bc-fs-md);
    font-weight: 600;
    border-radius: var(--bc-radius-sm);
    cursor: pointer;
    transition: filter 0.15s, border-color 0.15s, background 0.15s;

    &.ghost {
      color: var(--bc-text-dim);
      background: transparent;
      border: 1px solid var(--bc-border);
      &:hover {
        color: var(--bc-text);
        border-color: var(--bc-border-strong);
      }
    }
    &.primary {
      color: var(--bc-event-text);
      background: var(--bc-accent-grad);
      border: none;
      box-shadow: 0 4px 14px var(--bc-glow);
      &:hover {
        filter: brightness(1.08);
      }
    }
  }
}
</style>

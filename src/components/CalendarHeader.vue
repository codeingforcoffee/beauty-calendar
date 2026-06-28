<template>
  <header class="bc-header">
    <div class="bc-header__left">
      <button class="bc-today" type="button" @click="ctx.goToday()">
        <span class="bc-today__dot" />
        {{ m.today }}
      </button>
      <div class="bc-nav">
        <button class="bc-nav__btn" type="button" :aria-label="'prev'" @click="ctx.go(-1)">
          <svg viewBox="0 0 24 24" width="16" height="16"><path d="M15 6l-6 6 6 6" /></svg>
        </button>
        <button class="bc-nav__btn" type="button" :aria-label="'next'" @click="ctx.go(1)">
          <svg viewBox="0 0 24 24" width="16" height="16"><path d="M9 6l6 6-6 6" /></svg>
        </button>
      </div>
      <h2 class="bc-title">{{ title }}</h2>
    </div>

    <div class="bc-views" role="tablist">
      <span class="bc-views__glider" :style="gliderStyle" />
      <button
        v-for="(v, i) in viewOptions"
        :key="v"
        ref="tabs"
        class="bc-views__btn"
        :class="{ active: ctx.view.value === v }"
        type="button"
        role="tab"
        @click="ctx.setView(v)"
      >
        {{ m.views[v] }}
        <i v-if="i === activeIndex" class="sr-only" />
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from "vue";

import { useCalendar } from "@/composables/use-context";
import { formatDate } from "@/core/format";
import type { CalendarView } from "@/core/types";

const ctx = useCalendar();
const m = computed(() => ctx.messages.value);

const viewOptions: CalendarView[] = ["day", "week", "month"];
const activeIndex = computed(() => viewOptions.indexOf(ctx.view.value));

const title = computed(() =>
  formatDate(ctx.anchor.value, m.value.titleFormat[ctx.view.value], m.value),
);

// Sliding highlight behind the active view tab.
const gliderStyle = computed(() => ({
  transform: `translateX(${activeIndex.value * 100}%)`,
  width: `${100 / viewOptions.length}%`,
}));
</script>

<style scoped lang="scss">
.bc-header {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 18px;
  border-bottom: 1px solid var(--bc-border);
  background: linear-gradient(180deg, var(--bc-bg-panel), transparent);
  backdrop-filter: blur(6px);

  &__left {
    display: flex;
    align-items: center;
    gap: 14px;
    min-width: 0;
  }
}

.bc-title {
  margin: 0;
  font-size: var(--bc-fs-xl);
  font-weight: 600;
  letter-spacing: 0.3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bc-today {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: 32px;
  padding: 0 14px;
  font-size: var(--bc-fs-md);
  font-weight: 500;
  color: var(--bc-text);
  background: var(--bc-bg-elev);
  border: 1px solid var(--bc-border);
  border-radius: 999px;
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s, transform 0.1s;

  &__dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--bc-accent-grad);
    box-shadow: 0 0 8px var(--bc-glow);
  }
  &:hover {
    border-color: var(--bc-accent);
    box-shadow: 0 0 0 3px var(--bc-accent-soft);
  }
  &:active {
    transform: scale(0.97);
  }
}

.bc-nav {
  display: flex;
  gap: 4px;

  &__btn {
    width: 32px;
    height: 32px;
    display: grid;
    place-items: center;
    color: var(--bc-text-dim);
    background: var(--bc-bg-elev);
    border: 1px solid var(--bc-border);
    border-radius: 9px;
    cursor: pointer;
    transition: color 0.2s, border-color 0.2s, background 0.2s;

    svg {
      fill: none;
      stroke: currentColor;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
    &:hover {
      color: var(--bc-accent);
      border-color: var(--bc-accent);
      background: var(--bc-accent-soft);
    }
  }
}

.bc-views {
  position: relative;
  display: inline-flex;
  padding: 3px;
  background: var(--bc-bg-elev);
  border: 1px solid var(--bc-border);
  border-radius: 11px;

  &__glider {
    position: absolute;
    top: 3px;
    left: 3px;
    bottom: 3px;
    width: 33.33%;
    border-radius: 8px;
    background: var(--bc-accent-grad);
    box-shadow: 0 4px 14px var(--bc-glow);
    transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
    pointer-events: none;
  }
  &__btn {
    position: relative;
    z-index: 1;
    min-width: 58px;
    height: 28px;
    padding: 0 14px;
    font-size: var(--bc-fs-md);
    font-weight: 500;
    color: var(--bc-text-dim);
    background: transparent;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: color 0.25s;

    &.active {
      color: var(--bc-event-text);
    }
  }
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
}
</style>
